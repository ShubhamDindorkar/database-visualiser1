'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  MarkerType,
  NodeChange,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Firebase
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Components
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Terminal from '@/components/layout/Terminal';
import Settings from '@/components/layout/Settings';
import CreateDatabaseModal from '@/components/database/CreateDatabaseModal';
import CreateTableModal from '@/components/database/CreateTableModal';
import EditTableModal from '@/components/database/EditTableModal';
import TableNode from '@/components/database/TableNode';
import RelationshipEdge from '@/components/database/RelationshipEdge';

// Hooks and Types
import { useAuth } from '@/hooks/useAuth';
import {
  Database as DatabaseType,
  Table as TableType,
  Column,
  TerminalLog,
  Relationship,
} from '@/types/database';

// Node and Edge types for React Flow
const nodeTypes = {
  tableNode: TableNode,
};

const edgeTypes = {
  relationshipEdge: RelationshipEdge,
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);
  const [isCreateDbModalOpen, setIsCreateDbModalOpen] = useState(false);
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState(false);
  const [isEditTableModalOpen, setIsEditTableModalOpen] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);

  // Data State
  const [databases, setDatabases] = useState<DatabaseType[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);

  // React Flow state
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  // Handle logout with redirect to home
  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/');
  }, [logout, router]);

  // Auth redirect (only if not logged in initially, not after logout)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Firebase: Subscribe to databases
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'databases'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbs: DatabaseType[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        dbs.push({
          id: doc.id,
          name: data.name,
          userId: data.userId,
          db_password_hash: data.db_password_hash,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      setDatabases(dbs);
      
      // Auto-select first database if no database is selected and databases exist
      if (dbs.length > 0 && !selectedDatabaseId) {
        setSelectedDatabaseId(dbs[0].id);
      }
    });

    return () => unsubscribe();
  }, [user, selectedDatabaseId]);

  // Firebase: Subscribe to tables for selected database
  useEffect(() => {
    if (!selectedDatabaseId) {
      setTables([]);
      return;
    }

    const q = query(collection(db, 'tables'), where('databaseId', '==', selectedDatabaseId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tbls: TableType[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tbls.push({
          id: doc.id,
          name: data.name,
          databaseId: data.databaseId,
          columns: data.columns || [],
          position: data.position || { x: 100, y: 100 },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      setTables(tbls);
    });

    return () => unsubscribe();
  }, [selectedDatabaseId]);

  // Convert tables to React Flow nodes
  useEffect(() => {
    const newNodes: Node[] = tables.map((table) => ({
      id: table.id,
      type: 'tableNode',
      position: table.position,
      data: {
        table,
        onDelete: handleDeleteTable,
        isSelected: selectedTableId === table.id,
      },
    }));
    setNodes(newNodes);
  }, [tables, selectedTableId]);

  // Convert foreign key relationships to edges
  useEffect(() => {
    const newEdges: Edge[] = [];
    
    tables.forEach((table) => {
      table.columns.forEach((column) => {
        if (column.isForeignKey && column.foreignKeyReference) {
          const targetTable = tables.find((t) => t.id === column.foreignKeyReference?.tableId);
          const targetColumn = targetTable?.columns.find(
            (c) => c.id === column.foreignKeyReference?.columnId
          );

          if (targetTable && targetColumn) {
            newEdges.push({
              id: `${table.id}-${column.id}-${targetTable.id}-${targetColumn.id}`,
              source: table.id,
              target: targetTable.id,
              sourceHandle: `${column.id}-source`,
              targetHandle: `${targetColumn.id}-target`,
              type: 'relationshipEdge',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#374151',
              },
              data: {
                sourceColumn: column.name,
                targetColumn: targetColumn.name,
              },
            });
          }
        }
      });
    });

    setEdges(newEdges);
  }, [tables]);

  // Handle node position changes
  const onNodesChange = useCallback(
    async (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      // Update position in Firebase when drag ends
      for (const change of changes) {
        if (change.type === 'position' && change.position && !change.dragging) {
          const tableId = change.id;
          const newPosition = change.position;

          try {
            await updateDoc(doc(db, 'tables', tableId), {
              position: newPosition,
              updatedAt: Timestamp.now(),
            });
          } catch (error) {
            console.error('Error updating table position:', error);
          }
        }
      }
    },
    [setNodes]
  );

  // Add terminal log
  const addLog = useCallback((type: TerminalLog['type'], message: string) => {
    setTerminalLogs((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type,
        message,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Create database
  const handleCreateDatabase = useCallback(
    async (name: string, password: string) => {
      if (!user) return;

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const dbId = uuidv4();

        await setDoc(doc(db, 'databases', dbId), {
          name,
          userId: user.uid,
          db_password_hash: hashedPassword,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        addLog('success', `Database '${name}' created successfully`);
        setSelectedDatabaseId(dbId);
        setIsCreateDbModalOpen(false);
      } catch (error) {
        console.error('Error creating database:', error);
        addLog('error', `Failed to create database '${name}'`);
      }
    },
    [user, addLog]
  );

  // Delete database
  const handleDeleteDatabase = useCallback(
    async (databaseId: string) => {
      try {
        const dbName = databases.find((d) => d.id === databaseId)?.name;
        
        // Delete all tables in the database first
        const tablesToDelete = tables.filter((t) => t.databaseId === databaseId);
        for (const table of tablesToDelete) {
          await deleteDoc(doc(db, 'tables', table.id));
        }

        await deleteDoc(doc(db, 'databases', databaseId));
        
        if (selectedDatabaseId === databaseId) {
          setSelectedDatabaseId(null);
        }

        addLog('success', `Database '${dbName}' dropped successfully`);
      } catch (error) {
        console.error('Error deleting database:', error);
        addLog('error', 'Failed to delete database');
      }
    },
    [databases, tables, selectedDatabaseId, addLog]
  );

  // Create table
  const handleCreateTable = useCallback(
    async (name: string, columns: Column[]) => {
      if (!selectedDatabaseId) return;

      try {
        const tableId = uuidv4();
        
        // Calculate position for new table
        const existingTables = tables.filter((t) => t.databaseId === selectedDatabaseId);
        const xOffset = (existingTables.length % 3) * 280;
        const yOffset = Math.floor(existingTables.length / 3) * 250;

        await setDoc(doc(db, 'tables', tableId), {
          name,
          databaseId: selectedDatabaseId,
          columns,
          position: { x: 100 + xOffset, y: 100 + yOffset },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        addLog('success', `Table '${name}' created successfully`);

        // Log foreign key relationships
        columns.forEach((col) => {
          if (col.isForeignKey && col.foreignKeyReference) {
            addLog(
              'info',
              `Foreign key linked: ${name}.${col.name} → ${col.foreignKeyReference.tableName}.${col.foreignKeyReference.columnName}`
            );
          }
        });

        setIsCreateTableModalOpen(false);
      } catch (error) {
        console.error('Error creating table:', error);
        addLog('error', `Failed to create table '${name}'`);
      }
    },
    [selectedDatabaseId, tables, addLog]
  );

  // Delete table
  const handleDeleteTable = useCallback(
    async (tableId: string) => {
      try {
        const tableName = tables.find((t) => t.id === tableId)?.name;
        await deleteDoc(doc(db, 'tables', tableId));
        
        if (selectedTableId === tableId) {
          setSelectedTableId(null);
        }

        addLog('success', `Table '${tableName}' dropped successfully`);
      } catch (error) {
        console.error('Error deleting table:', error);
        addLog('error', 'Failed to delete table');
      }
    },
    [tables, selectedTableId, addLog]
  );

  // Handle edit table
  const handleEditTable = useCallback(
    (tableId: string) => {
      setEditingTableId(tableId);
      setIsEditTableModalOpen(true);
    },
    []
  );

  // Update table columns
  const handleUpdateTable = useCallback(
    async (tableId: string, columns: Column[]) => {
      try {
        const tableName = tables.find((t) => t.id === tableId)?.name;
        
        await updateDoc(doc(db, 'tables', tableId), {
          columns,
          updatedAt: Timestamp.now(),
        });

        addLog('success', `Table '${tableName}' updated successfully`);
        setIsEditTableModalOpen(false);
        setEditingTableId(null);
      } catch (error) {
        console.error('Error updating table:', error);
        addLog('error', 'Failed to update table');
      }
    },
    [tables, addLog]
  );

  // Handle terminal command
  const handleTerminalCommand = useCallback(
    (command: string) => {
      const upperCommand = command.toUpperCase().trim();

      // Simulate MySQL responses
      if (upperCommand.startsWith('SHOW DATABASES')) {
        addLog('info', '+--------------------+');
        addLog('info', '| Database           |');
        addLog('info', '+--------------------+');
        databases.forEach((db) => {
          addLog('info', `| ${db.name.padEnd(18)} |`);
        });
        addLog('info', '+--------------------+');
        addLog('success', `${databases.length} rows in set (0.00 sec)`);
      } else if (upperCommand.startsWith('SHOW TABLES')) {
        if (!selectedDatabaseId) {
          addLog('error', 'ERROR 1046 (3D000): No database selected');
        } else {
          const dbTables = tables.filter((t) => t.databaseId === selectedDatabaseId);
          addLog('info', '+--------------------+');
          addLog('info', '| Tables             |');
          addLog('info', '+--------------------+');
          dbTables.forEach((t) => {
            addLog('info', `| ${t.name.padEnd(18)} |`);
          });
          addLog('info', '+--------------------+');
          addLog('success', `${dbTables.length} rows in set (0.00 sec)`);
        }
      } else if (upperCommand.startsWith('USE ')) {
        const dbName = command.substring(4).trim().replace(';', '');
        const targetDb = databases.find(
          (d) => d.name.toLowerCase() === dbName.toLowerCase()
        );
        if (targetDb) {
          setSelectedDatabaseId(targetDb.id);
          addLog('success', 'Database changed');
        } else {
          addLog('error', `ERROR 1049 (42000): Unknown database '${dbName}'`);
        }
      } else if (upperCommand.startsWith('DESCRIBE ') || upperCommand.startsWith('DESC ')) {
        const tableName = command.split(' ')[1]?.trim().replace(';', '');
        const table = tables.find(
          (t) => t.name.toLowerCase() === tableName?.toLowerCase()
        );
        if (table) {
          addLog('info', '+-------------+-------------+------+-----+---------+-------+');
          addLog('info', '| Field       | Type        | Null | Key | Default | Extra |');
          addLog('info', '+-------------+-------------+------+-----+---------+-------+');
          table.columns.forEach((col) => {
            const keyType = col.isPrimaryKey ? 'PRI' : col.isForeignKey ? 'MUL' : '';
            const nullType = col.isNotNull ? 'NO' : 'YES';
            addLog(
              'info',
              `| ${col.name.padEnd(11)} | ${col.dataType.padEnd(11)} | ${nullType.padEnd(4)} | ${keyType.padEnd(3)} | NULL    |       |`
            );
          });
          addLog('info', '+-------------+-------------+------+-----+---------+-------+');
          addLog('success', `${table.columns.length} rows in set (0.00 sec)`);
        } else {
          addLog('error', `ERROR 1146 (42S02): Table '${tableName}' doesn't exist`);
        }
      } else if (upperCommand === 'HELP' || upperCommand === '\\H') {
        addLog('info', 'Available commands (simulation mode):');
        addLog('info', '  SHOW DATABASES    - List all databases');
        addLog('info', '  SHOW TABLES       - List tables in current database');
        addLog('info', '  USE <database>    - Select a database');
        addLog('info', '  DESCRIBE <table>  - Show table structure');
        addLog('info', '  CLEAR             - Clear terminal');
      } else if (upperCommand === 'CLEAR' || upperCommand === '\\C') {
        setTerminalLogs([]);
      } else if (upperCommand.startsWith('SELECT')) {
        addLog('info', 'Query simulation - data retrieval not yet implemented');
        addLog('success', 'Query OK, 0 rows affected (0.01 sec)');
      } else if (upperCommand.startsWith('INSERT') || upperCommand.startsWith('UPDATE') || upperCommand.startsWith('DELETE')) {
        addLog('info', 'Query simulation - DML operations not yet implemented');
        addLog('success', 'Query OK, 0 rows affected (0.02 sec)');
      } else if (upperCommand.startsWith('CREATE')) {
        addLog('warning', 'Use the UI to create databases and tables');
      } else if (upperCommand.startsWith('DROP')) {
        addLog('warning', 'Use the UI to drop databases and tables');
      } else {
        addLog('error', `ERROR 1064 (42000): Unknown command: '${command}'`);
      }
    },
    [databases, tables, selectedDatabaseId, addLog]
  );

  // Handle quick SQL buttons
  const handleQuickSQL = useCallback(
    (type: 'CREATE' | 'SELECT' | 'UPDATE' | 'DELETE') => {
      switch (type) {
        case 'CREATE':
          if (selectedDatabaseId) {
            setIsCreateTableModalOpen(true);
          } else {
            setIsCreateDbModalOpen(true);
          }
          break;
        case 'SELECT':
          addLog('info', 'SELECT * FROM table_name;');
          addLog('info', 'Query simulation - use DESCRIBE <table> to view structure');
          break;
        case 'UPDATE':
          addLog('info', 'UPDATE table_name SET column = value WHERE condition;');
          addLog('warning', 'DML operations are simulated in this version');
          break;
        case 'DELETE':
          addLog('info', 'DELETE FROM table_name WHERE condition;');
          addLog('warning', 'DML operations are simulated in this version');
          break;
      }
    },
    [selectedDatabaseId, addLog]
  );

  // Get selected database name
  const selectedDatabaseName = useMemo(() => {
    return databases.find((d) => d.id === selectedDatabaseId)?.name || '';
  }, [databases, selectedDatabaseId]);

  // Get tables for selected database
  const tablesForSelectedDb = useMemo(() => {
    return tables.filter((t) => t.databaseId === selectedDatabaseId);
  }, [tables, selectedDatabaseId]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-black border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          databases={databases}
          tables={tables}
          selectedDatabaseId={selectedDatabaseId}
          selectedTableId={selectedTableId}
          onSelectDatabase={setSelectedDatabaseId}
          onSelectTable={setSelectedTableId}
          onCreateDatabase={() => setIsCreateDbModalOpen(true)}
          onCreateTable={() => setIsCreateTableModalOpen(true)}
          onDeleteDatabase={handleDeleteDatabase}
          onDeleteTable={handleDeleteTable}
          onQuickSQL={handleQuickSQL}
          onEditTable={handleEditTable}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* React Flow Canvas */}
          <div className="flex-1 relative">
            {selectedDatabaseId ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{
                  padding: 0.2,
                  maxZoom: 0.85,
                  minZoom: 0.5,
                }}
                defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
                proOptions={{ hideAttribution: true }}
                className="bg-gray-50"
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                  color="#CBD5E1"
                />
                <Controls
                  className="bg-white border border-gray-200 rounded-lg shadow-lg"
                />
              </ReactFlow>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No Database Selected
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Select or create a database to start designing tables
                  </p>
                  <button
                    onClick={() => setIsCreateDbModalOpen(true)}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Create Database
                  </button>
                </motion.div>
              </div>
            )}

            {/* Table count badge */}
            {selectedDatabaseId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200"
              >
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-black">
                    {selectedDatabaseName}
                  </span>{' '}
                  • {tablesForSelectedDb.length} table{tablesForSelectedDb.length !== 1 ? 's' : ''}
                </p>
              </motion.div>
            )}
          </div>

          {/* Terminal */}
          <Terminal
            logs={terminalLogs}
            onCommand={handleTerminalCommand}
            isMinimized={isTerminalMinimized}
            onToggleMinimize={() => setIsTerminalMinimized(!isTerminalMinimized)}
          />
        </div>
      </div>

      {/* Settings Panel */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Create Database Modal */}
      <CreateDatabaseModal
        isOpen={isCreateDbModalOpen}
        onClose={() => setIsCreateDbModalOpen(false)}
        onCreate={handleCreateDatabase}
        existingNames={databases.map((d) => d.name)}
      />

      {/* Create Table Modal */}
      <CreateTableModal
        isOpen={isCreateTableModalOpen}
        onClose={() => setIsCreateTableModalOpen(false)}
        onCreate={handleCreateTable}
        existingTables={tablesForSelectedDb}
        databaseName={selectedDatabaseName}
      />

      {/* Edit Table Modal */}
      <EditTableModal
        isOpen={isEditTableModalOpen}
        onClose={() => {
          setIsEditTableModalOpen(false);
          setEditingTableId(null);
        }}
        table={tables.find((t) => t.id === editingTableId) || null}
        onUpdate={handleUpdateTable}
        existingTables={tablesForSelectedDb}
      />
    </div>
  );
}
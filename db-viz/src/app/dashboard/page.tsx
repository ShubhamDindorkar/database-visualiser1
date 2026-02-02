'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import InsertDataModal from '@/components/database/InsertDataModal';
import UpdateDataModal from '@/components/database/UpdateDataModal';
import DeleteDataModal from '@/components/database/DeleteDataModal';
import SelectDataModal from '@/components/database/SelectDataModal';
import DropModal from '@/components/database/DropModal';
import CreateChoiceModal from '@/components/database/CreateChoiceModal';
import TableNode from '@/components/database/TableNode';
import RelationshipEdge from '@/components/database/RelationshipEdge';
import QueryResultsPanel from '@/components/database/QueryResultsPanel';
import ForeignKeyModal from '@/components/database/ForeignKeyModal';
import ExportModal from '@/components/database/ExportModal';

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

// Theme definitions (moved outside component to prevent re-creation)
const THEMES = {
  light: {
    bg: 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    navbar: 'bg-white/95 border-gray-200',
    sidebar: 'bg-white border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    button: 'bg-gray-900 hover:bg-gray-800 text-white',
    buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    modal: 'bg-white',
    input: 'bg-white border-gray-300 text-gray-900',
    dots: '#000000',
  },
  dark: {
    bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    navbar: 'bg-slate-900/95 border-slate-700',
    sidebar: 'bg-slate-900 border-slate-700',
    text: 'text-white',
    textSecondary: 'text-slate-300',
    button: 'bg-slate-100 hover:bg-white text-slate-900',
    buttonSecondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    modal: 'bg-slate-800',
    input: 'bg-slate-900 border-slate-600 text-white',
    dots: '#ffffff',
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  
  // Track intentional logout to prevent redirect to login
  const isLoggingOut = useRef(false);

  // Theme State
  const [currentTheme, setCurrentTheme] = useState<string>('light');

  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);
  const [isCreateChoiceModalOpen, setIsCreateChoiceModalOpen] = useState(false);
  const [isCreateDbModalOpen, setIsCreateDbModalOpen] = useState(false);
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState(false);
  const [isEditTableModalOpen, setIsEditTableModalOpen] = useState(false);
  const [isInsertDataModalOpen, setIsInsertDataModalOpen] = useState(false);
  const [isUpdateDataModalOpen, setIsUpdateDataModalOpen] = useState(false);
  const [isDeleteDataModalOpen, setIsDeleteDataModalOpen] = useState(false);
  const [isSelectDataModalOpen, setIsSelectDataModalOpen] = useState(false);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [isForeignKeyModalOpen, setIsForeignKeyModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);

  // Workflow ref for export
  const workflowRef = useRef<HTMLDivElement>(null);
  const [queryResults, setQueryResults] = useState<{ results: unknown[]; query: string } | null>(null);

  // Data State
  const [databases, setDatabases] = useState<DatabaseType[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);

  // React Flow state
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('dbviz-theme');
    if (savedTheme && THEMES[savedTheme as keyof typeof THEMES]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Theme change handler
  const handleThemeChange = useCallback((themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem('dbviz-theme', themeId);
  }, []);

  // Handle logout with redirect to home
  const handleLogout = useCallback(async () => {
    isLoggingOut.current = true;
    await logout();
    router.push('/');
  }, [logout, router]);

  // Auth redirect (only if not logged in initially, not after logout)
  useEffect(() => {
    if (!authLoading && !user && !isLoggingOut.current) {
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
          mysqlName: data.mysqlName, // Include actual MySQL name
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      setDatabases(dbs);
      
      // Auto-select first database if no database is selected and databases exist
      setSelectedDatabaseId((current) => {
        if (!current && dbs.length > 0) {
          return dbs[0].id;
        }
        return current;
      });
    });

    return () => unsubscribe();
  }, [user]);

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
              animated: false,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#475569',
                width: 20,
                height: 20,
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
        // First, create the database in MySQL with user isolation
        const mysqlResponse = await fetch('/api/database/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, userId: user.uid }),
        });
        const mysqlResult = await mysqlResponse.json();

        if (!mysqlResult.success) {
          addLog('error', `MySQL Error: ${mysqlResult.error}`);
          return;
        }

        // If MySQL creation successful, save to Firebase
        const hashedPassword = await bcrypt.hash(password, 10);
        const dbId = uuidv4();

        await setDoc(doc(db, 'databases', dbId), {
          name,
          userId: user.uid,
          db_password_hash: hashedPassword,
          mysqlName: mysqlResult.actualDatabaseName, // Store actual MySQL name
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        addLog('success', `Database '${name}' created successfully in MySQL`);
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
      if (!user) return;
      
      try {
        const dbToDelete = databases.find((d) => d.id === databaseId);
        const dbName = dbToDelete?.name;
        
        if (dbName) {
          // First, drop the database in MySQL with user isolation
          const mysqlResponse = await fetch('/api/database/drop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: dbName, userId: user.uid }),
          });
          const mysqlResult = await mysqlResponse.json();

          if (!mysqlResult.success) {
            // Log warning but continue with Firebase deletion
            addLog('warning', `MySQL: ${mysqlResult.error}`);
          }
        }

        // Delete all tables in the database from Firebase
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
    [user, databases, tables, selectedDatabaseId, addLog]
  );

  // Create table
  const handleCreateTable = useCallback(
    async (name: string, columns: Column[]) => {
      if (!selectedDatabaseId) return;

      try {
        const selectedDatabase = databases.find((d) => d.id === selectedDatabaseId);
        const databaseName = selectedDatabase?.mysqlName || selectedDatabase?.name;
        
        if (!databaseName) {
          addLog('error', 'No database selected');
          return;
        }

        // Check if table already exists in MySQL
        const checkResponse = await fetch('/api/query/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: databaseName,
            query: `SHOW TABLES LIKE '${name}'`,
            userId: user?.uid,
          }),
        });
        const checkResult = await checkResponse.json();
        
        if (checkResult.success && checkResult.results && checkResult.results.length > 0) {
          addLog('error', `Table '${name}' already exists in MySQL. Use DROP TABLE \`${name}\` to remove it first.`);
          return;
        }

        // First, create the table in MySQL
        const mysqlColumns = columns.map((col) => ({
          name: col.name,
          dataType: col.dataType,
          isPrimaryKey: col.isPrimaryKey,
          isNotNull: col.isNotNull,
          isUnique: col.isUnique,
          defaultValue: col.defaultValue,
          isForeignKey: col.isForeignKey,
          foreignKeyReference: col.foreignKeyReference ? {
            tableName: col.foreignKeyReference.tableName,
            columnName: col.foreignKeyReference.columnName,
          } : undefined,
        }));

        const mysqlResponse = await fetch('/api/table/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: databaseName,
            tableName: name,
            columns: mysqlColumns,
          }),
        });
        const mysqlResult = await mysqlResponse.json();

        if (!mysqlResult.success) {
          addLog('error', `MySQL Error: ${mysqlResult.error}`);
          return;
        }

        // If MySQL creation successful, save to Firebase
        const tableId = uuidv4();
        
        // Calculate position for new table
        const existingTables = tables.filter((t) => t.databaseId === selectedDatabaseId);
        const xOffset = (existingTables.length % 3) * 350;
        const yOffset = Math.floor(existingTables.length / 3) * 300;

        await setDoc(doc(db, 'tables', tableId), {
          name,
          databaseId: selectedDatabaseId,
          columns,
          position: { x: 100 + xOffset, y: 100 + yOffset },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        addLog('success', `Table '${name}' created successfully in MySQL`);

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
    [selectedDatabaseId, databases, tables, addLog]
  );

  // Delete table
  const handleDeleteTable = useCallback(
    async (tableId: string) => {
      try {
        const tableToDelete = tables.find((t) => t.id === tableId);
        const tableName = tableToDelete?.name;
        const databaseId = tableToDelete?.databaseId;
        const selectedDatabase = databases.find((d) => d.id === databaseId);
        const databaseName = selectedDatabase?.mysqlName || selectedDatabase?.name;

        if (tableName && databaseName) {
          // First, drop the table in MySQL
          const mysqlResponse = await fetch('/api/query/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              database: databaseName,
              query: `DROP TABLE \`${tableName}\``,
              userId: user?.uid,
            }),
          });
          const mysqlResult = await mysqlResponse.json();

          if (!mysqlResult.success) {
            // Log warning but continue with Firebase deletion
            addLog('warning', `MySQL: ${mysqlResult.error}`);
          }
        }

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
    [tables, databases, selectedTableId, addLog]
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
        const table = tables.find((t) => t.id === tableId);
        if (!table) {
          addLog('error', 'Table not found');
          return;
        }
        
        const tableName = table.name;
        const selectedDatabase = databases.find((d) => d.id === table.databaseId);
        const databaseName = selectedDatabase?.mysqlName || selectedDatabase?.name;
        
        if (!databaseName) {
          addLog('error', 'Database not found');
          return;
        }
        
        // Get the old columns to compare
        const oldColumns = table.columns;
        const oldColumnNames = new Set(oldColumns.map((c) => c.name));
        const newColumnNames = new Set(columns.map((c) => c.name));
        
        // Identify added columns
        const addedColumns = columns.filter((c) => !oldColumnNames.has(c.name));
        
        // Identify removed columns
        const removedColumns = oldColumns.filter((c) => !newColumnNames.has(c.name));
        
        // Identify modified columns (same name but different properties)
        const modifiedColumns = columns.filter((newCol) => {
          const oldCol = oldColumns.find((c) => c.name === newCol.name);
          if (!oldCol) return false;
          return (
            oldCol.dataType !== newCol.dataType ||
            oldCol.isNotNull !== newCol.isNotNull ||
            oldCol.isUnique !== newCol.isUnique ||
            oldCol.defaultValue !== newCol.defaultValue
          );
        });
        
        // Execute ALTER TABLE commands for each change
        const alterCommands: string[] = [];
        
        // Add new columns
        for (const col of addedColumns) {
          let colDef = `ADD COLUMN \`${col.name}\` ${col.dataType}`;
          if (col.isNotNull) colDef += ' NOT NULL';
          if (col.isUnique) colDef += ' UNIQUE';
          if (col.defaultValue) colDef += ` DEFAULT '${col.defaultValue}'`;
          alterCommands.push(colDef);
        }
        
        // Drop removed columns
        for (const col of removedColumns) {
          alterCommands.push(`DROP COLUMN \`${col.name}\``);
        }
        
        // Modify existing columns
        for (const col of modifiedColumns) {
          let colDef = `MODIFY COLUMN \`${col.name}\` ${col.dataType}`;
          if (col.isNotNull) colDef += ' NOT NULL';
          if (col.isUnique) colDef += ' UNIQUE';
          if (col.defaultValue) colDef += ` DEFAULT '${col.defaultValue}'`;
          alterCommands.push(colDef);
        }
        
        // Execute all ALTER TABLE commands
        if (alterCommands.length > 0) {
          const alterQuery = `ALTER TABLE \`${tableName}\` ${alterCommands.join(', ')}`;
          
          const response = await fetch('/api/query/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              database: databaseName,
              query: alterQuery,
              userId: user?.uid,
            }),
          });
          
          const result = await response.json();
          
          if (!result.success) {
            addLog('error', `Failed to alter table: ${result.error}`);
            return;
          }
          
          addLog('success', `Table '${tableName}' structure altered in MySQL`);
        }
        
        // Update Firebase with new columns
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
    [tables, databases, addLog]
  );

  // Add foreign key to existing table
  const handleAddForeignKey = useCallback(
    async (
      sourceTableId: string,
      sourceColumnId: string,
      targetTableId: string,
      targetColumnId: string
    ) => {
      const sourceTable = tables.find((t) => t.id === sourceTableId);
      const targetTable = tables.find((t) => t.id === targetTableId);
      const sourceColumn = sourceTable?.columns.find((c) => c.id === sourceColumnId);
      const targetColumn = targetTable?.columns.find((c) => c.id === targetColumnId);
      const selectedDatabase = databases.find((d) => d.id === selectedDatabaseId);
      const databaseName = selectedDatabase?.mysqlName || selectedDatabase?.name;

      if (!sourceTable || !targetTable || !sourceColumn || !targetColumn || !databaseName) {
        throw new Error('Invalid table or column selection');
      }

      try {
        // First, add the foreign key constraint in MySQL
        const constraintName = `fk_${sourceTable.name}_${sourceColumn.name}`;
        const alterQuery = `ALTER TABLE \`${sourceTable.name}\` ADD CONSTRAINT \`${constraintName}\` FOREIGN KEY (\`${sourceColumn.name}\`) REFERENCES \`${targetTable.name}\`(\`${targetColumn.name}\`)`;

        const response = await fetch('/api/query/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: databaseName,
            query: alterQuery,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to add foreign key in MySQL');
        }

        // Update Firebase with the foreign key reference
        const updatedColumns = sourceTable.columns.map((col) => {
          if (col.id === sourceColumnId) {
            return {
              ...col,
              isForeignKey: true,
              foreignKeyReference: {
                tableId: targetTableId,
                tableName: targetTable.name,
                columnId: targetColumnId,
                columnName: targetColumn.name,
              },
            };
          }
          return col;
        });

        await updateDoc(doc(db, 'tables', sourceTableId), {
          columns: updatedColumns,
          updatedAt: Timestamp.now(),
        });

        // Auto-position source table to the right of target table for straight FK line
        // Position 400px to the right and align vertically
        const newPosition = {
          x: targetTable.position.x + 400,
          y: targetTable.position.y,
        };

        await updateDoc(doc(db, 'tables', sourceTableId), {
          position: newPosition,
          updatedAt: Timestamp.now(),
        });

        addLog(
          'success',
          `Foreign key added: ${sourceTable.name}.${sourceColumn.name} → ${targetTable.name}.${targetColumn.name}`
        );
      } catch (error) {
        console.error('Error adding foreign key:', error);
        throw error;
      }
    },
    [tables, databases, selectedDatabaseId, addLog]
  );

  // Remove foreign key from existing table
  const handleRemoveForeignKey = useCallback(
    async (tableId: string, columnId: string) => {
      const table = tables.find((t) => t.id === tableId);
      const column = table?.columns.find((c) => c.id === columnId);
      const selectedDatabase = databases.find((d) => d.id === selectedDatabaseId);
      const databaseName = selectedDatabase?.mysqlName || selectedDatabase?.name;

      if (!table || !column || !databaseName) {
        throw new Error('Invalid table or column');
      }

      try {
        // First, remove the foreign key constraint from MySQL
        const constraintName = `fk_${table.name}_${column.name}`;
        const alterQuery = `ALTER TABLE \`${table.name}\` DROP FOREIGN KEY \`${constraintName}\``;

        const response = await fetch('/api/query/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: databaseName,
            query: alterQuery,
            userId: user?.uid,
          }),
        });

        const result = await response.json();

        // Even if MySQL fails (constraint might have different name), update Firebase
        if (!result.success) {
          addLog('warning', `MySQL: ${result.error}. Updating workflow...`);
        }

        // Update Firebase to remove the foreign key reference
        const updatedColumns = table.columns.map((col) => {
          if (col.id === columnId) {
            const { foreignKeyReference, ...rest } = col;
            return {
              ...rest,
              isForeignKey: false,
            };
          }
          return col;
        });

        await updateDoc(doc(db, 'tables', tableId), {
          columns: updatedColumns,
          updatedAt: Timestamp.now(),
        });

        addLog('success', `Foreign key removed from ${table.name}.${column.name}`);
      } catch (error) {
        console.error('Error removing foreign key:', error);
        throw error;
      }
    },
    [tables, databases, selectedDatabaseId, addLog]
  );

  // Execute query helper for modals
  const executeQuery = useCallback(
    async (database: string, query: string): Promise<{ success: boolean; results?: unknown[]; error?: string }> => {
      try {
        const response = await fetch('/api/query/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ database, query, userId: user?.uid }),
        });
        const result = await response.json();
        
        if (result.success) {
          addLog('success', `Query executed: ${query.substring(0, 50)}${query.length > 50 ? '...' : ''}`);
          if (result.formattedOutput) {
            result.formattedOutput.forEach((line: string) => addLog('info', line));
          }
        } else {
          addLog('error', result.error || 'Query failed');
        }
        
        return result;
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Query execution failed';
        addLog('error', errMsg);
        return { success: false, error: errMsg };
      }
    },
    [addLog]
  );

  // Handle view data from table node arrow button
  const handleViewData = useCallback(
    async (tableId: string, tableName: string) => {
      const db = databases.find((d) => d.id === selectedDatabaseId);
      if (!db) return;
      
      const mysqlDatabaseName = db.mysqlName || db.name;
      const query = `SELECT * FROM \`${tableName}\``;
      
      const result = await executeQuery(mysqlDatabaseName, query);
      if (result.success && result.results) {
        setQueryResults({
          results: result.results,
          query,
        });
      }
    },
    [databases, selectedDatabaseId, executeQuery]
  );

  // Convert tables to React Flow nodes
  useEffect(() => {
    const newNodes: Node[] = tables.map((table) => ({
      id: table.id,
      type: 'tableNode',
      position: table.position,
      data: {
        table: { ...table, columns: [...table.columns] }, // Create new reference to force re-render
        onDelete: handleDeleteTable,
        onViewData: handleViewData,
        isSelected: selectedTableId === table.id,
        theme: THEMES[currentTheme as keyof typeof THEMES] || THEMES.light,
      },
    }));
    setNodes(newNodes);
  }, [tables, selectedTableId, handleViewData, handleDeleteTable, currentTheme]);

  // Handle INSERT data
  const handleInsertData = useCallback(
    async (database: string, table: string, values: Record<string, string>) => {
      const columns = Object.keys(values).filter((k) => values[k] !== '');
      const vals = columns.map((col) => {
        const val = values[col];
        // Check if value is numeric
        if (/^-?\d+(\.\d+)?$/.test(val)) {
          return val;
        }
        return `'${val.replace(/'/g, "''")}'`;
      });
      
      if (columns.length === 0) {
        throw new Error('At least one value is required');
      }

      const query = `INSERT INTO \`${table}\` (\`${columns.join('`, `')}\`) VALUES (${vals.join(', ')})`;
      const result = await executeQuery(database, query);
      
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    [executeQuery]
  );

  // Handle DROP table from modal
  const handleDropTable = useCallback(
    async (database: string, tableName: string) => {
      // Find the table in Firebase
      const tableToDelete = tables.find((t) => t.name === tableName);
      const dbObject = databases.find((d) => d.name === database || d.mysqlName === database);
      
      if (tableToDelete && dbObject && tableToDelete.databaseId === dbObject.id) {
        // Drop from MySQL
        const result = await executeQuery(database, `DROP TABLE \`${tableName}\``);
        if (!result.success) {
          throw new Error(result.error);
        }
        
        // Delete from Firebase
        await deleteDoc(doc(db, 'tables', tableToDelete.id));
        
        if (selectedTableId === tableToDelete.id) {
          setSelectedTableId(null);
        }
        
        addLog('success', `Table '${tableName}' dropped successfully`);
      } else {
        throw new Error('Table not found');
      }
    },
    [tables, databases, selectedTableId, executeQuery, addLog]
  );

  // Handle terminal command - Execute real MySQL queries
  const handleTerminalCommand = useCallback(
    async (command: string) => {
      const upperCommand = command.toUpperCase().trim();
      const trimmedCommand = command.trim();

      // Handle local commands (HELP, CLEAR)
      if (upperCommand === 'HELP' || upperCommand === '\\H') {
        addLog('info', 'Available commands (connected to MySQL):');
        addLog('info', '  SHOW DATABASES    - List all databases');
        addLog('info', '  SHOW TABLES       - List tables in current database');
        addLog('info', '  USE <database>    - Select a database');
        addLog('info', '  DESCRIBE <table>  - Show table structure');
        addLog('info', '  SELECT ...        - Query data');
        addLog('info', '  INSERT ...        - Insert data');
        addLog('info', '  UPDATE ...        - Update data');
        addLog('info', '  DELETE ...        - Delete data');
        addLog('info', '  CREATE TABLE ...  - Create a new table');
        addLog('info', '  DROP TABLE ...    - Drop a table');
        addLog('info', '  CLEAR             - Clear terminal');
        
        // Show in workflow area
        const helpData = [
          { Command: 'SHOW DATABASES', Description: 'List all databases' },
          { Command: 'SHOW TABLES', Description: 'List tables in current database' },
          { Command: 'USE <database>', Description: 'Select a database' },
          { Command: 'DESCRIBE <table>', Description: 'Show table structure' },
          { Command: 'SELECT ...', Description: 'Query data' },
          { Command: 'INSERT ...', Description: 'Insert data' },
          { Command: 'UPDATE ...', Description: 'Update data' },
          { Command: 'DELETE ...', Description: 'Delete data' },
          { Command: 'CREATE TABLE ...', Description: 'Create a new table' },
          { Command: 'DROP TABLE ...', Description: 'Drop a table' },
          { Command: 'CLEAR', Description: 'Clear terminal' },
        ];
        setQueryResults({
          results: helpData,
          query: 'HELP',
        });
        return;
      }

      if (upperCommand === 'CLEAR' || upperCommand === '\\C') {
        setTerminalLogs([]);
        return;
      }

      // Handle SHOW DATABASES - fetch from MySQL with user filter
      if (upperCommand === 'SHOW DATABASES' || upperCommand === 'SHOW DATABASES;') {
        addLog('info', 'Executing: SHOW DATABASES');
        
        try {
          const response = await fetch(`/api/database/list?userId=${user?.uid}`);
          const result = await response.json();
          
          if (result.success && result.databases) {
            const mysqlDatabases = result.databases;
            
            if (mysqlDatabases.length === 0) {
              addLog('info', '+--------------------+');
              addLog('info', '| Database           |');
              addLog('info', '+--------------------+');
              addLog('info', '+--------------------+');
              addLog('info', 'No databases found');
              
              setQueryResults({
                results: [],
                query: 'SHOW DATABASES',
              });
            } else {
              addLog('info', '+--------------------+');
              addLog('info', '| Database           |');
              addLog('info', '+--------------------+');
              mysqlDatabases.forEach((db: { name: string }) => {
                addLog('info', `| ${db.name.padEnd(18)} |`);
              });
              addLog('info', '+--------------------+');
              addLog('info', `${mysqlDatabases.length} row${mysqlDatabases.length !== 1 ? 's' : ''} in set`);
              
              // Show in workflow area
              const dbData = mysqlDatabases.map((db: { name: string }) => ({ Database: db.name }));
              setQueryResults({
                results: dbData,
                query: 'SHOW DATABASES',
              });
            }
          } else {
            addLog('error', `Error fetching databases: ${result.error || 'Unknown error'}`);
          }
        } catch (error) {
          addLog('error', 'Failed to fetch databases from MySQL');
          console.error('Error fetching databases:', error);
        }
        return;
      }

      // Handle SHOW TABLES
      if (upperCommand === 'SHOW TABLES' || upperCommand === 'SHOW TABLES;') {
        if (!selectedDatabaseId) {
          addLog('error', 'No database selected. Use "USE <database>" first.');
          return;
        }
        
        const selectedDatabase = databases.find((d) => d.id === selectedDatabaseId);
        const currentTables = tables.filter((t) => t.databaseId === selectedDatabaseId);
        
        addLog('info', `Executing: SHOW TABLES from ${selectedDatabase?.name}`);
        
        if (currentTables.length === 0) {
          addLog('info', 'No tables found in database');
          setQueryResults({
            results: [],
            query: `SHOW TABLES FROM ${selectedDatabase?.name}`,
          });
        } else {
          addLog('info', '+--------------------+');
          addLog('info', `| Tables_in_${selectedDatabase?.name?.padEnd(8)} |`);
          addLog('info', '+--------------------+');
          currentTables.forEach((table) => {
            addLog('info', `| ${table.name.padEnd(18)} |`);
          });
          addLog('info', '+--------------------+');
          addLog('info', `${currentTables.length} row${currentTables.length !== 1 ? 's' : ''} in set`);
          
          // Show in workflow area
          const tableData = currentTables.map((t) => ({
            [`Tables_in_${selectedDatabase?.name}`]: t.name,
          }));
          setQueryResults({
            results: tableData,
            query: `SHOW TABLES FROM ${selectedDatabase?.name}`,
          });
        }
        return;
      }

      // Handle USE command - changes selected database locally
      if (upperCommand.startsWith('USE ')) {
        const dbName = trimmedCommand.substring(4).trim().replace(';', '');
        const targetDb = databases.find(
          (d) => d.name.toLowerCase() === dbName.toLowerCase()
        );
        if (targetDb) {
          setSelectedDatabaseId(targetDb.id);
          addLog('success', 'Database changed');
        } else {
          addLog('error', `ERROR 1049 (42000): Unknown database '${dbName}'`);
        }
        return;
      }

      // Get current database name for queries that need it
      const selectedDatabase = databases.find((d) => d.id === selectedDatabaseId);
      const currentDatabaseName = selectedDatabase?.mysqlName || selectedDatabase?.name;

      // Execute query against MySQL
      try {
        addLog('info', `Executing: ${trimmedCommand}`);

        const response = await fetch('/api/query/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: currentDatabaseName,
            query: trimmedCommand,
            userId: user?.uid,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Log formatted output
          if (result.formattedOutput && Array.isArray(result.formattedOutput)) {
            result.formattedOutput.forEach((line: string) => {
              addLog('success', line);
            });
          } else {
            addLog('success', 'Query executed successfully');
          }
          
          // If it's a SELECT query and has results, also show in panel
          if (upperCommand.startsWith('SELECT') && result.results && Array.isArray(result.results) && result.results.length > 0) {
            setQueryResults({
              results: result.results,
              query: trimmedCommand,
            });
          }
          
          // If it's a DESCRIBE query and has results, also show in panel
          if ((upperCommand.startsWith('DESCRIBE') || upperCommand.startsWith('DESC ')) && result.results && Array.isArray(result.results) && result.results.length > 0) {
            setQueryResults({
              results: result.results,
              query: trimmedCommand,
            });
          }

          // Handle schema-changing queries to update UI immediately
          if (upperCommand.startsWith('CREATE TABLE') && selectedDatabaseId) {
            // Extract table name from CREATE TABLE query
            const match = trimmedCommand.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?/i);
            if (match && match[1]) {
              const tableName = match[1];
              
              // Fetch table structure from MySQL
              try {
                const describeResponse = await fetch('/api/query/execute', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    database: currentDatabaseName,
                    query: `DESCRIBE \`${tableName}\``,
                    userId: user?.uid,
                  }),
                });
                const describeResult = await describeResponse.json();
                
                if (describeResult.success && Array.isArray(describeResult.results)) {
                  // Get foreign key information from INFORMATION_SCHEMA
                  const fkResponse = await fetch('/api/query/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      database: 'information_schema',
                      query: `
                        SELECT 
                          COLUMN_NAME,
                          REFERENCED_TABLE_NAME,
                          REFERENCED_COLUMN_NAME
                        FROM KEY_COLUMN_USAGE
                        WHERE TABLE_SCHEMA = '${currentDatabaseName}'
                          AND TABLE_NAME = '${tableName}'
                          AND REFERENCED_TABLE_NAME IS NOT NULL
                      `,
                    }),
                  });
                  const fkResult = await fkResponse.json();
                  const foreignKeys = fkResult.success && Array.isArray(fkResult.results) ? fkResult.results : [];
                  
                  // Create a map of column name -> foreign key reference
                  const fkMap = new Map<string, { tableName: string; columnName: string }>();
                  foreignKeys.forEach((fk: any) => {
                    fkMap.set(fk.COLUMN_NAME, {
                      tableName: fk.REFERENCED_TABLE_NAME,
                      columnName: fk.REFERENCED_COLUMN_NAME,
                    });
                  });
                  
                  // Convert MySQL column info to our Column format
                  const columns = describeResult.results.map((col: any) => {
                    const column: Column = {
                      id: uuidv4(),
                      name: col.Field,
                      dataType: col.Type,
                      isPrimaryKey: col.Key === 'PRI',
                      isNotNull: col.Null === 'NO',
                      isUnique: col.Key === 'UNI',
                      defaultValue: col.Default,
                      isForeignKey: col.Key === 'MUL' || fkMap.has(col.Field),
                    };
                    
                    // Add foreign key reference if exists
                    const fkRef = fkMap.get(col.Field);
                    if (fkRef) {
                      // Find the referenced table in our tables array
                      const referencedTable = tables.find((t) => 
                        t.name === fkRef.tableName && t.databaseId === selectedDatabaseId
                      );
                      
                      if (referencedTable) {
                        // Find the referenced column in that table
                        const referencedColumn = referencedTable.columns.find((c) => 
                          c.name === fkRef.columnName
                        );
                        
                        if (referencedColumn) {
                          column.foreignKeyReference = {
                            tableId: referencedTable.id,
                            columnId: referencedColumn.id,
                            tableName: referencedTable.name,
                            columnName: referencedColumn.name,
                          };
                        }
                      }
                    }
                    
                    return column;
                  });

                  // Add table to Firebase
                  const tableId = uuidv4();
                  const existingTables = tables.filter((t) => t.databaseId === selectedDatabaseId);
                  const xOffset = (existingTables.length % 3) * 450;
                  const yOffset = Math.floor(existingTables.length / 3) * 400;

                  await setDoc(doc(db, 'tables', tableId), {
                    name: tableName,
                    databaseId: selectedDatabaseId,
                    columns,
                    position: { x: 100 + xOffset, y: 100 + yOffset },
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                  });
                  
                  addLog('info', `Table '${tableName}' added to workflow`);
                  
                  // Log foreign key relationships
                  columns.forEach((col: Column) => {
                    if (col.isForeignKey && col.foreignKeyReference) {
                      addLog('info', `Foreign key linked: ${tableName}.${col.name} → ${col.foreignKeyReference.tableName}.${col.foreignKeyReference.columnName}`);
                    }
                  });
                }
              } catch (err) {
                console.error('Error syncing table to Firebase:', err);
              }
            }
          } else if (upperCommand.startsWith('ALTER TABLE')) {
            // Handle ALTER TABLE to update columns live
            const match = trimmedCommand.match(/ALTER\s+TABLE\s+[`"]?(\w+)[`"]?/i);
            if (match && match[1] && selectedDatabaseId) {
              const tableName = match[1];
              const tableToUpdate = tables.find((t) => 
                t.name.toLowerCase() === tableName.toLowerCase() && 
                t.databaseId === selectedDatabaseId
              );
              
              if (tableToUpdate) {
                // Fetch updated table structure from MySQL
                try {
                  const describeResponse = await fetch('/api/query/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      database: currentDatabaseName,
                      query: `DESCRIBE \`${tableName}\``,
                      userId: user?.uid,
                    }),
                  });
                  const describeResult = await describeResponse.json();
                  
                  if (describeResult.success && Array.isArray(describeResult.results)) {
                    // Get foreign key information from INFORMATION_SCHEMA
                    const fkResponse = await fetch('/api/query/execute', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        database: 'information_schema',
                        query: `
                          SELECT 
                            COLUMN_NAME,
                            REFERENCED_TABLE_NAME,
                            REFERENCED_COLUMN_NAME
                          FROM KEY_COLUMN_USAGE
                          WHERE TABLE_SCHEMA = '${currentDatabaseName}'
                            AND TABLE_NAME = '${tableName}'
                            AND REFERENCED_TABLE_NAME IS NOT NULL
                        `,
                      }),
                    });
                    const fkResult = await fkResponse.json();
                    const foreignKeys = fkResult.success && Array.isArray(fkResult.results) ? fkResult.results : [];
                    
                    // Create a map of column name -> foreign key reference
                    const fkMap = new Map<string, { tableName: string; columnName: string }>();
                    foreignKeys.forEach((fk: any) => {
                      fkMap.set(fk.COLUMN_NAME, {
                        tableName: fk.REFERENCED_TABLE_NAME,
                        columnName: fk.REFERENCED_COLUMN_NAME,
                      });
                    });
                    
                    // Convert MySQL column info to our Column format
                    const updatedColumns = describeResult.results.map((col: any) => {
                      const column: Column = {
                        id: uuidv4(),
                        name: col.Field,
                        dataType: col.Type,
                        isPrimaryKey: col.Key === 'PRI',
                        isNotNull: col.Null === 'NO',
                        isUnique: col.Key === 'UNI',
                        defaultValue: col.Default,
                        isForeignKey: col.Key === 'MUL' || fkMap.has(col.Field),
                      };
                      
                      // Add foreign key reference if exists
                      const fkRef = fkMap.get(col.Field);
                      if (fkRef) {
                        // Find the referenced table in our tables array
                        const referencedTable = tables.find((t) => 
                          t.name === fkRef.tableName && t.databaseId === selectedDatabaseId
                        );
                        
                        if (referencedTable) {
                          // Find the referenced column in that table
                          const referencedColumn = referencedTable.columns.find((c) => 
                            c.name === fkRef.columnName
                          );
                          
                          if (referencedColumn) {
                            column.foreignKeyReference = {
                              tableId: referencedTable.id,
                              columnId: referencedColumn.id,
                              tableName: referencedTable.name,
                              columnName: referencedColumn.name,
                            };
                          }
                        }
                      }
                      
                      return column;
                    });

                    // Update table in Firebase
                    await updateDoc(doc(db, 'tables', tableToUpdate.id), {
                      columns: updatedColumns,
                      updatedAt: Timestamp.now(),
                    });
                    
                    addLog('info', `Table '${tableName}' structure updated in workflow`);
                    
                    // Log foreign key relationships
                    updatedColumns.forEach((col: Column) => {
                      if (col.isForeignKey && col.foreignKeyReference) {
                        addLog('info', `Foreign key linked: ${tableName}.${col.name} → ${col.foreignKeyReference.tableName}.${col.foreignKeyReference.columnName}`);
                      }
                    });
                  }
                } catch (err) {
                  console.error('Error updating table structure:', err);
                }
              }
            }
          } else if (upperCommand.startsWith('DROP TABLE')) {
            // Extract table name from DROP TABLE query
            const match = trimmedCommand.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?[`"]?(\w+)[`"]?/i);
            if (match && match[1]) {
              const tableName = match[1];
              
              // Find table with case-insensitive matching
              const tableToDelete = tables.find((t) => 
                t.name.toLowerCase() === tableName.toLowerCase() && 
                t.databaseId === selectedDatabaseId
              );
              
              if (tableToDelete) {
                // Delete from Firebase
                try {
                  await deleteDoc(doc(db, 'tables', tableToDelete.id));
                  if (selectedTableId === tableToDelete.id) {
                    setSelectedTableId(null);
                  }
                  addLog('info', `Table '${tableName}' removed from workflow`);
                } catch (err) {
                  console.error('Error removing table from Firebase:', err);
                  addLog('warning', `Failed to remove table '${tableName}' from workflow`);
                }
              } else {
                addLog('info', `Table '${tableName}' not found in workflow (dropped from MySQL only)`);
              }
              
              // Small delay to ensure MySQL has committed the DROP
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          } else if (upperCommand.startsWith('DROP DATABASE')) {
            // Extract database name from DROP DATABASE query
            const match = trimmedCommand.match(/DROP\s+DATABASE\s+(?:IF\s+EXISTS\s+)?[`"]?(\w+)[`"]?/i);
            if (match && match[1]) {
              const dbName = match[1];
              const dbToDelete = databases.find((d) => d.name.toLowerCase() === dbName.toLowerCase());
              
              if (dbToDelete) {
                // Delete all tables in the database from Firebase
                const tablesToDelete = tables.filter((t) => t.databaseId === dbToDelete.id);
                for (const table of tablesToDelete) {
                  await deleteDoc(doc(db, 'tables', table.id));
                }
                
                // Delete database from Firebase
                await deleteDoc(doc(db, 'databases', dbToDelete.id));
                
                if (selectedDatabaseId === dbToDelete.id) {
                  setSelectedDatabaseId(null);
                }
                
                addLog('info', `Database '${dbName}' removed from workflow`);
              }
            }
          } else if (upperCommand.startsWith('INSERT INTO') || upperCommand.startsWith('UPDATE') || upperCommand.startsWith('DELETE FROM')) {
            // For data modification queries, just log success - data will be visible when queried
            addLog('info', 'Data modified successfully');
          }
        } else {
          // Log error
          if (result.formattedOutput && Array.isArray(result.formattedOutput)) {
            result.formattedOutput.forEach((line: string) => {
              addLog('error', line);
            });
          } else {
            addLog('error', result.error || 'Query execution failed');
          }
        }
      } catch (error) {
        console.error('Error executing query:', error);
        addLog('error', 'Failed to execute query. Check if MySQL is running.');
      }
    },
    [databases, selectedDatabaseId, tables, selectedTableId, addLog]
  );

  // Handle quick SQL buttons
  const handleQuickSQL = useCallback(
    (type: 'CREATE' | 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DROP') => {
      switch (type) {
        case 'CREATE':
          // If no databases exist, automatically create database
          if (databases.length === 0) {
            setIsCreateDbModalOpen(true);
          } else {
            // Show choice modal
            setIsCreateChoiceModalOpen(true);
          }
          break;
        case 'INSERT':
          setIsInsertDataModalOpen(true);
          break;
        case 'SELECT':
          setIsSelectDataModalOpen(true);
          break;
        case 'UPDATE':
          setIsUpdateDataModalOpen(true);
          break;
        case 'DELETE':
          setIsDeleteDataModalOpen(true);
          break;
        case 'DROP':
          setIsDropModalOpen(true);
          break;
      }
    },
    [selectedDatabaseId]
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`h-screen flex flex-col ${THEMES[currentTheme as keyof typeof THEMES]?.bg || THEMES.light.bg}`}
    >
      {/* Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onPresentationMode={() => {
          if (selectedDatabaseId) {
            router.push(`/presentation?db=${selectedDatabaseId}&theme=${currentTheme}`);
          }
        }}
        onTerminalMode={() => {
          if (selectedDatabaseId) {
            router.push(`/terminal-mode?db=${selectedDatabaseId}`);
          }
        }}
        showModeButtons={!!selectedDatabaseId}
        theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
      />

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 flex overflow-hidden"
      >
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
          onManageForeignKeys={() => setIsForeignKeyModalOpen(true)}
          theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          {/* React Flow Canvas */}
          <div className="flex-1 relative" ref={workflowRef}>
            {selectedDatabaseId ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-200/80 bg-white"
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitViewOptions={{
                    padding: 0.2,
                    maxZoom: 0.85,
                    minZoom: 0.5,
                  }}
                  defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
                  proOptions={{ hideAttribution: true }}
                  className={THEMES[currentTheme as keyof typeof THEMES]?.bg || THEMES.light.bg}
                >
                  <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color={THEMES[currentTheme as keyof typeof THEMES]?.dots || THEMES.light.dots}
                  />
                  <Controls
                    className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg"
                  />
                </ReactFlow>
              </motion.div>
            ) : (
              <div className={`h-full flex items-center justify-center rounded-2xl ${THEMES[currentTheme as keyof typeof THEMES]?.bg || THEMES.light.bg}`}>
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", damping: 20 }}
                  className="text-center"
                >
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="w-24 h-24 bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm border border-gray-200/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gray-200/30"
                  >
                    <svg
                      className="w-12 h-12 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-light text-gray-900 mb-3"
                    style={{ fontFamily: 'var(--font-geist-sans)' }}
                  >
                    No Database Selected
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-gray-600 mb-6 max-w-sm font-light"
                  >
                    Select or create a database to start designing tables
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCreateDbModalOpen(true)}
                    className="px-8 py-3.5 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all shadow-xl shadow-gray-900/10 font-light"
                  >
                    Create Database
                  </motion.button>
                </motion.div>
              </div>
            )}

            {/* Table count badge and Export Button */}
            <AnimatePresence>
              {selectedDatabaseId && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-8 right-8 space-y-3 z-10"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200/80"
                  >
                    <p className="text-sm text-gray-700 font-light">
                      <span className="font-light text-gray-900">
                        {selectedDatabaseName}
                      </span>{' '}
                      • {tablesForSelectedDb.length} table{tablesForSelectedDb.length !== 1 ? 's' : ''}
                    </p>
                  </motion.div>
                  
                  {/* Export Button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsExportModalOpen(true)}
                    className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl shadow-gray-900/10 font-light text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Data
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Query Results Panel */}
            <AnimatePresence>
              {queryResults && (
                <QueryResultsPanel
                  results={queryResults.results}
                  query={queryResults.query}
                  onClose={() => setQueryResults(null)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Terminal */}
          <Terminal
            logs={terminalLogs}
            onCommand={handleTerminalCommand}
            isMinimized={isTerminalMinimized}
            onToggleMinimize={() => setIsTerminalMinimized(!isTerminalMinimized)}
          />
        </div>
      </motion.div>

      {/* Settings Panel */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onLogout={handleLogout}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />

      {/* Create Choice Modal */}
      <CreateChoiceModal
        isOpen={isCreateChoiceModalOpen}
        onClose={() => setIsCreateChoiceModalOpen(false)}
        onChoose={(choice) => {
          if (choice === 'database') {
            setIsCreateDbModalOpen(true);
          } else {
            setIsCreateTableModalOpen(true);
          }
        }}
        hasSelectedDatabase={!!selectedDatabaseId}
        theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
      />

      {/* Create Database Modal */}
      <CreateDatabaseModal
        isOpen={isCreateDbModalOpen}
        onClose={() => setIsCreateDbModalOpen(false)}
        onCreate={handleCreateDatabase}
        existingNames={databases.map((d) => d.name)}
        theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
      />

      {/* Create Table Modal */}
      <CreateTableModal
        isOpen={isCreateTableModalOpen}
        onClose={() => setIsCreateTableModalOpen(false)}
        onCreate={handleCreateTable}
        existingTables={tablesForSelectedDb}
        databaseName={selectedDatabaseName}
        onInsertData={handleInsertData}
        mysqlDatabaseName={databases.find((d) => d.id === selectedDatabaseId)?.mysqlName || selectedDatabaseName}
        theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
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
        theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
      />

      {/* Insert Data Modal */}
      <InsertDataModal
        isOpen={isInsertDataModalOpen}
        onClose={() => setIsInsertDataModalOpen(false)}
        databases={databases}
        tables={tables}
        selectedDatabaseId={selectedDatabaseId}
        onInsert={handleInsertData}
        theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
      />

      {/* Update Data Modal */}
      <UpdateDataModal
        isOpen={isUpdateDataModalOpen}
        onClose={() => setIsUpdateDataModalOpen(false)}
        databases={databases}
        tables={tables}
        selectedDatabaseId={selectedDatabaseId}
        onExecuteQuery={executeQuery}
        theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
      />

      {/* Delete Data Modal */}
      <DeleteDataModal
        isOpen={isDeleteDataModalOpen}
        onClose={() => setIsDeleteDataModalOpen(false)}
        databases={databases}
        tables={tables}
        selectedDatabaseId={selectedDatabaseId}
        onExecuteQuery={executeQuery}
        theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
      />

      {/* Select Data Modal */}
      <SelectDataModal
        isOpen={isSelectDataModalOpen}
        onClose={() => setIsSelectDataModalOpen(false)}
        databases={databases}
        tables={tables}
        selectedDatabaseId={selectedDatabaseId}
        onExecuteQuery={executeQuery}
        onShowResults={(results, query) => {
          setQueryResults({ results, query });
        }}
        theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
      />

      {/* Drop Modal */}
      <DropModal
        isOpen={isDropModalOpen}
        onClose={() => setIsDropModalOpen(false)}
        databases={databases}
        tables={tables}
        selectedDatabaseId={selectedDatabaseId}
        onDropDatabase={handleDeleteDatabase}
        onDropTable={handleDropTable}
        theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
      />

      {/* Foreign Key Modal */}
      <ForeignKeyModal
        isOpen={isForeignKeyModalOpen}
        onClose={() => setIsForeignKeyModalOpen(false)}
        tables={tablesForSelectedDb}
        onAddForeignKey={handleAddForeignKey}
        onRemoveForeignKey={handleRemoveForeignKey}
        databaseName={selectedDatabaseName}
        theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        databaseName={selectedDatabaseName}
        tables={tablesForSelectedDb}
        workflowRef={workflowRef}
        theme={THEMES[currentTheme as keyof typeof THEMES] || THEMES.light}
      />
    </motion.div>
  );
}
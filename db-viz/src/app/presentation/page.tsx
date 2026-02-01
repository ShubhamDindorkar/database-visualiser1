'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeChange,
  applyNodeChanges,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Presentation, Monitor, Loader2 } from 'lucide-react';

// Firebase
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Components
import TableNode from '@/components/database/TableNode';
import RelationshipEdge from '@/components/database/RelationshipEdge';

// Hooks and Types
import { useAuth } from '@/hooks/useAuth';
import {
  Database as DatabaseType,
  Table as TableType,
} from '@/types/database';

// Node and Edge types for React Flow
const nodeTypes = {
  tableNode: TableNode,
};

const edgeTypes = {
  relationshipEdge: RelationshipEdge,
};

export default function PresentationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const databaseId = searchParams.get('db');
  const themeParam = searchParams.get('theme') || 'light';
  const { user, loading: authLoading } = useAuth();

  // Loading state for transition
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [transitionProgress, setTransitionProgress] = useState(0);

  // Theme definitions
  const THEMES = {
    light: { bg: 'bg-gradient-to-br from-gray-50 via-white to-gray-100', dots: '#000000' },
    dark: { bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900', dots: '#ffffff' },
    blue: { bg: 'bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50', dots: '#000000' },
    purple: { bg: 'bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50', dots: '#000000' },
    green: { bg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100', dots: '#000000' },
  };

  // Data State
  const [database, setDatabase] = useState<DatabaseType | null>(null);
  const [tables, setTables] = useState<TableType[]>([]);

  // Query results for table data display
  const [queryResults, setQueryResults] = useState<{ results: unknown[]; query: string; tableName: string } | null>(null);

  // React Flow state
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  // Transition animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setTransitionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2.5;
      });
    }, 75);

    const transitionTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(transitionTimer);
    };
  }, []);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Firebase: Get database
  useEffect(() => {
    if (!user || !databaseId) return;

    const unsubscribe = onSnapshot(doc(db, 'databases', databaseId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDatabase({
          id: snapshot.id,
          name: data.name,
          userId: data.userId,
          db_password_hash: data.db_password_hash,
          mysqlName: data.mysqlName,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      }
    });

    return () => unsubscribe();
  }, [user, databaseId]);

  // Firebase: Subscribe to tables
  useEffect(() => {
    if (!databaseId) {
      setTables([]);
      return;
    }

    const q = query(collection(db, 'tables'), where('databaseId', '==', databaseId));
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
  }, [databaseId]);

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

  // Handle view data from table node
  const handleViewData = useCallback(
    async (tableId: string, tableName: string) => {
      if (!database) return;
      
      const mysqlDatabaseName = database.mysqlName || database.name;
      const queryStr = `SELECT * FROM \`${tableName}\``;
      
      try {
        const response = await fetch('/api/query/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: mysqlDatabaseName,
            query: queryStr,
            userId: user?.uid,
          }),
        });
        const result = await response.json();
        
        if (result.success && result.results) {
          setQueryResults({
            results: result.results,
            query: queryStr,
            tableName,
          });
        }
      } catch (error) {
        console.error('Error fetching table data:', error);
      }
    },
    [database, user]
  );

  // Handle delete table (disabled in presentation mode)
  const handleDeleteTable = useCallback(async (tableId: string) => {
    // No-op in presentation mode
  }, []);

  // Convert tables to React Flow nodes
  useEffect(() => {
    const newNodes: Node[] = tables.map((table) => ({
      id: table.id,
      type: 'tableNode',
      position: table.position,
      data: {
        table: { ...table, columns: [...table.columns] },
        onDelete: handleDeleteTable,
        onViewData: handleViewData,
        isSelected: false,
      },
    }));
    setNodes(newNodes);
  }, [tables, handleViewData, handleDeleteTable, setNodes]);

  // Back to dashboard
  const handleBack = () => {
    router.push('/dashboard');
  };

  // Transition Screen
  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center"
        >
          {/* Presentation Screen Animation */}
          <motion.div
            initial={{ y: 50, rotateX: -30 }}
            animate={{ y: 0, rotateX: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative mb-8 flex justify-center"
          >
            {/* Monitor Frame */}
            <div className="relative">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-96 h-56 bg-white rounded-2xl border-4 border-gray-300 shadow-2xl overflow-hidden"
              >
                {/* Screen Content */}
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                  {/* Animated table placeholders */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="w-20 h-16 bg-white rounded-lg mb-3 shadow-lg border border-gray-200"
                  />
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                    className="w-20 h-16 bg-white rounded-lg ml-auto shadow-lg border border-gray-200"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.8, duration: 0.3 }}
                    className="w-16 h-0.5 bg-gray-400 mx-auto mt-2"
                  />
                </div>
              </motion.div>
              
              {/* Monitor Stand */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="w-16 h-8 bg-gray-300 mx-auto rounded-b-lg"
              />
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="w-32 h-2 bg-gray-300 mx-auto rounded-full"
              />
            </div>
          </motion.div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <Presentation className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Switching to Presentation Mode
              </h2>
            </div>
            
            {/* Progress Bar */}
            <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${transitionProgress}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              />
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-gray-600 text-sm"
            >
              Loading tables...
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${THEMES[themeParam as keyof typeof THEMES]?.bg || THEMES.light.bg}`}>
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-14 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-6 z-50"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <Presentation className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900">
            Presentation Mode
          </h1>
          {database && (
            <span className="text-gray-500 text-sm">
              — {database.name}
            </span>
          )}
        </div>

        <div className="w-40" /> {/* Spacer for centering */}
      </motion.header>

      {/* Workflow Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className={THEMES[themeParam as keyof typeof THEMES]?.bg || THEMES.light.bg}
        >
          <Controls 
            className="bg-white border-gray-200 rounded-lg shadow-md"
            showInteractive={false}
          />
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color={THEMES[themeParam as keyof typeof THEMES]?.dots || THEMES.light.dots}
          />
        </ReactFlow>

        {/* Query Results Panel */}
        <AnimatePresence>
          {queryResults && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="absolute top-4 right-4 w-[800px] max-h-[85vh] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-40"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div>
                  <h3 className="font-semibold text-gray-900">{queryResults.tableName}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">{queryResults.query}</p>
                </div>
                <button
                  onClick={() => setQueryResults(null)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[70vh]">
                {Array.isArray(queryResults.results) && queryResults.results.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300 bg-gray-50">
                        {Object.keys(queryResults.results[0] as object).map((key) => (
                          <th key={key} className="text-left py-3 px-4 text-gray-700 font-semibold whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResults.results.map((row, i) => (
                        <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                          {Object.values(row as object).map((val, j) => (
                            <td key={j} className="py-3 px-4 text-gray-700 whitespace-nowrap">
                              {String(val ?? 'NULL')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-center py-4">No data found</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

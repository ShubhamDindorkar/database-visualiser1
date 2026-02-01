'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Terminal, Play, Loader2, Database, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';

// Firebase
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Hooks and Types
import { useAuth } from '@/hooks/useAuth';
import { Database as DatabaseType } from '@/types/database';

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  success: boolean;
  duration: number;
  rowCount?: number;
}

interface QueryResult {
  success: boolean;
  results?: unknown[];
  error?: string;
  formattedOutput?: string[];
  affectedRows?: number;
}

export default function TerminalModePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const databaseId = searchParams.get('db');
  const { user, loading: authLoading } = useAuth();

  // Loading state for transition
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [transitionProgress, setTransitionProgress] = useState(0);

  // Data State
  const [database, setDatabase] = useState<DatabaseType | null>(null);

  // Terminal State
  const [query, setQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

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

  // Execute query
  const executeQuery = useCallback(async () => {
    if (!query.trim() || !database || isExecuting) return;

    const startTime = Date.now();
    setIsExecuting(true);
    setQueryResult(null);

    try {
      const response = await fetch('/api/query/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database: database.mysqlName || database.name,
          query: query.trim(),
          userId: user?.uid,
        }),
      });

      const result: QueryResult = await response.json();
      const duration = Date.now() - startTime;

      setQueryResult(result);

      // Add to history
      const historyItem: QueryHistoryItem = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: new Date(),
        success: result.success,
        duration,
        rowCount: result.results?.length || result.affectedRows,
      };
      setQueryHistory((prev) => [historyItem, ...prev.slice(0, 49)]);

      // Scroll output into view
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      setQueryResult({
        success: false,
        error: error instanceof Error ? error.message : 'Query execution failed',
      });
    } finally {
      setIsExecuting(false);
    }
  }, [query, database, user, isExecuting]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        executeQuery();
      }
    },
    [executeQuery]
  );

  // Load query from history
  const loadFromHistory = (item: QueryHistoryItem) => {
    setQuery(item.query);
    textareaRef.current?.focus();
  };

  // Clear history
  const clearHistory = () => {
    setQueryHistory([]);
  };

  // Back to dashboard
  const handleBack = () => {
    router.push('/dashboard');
  };

  // Transition Screen
  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Terminal Animation */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative mb-8"
          >
            {/* Terminal Window */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-[450px] bg-slate-900 rounded-lg border border-slate-700 shadow-2xl overflow-hidden"
            >
              {/* Terminal Header */}
              <div className="h-8 bg-slate-800 flex items-center px-3 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-slate-400 font-mono">sql-terminal</span>
              </div>

              {/* Terminal Content */}
              <div className="p-4 font-mono text-sm">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-green-400 mb-2"
                >
                  mysql&gt; <span className="text-white">SELECT * FROM users;</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-slate-400"
                >
                  +----+----------+------------------+
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="text-slate-400"
                >
                  | id | name     | email            |
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  className="text-slate-400"
                >
                  +----+----------+------------------+
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="text-cyan-400"
                >
                  3 rows in set (0.02 sec)
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 2 }}
                  className="text-green-400 mt-2"
                >
                  mysql&gt; <span className="bg-green-400 text-slate-900 px-0.5">_</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <Terminal className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-semibold text-white">
                Switching to Terminal Mode
              </h2>
            </div>
            
            {/* Progress Bar */}
            <div className="w-64 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${transitionProgress}%` }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              />
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-slate-400 text-sm"
            >
              Initializing terminal...
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-14 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-6 z-50"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-green-400" />
          <h1 className="text-lg font-semibold text-white">
            Terminal Mode
          </h1>
          {database && (
            <span className="text-slate-400 text-sm flex items-center gap-2">
              — <Database className="w-4 h-4" /> {database.name}
            </span>
          )}
        </div>

        <div className="w-40" />
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Query Editor */}
        <div className="flex-1 flex flex-col">
          {/* Query Input Area */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-slate-800"
          >
            <div className="bg-slate-900 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-3 text-slate-400 text-sm font-mono">SQL Query Editor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Enter</kbd> to execute
                  </span>
                  <span className="text-xs text-slate-600">|</span>
                  <span className="text-xs text-slate-500">
                    Separate queries with <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">;</kbd> to run multiple
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-800/50 flex flex-col items-center py-3 text-slate-600 text-xs font-mono rounded-l-lg">
                  {query.split('\n').map((_, i) => (
                    <div key={i} className="leading-6">{i + 1}</div>
                  ))}
                  {query.split('\n').length === 0 && <div className="leading-6">1</div>}
                </div>
                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your SQL query here..."
                  className="w-full h-40 pl-14 pr-4 py-3 bg-slate-800/30 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  spellCheck={false}
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-slate-500">
                  {query.length} characters
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={executeQuery}
                  disabled={isExecuting || !query.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-lg shadow-green-600/20"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Execute Query</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Output Area */}
          <motion.div
            ref={outputRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 overflow-auto bg-slate-950 p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400 text-sm font-medium">Output</span>
            </div>

            {queryResult ? (
              <div className="font-mono text-sm">
                {queryResult.success ? (
                  <div className="space-y-3">
                    {/* Success indicator */}
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Query executed successfully</span>
                    </div>

                    {/* Results table */}
                    {queryResult.results && queryResult.results.length > 0 ? (
                      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-slate-800/50 border-b border-slate-700">
                                {Object.keys(queryResult.results[0] as object).map((key) => (
                                  <th key={key} className="text-left py-3 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {queryResult.results.map((row, i) => (
                                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                  {Object.values(row as object).map((val, j) => (
                                    <td key={j} className="py-3 px-4 text-slate-400">
                                      {val === null ? (
                                        <span className="text-slate-600 italic">NULL</span>
                                      ) : (
                                        String(val)
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-800 text-slate-500 text-xs">
                          {queryResult.results.length} row{queryResult.results.length !== 1 ? 's' : ''} returned
                        </div>
                      </div>
                    ) : queryResult.affectedRows !== undefined ? (
                      <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 text-slate-400">
                        Query OK, {queryResult.affectedRows} row{queryResult.affectedRows !== 1 ? 's' : ''} affected
                      </div>
                    ) : (
                      <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 text-slate-400">
                        Query executed with no results
                      </div>
                    )}

                    {/* Formatted output */}
                    {queryResult.formattedOutput && queryResult.formattedOutput.length > 0 && (
                      <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                        {queryResult.formattedOutput.map((line, i) => (
                          <div key={i} className="text-slate-400">{line}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-4 h-4" />
                      <span>Query execution failed</span>
                    </div>
                    <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 text-red-400">
                      {queryResult.error}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                <Terminal className="w-12 h-12 mb-4 opacity-50" />
                <p>Execute a query to see results here</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Query History Sidebar */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col"
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-300">Query History</span>
            </div>
            {queryHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {queryHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-sm">
                <Clock className="w-8 h-8 mb-2 opacity-50" />
                <p>No queries yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {queryHistory.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => loadFromHistory(item)}
                    className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {item.success ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                      )}
                      <span className="text-xs text-slate-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                      <span className="text-xs text-slate-600">
                        {item.duration}ms
                      </span>
                      {item.rowCount !== undefined && (
                        <span className="text-xs text-slate-600">
                          • {item.rowCount} rows
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 font-mono truncate group-hover:text-slate-300">
                      {item.query}
                    </p>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

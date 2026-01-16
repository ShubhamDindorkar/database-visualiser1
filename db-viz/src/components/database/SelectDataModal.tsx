'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Database, Table, Loader2 } from 'lucide-react';
import Button from '@/components/common/Button';
import { Database as DatabaseType, Table as TableType } from '@/types/database';

interface SelectDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  databases: DatabaseType[];
  tables: TableType[];
  selectedDatabaseId: string | null;
  onExecuteQuery: (database: string, query: string) => Promise<{ success: boolean; results?: unknown[]; error?: string }>;
  onShowResults: (results: unknown[], query: string) => void;
}

export default function SelectDataModal({
  isOpen,
  onClose,
  databases,
  tables,
  selectedDatabaseId,
  onExecuteQuery,
  onShowResults,
}: SelectDataModalProps) {
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get tables for selected database
  const tablesForDatabase = tables.filter((t) => {
    const db = databases.find((d) => d.name === selectedDatabase);
    return db && t.databaseId === db.id;
  });

  // Set default database on open
  useEffect(() => {
    if (isOpen && selectedDatabaseId) {
      const db = databases.find((d) => d.id === selectedDatabaseId);
      if (db) {
        setSelectedDatabase(db.name);
      }
    }
  }, [isOpen, selectedDatabaseId, databases]);

  // Fetch data when table is selected
  useEffect(() => {
    if (selectedDatabase && selectedTable && isOpen) {
      fetchData();
    }
  }, [selectedDatabase, selectedTable, isOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const db = databases.find((d) => d.name === selectedDatabase);
      const mysqlDatabaseName = db?.mysqlName || selectedDatabase;
      
      // Get all data and show in workflow area via QueryResultsPanel
      const query = `SELECT * FROM \`${selectedTable}\``;
      const result = await onExecuteQuery(mysqlDatabaseName, query);

      if (result.success && Array.isArray(result.results)) {
        // Show results in workflow area
        onShowResults(result.results, query);
        
        // Close modal immediately after showing results
        handleClose();
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDatabase('');
    setSelectedTable('');
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Select Data</h2>
                    <p className="text-sm text-gray-500">
                      Choose a table to view its data in the workflow area
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Selection Row */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Database className="w-4 h-4 inline mr-2" />
                      Database
                    </label>
                    <select
                      value={selectedDatabase}
                      onChange={(e) => {
                        setSelectedDatabase(e.target.value);
                        setSelectedTable('');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select database</option>
                      {databases.map((db) => (
                        <option key={db.id} value={db.name}>
                          {db.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Table className="w-4 h-4 inline mr-2" />
                      Table
                    </label>
                    <select
                      value={selectedTable}
                      onChange={(e) => {
                        setSelectedTable(e.target.value);
                      }}
                      disabled={!selectedDatabase}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select table</option>
                      {tablesForDatabase.map((table) => (
                        <option key={table.id} value={table.name}>
                          {table.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Loading/Error States */}
                {isLoading && (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-3 text-gray-500">Loading data...</span>
                  </div>
                )}
                
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {!isLoading && !error && !selectedTable && (
                  <div className="py-16 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a database and table to view data in the workflow area</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end mt-6 pt-4 border-t">
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

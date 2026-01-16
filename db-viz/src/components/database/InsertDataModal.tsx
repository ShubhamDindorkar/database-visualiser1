'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Database, Table, Loader2 } from 'lucide-react';
import Button from '@/components/common/Button';
import { Database as DatabaseType, Table as TableType } from '@/types/database';

interface InsertDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  databases: DatabaseType[];
  tables: TableType[];
  selectedDatabaseId: string | null;
  onInsert: (database: string, table: string, values: Record<string, string>) => Promise<void>;
}

interface ColumnInfo {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}

interface RowValues {
  [key: string]: string;
}

export default function InsertDataModal({
  isOpen,
  onClose,
  databases,
  tables,
  selectedDatabaseId,
  onInsert,
}: InsertDataModalProps) {
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [rows, setRows] = useState<RowValues[]>([{}]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingColumns, setIsFetchingColumns] = useState(false);
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

  // Fetch columns when table is selected
  useEffect(() => {
    if (selectedDatabase && selectedTable) {
      fetchColumns();
    } else {
      setColumns([]);
      setRows([{}]);
    }
  }, [selectedDatabase, selectedTable]);

  const fetchColumns = async () => {
    setIsFetchingColumns(true);
    setError(null);
    try {
      const db = databases.find((d) => d.name === selectedDatabase);
      const mysqlDatabaseName = db?.mysqlName || selectedDatabase;
      
      const response = await fetch('/api/query/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database: mysqlDatabaseName,
          query: `DESCRIBE \`${selectedTable}\``,
        }),
      });
      const result = await response.json();
      
      if (result.success && Array.isArray(result.results)) {
        setColumns(result.results);
        // Initialize first row with empty strings
        const initialValues: Record<string, string> = {};
        result.results.forEach((col: ColumnInfo) => {
          initialValues[col.Field] = '';
        });
        setRows([initialValues]);
      } else {
        setError(result.error || 'Failed to fetch columns');
      }
    } catch (err) {
      setError('Failed to fetch table structure');
    } finally {
      setIsFetchingColumns(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatabase || !selectedTable) return;

    setIsLoading(true);
    setError(null);
    try {
      const db = databases.find((d) => d.name === selectedDatabase);
      const mysqlDatabaseName = db?.mysqlName || selectedDatabase;
      
      // Insert all rows
      for (const rowValues of rows) {
        await onInsert(mysqlDatabaseName, selectedTable, rowValues);
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to insert data');
    } finally {
      setIsLoading(false);
    }
  };

  const addNewRow = () => {
    const initialValues: Record<string, string> = {};
    columns.forEach((col) => {
      initialValues[col.Field] = '';
    });
    setRows([...rows, initialValues]);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const updateRowValue = (rowIndex: number, field: string, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], [field]: value };
    setRows(updatedRows);
  };

  const handleClose = () => {
    setSelectedDatabase('');
    setSelectedTable('');
    setColumns([]);
    setRows([{}]);
    setError(null);
    onClose();
  };

  const getPlaceholder = (col: ColumnInfo): string => {
    if (col.Extra === 'auto_increment') return 'Auto-generated';
    if (col.Default !== null) return `Default: ${col.Default}`;
    if (col.Null === 'YES') return 'NULL (optional)';
    return `Enter ${col.Type}`;
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Insert Data</h2>
                    <p className="text-sm text-gray-500">Add rows to a table</p>
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
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Database Selection */}
                <div className="mb-4">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a database</option>
                    {databases.map((db) => (
                      <option key={db.id} value={db.name}>
                        {db.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Table Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Table className="w-4 h-4 inline mr-2" />
                    Table
                  </label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    disabled={!selectedDatabase}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select a table</option>
                    {tablesForDatabase.map((table) => (
                      <option key={table.id} value={table.name}>
                        {table.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Loading */}
                {isFetchingColumns && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading columns...</span>
                  </div>
                )}

                {/* Column Inputs - Multiple Rows */}
                {columns.length > 0 && !isFetchingColumns && (
                  <div className="space-y-6 mt-6">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="text-sm font-medium text-gray-700">
                        Row Values ({rows.length} row{rows.length !== 1 ? 's' : ''})
                      </h3>
                    </div>
                    
                    {rows.map((rowValues, rowIndex) => (
                      <div key={rowIndex} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500">Row {rowIndex + 1}</span>
                          {rows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(rowIndex)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                              title="Remove row"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {columns.map((col) => (
                          <div key={col.Field}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {col.Field}
                              <span className="text-gray-400 font-normal ml-2">
                                ({col.Type})
                              </span>
                              {col.Key === 'PRI' && (
                                <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                                  PK
                                </span>
                              )}
                              {col.Null === 'NO' && col.Extra !== 'auto_increment' && (
                                <span className="ml-2 text-xs text-red-500">*</span>
                              )}
                            </label>
                            <input
                              type="text"
                              value={rowValues[col.Field] || ''}
                              onChange={(e) => updateRowValue(rowIndex, col.Field, e.target.value)}
                              placeholder={getPlaceholder(col)}
                              disabled={col.Extra === 'auto_increment'}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    {/* Add Row Button - Below all rows */}
                    <button
                      type="button"
                      onClick={addNewRow}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:text-green-700 hover:border-green-400 hover:bg-green-50 font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Another Row
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <Button variant="secondary" onClick={handleClose} type="button">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!selectedDatabase || !selectedTable || columns.length === 0 || isLoading}
                    isLoading={isLoading}
                  >
                    Insert {rows.length} Row{rows.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Database, Table, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/common/Button';
import { Database as DatabaseType, Table as TableType } from '@/types/database';

interface SelectDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  databases: DatabaseType[];
  tables: TableType[];
  selectedDatabaseId: string | null;
  onExecuteQuery: (database: string, query: string) => Promise<{ success: boolean; results?: unknown[]; error?: string }>;
}

interface RowData {
  [key: string]: unknown;
}

export default function SelectDataModal({
  isOpen,
  onClose,
  databases,
  tables,
  selectedDatabaseId,
  onExecuteQuery,
}: SelectDataModalProps) {
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [rows, setRows] = useState<RowData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const rowsPerPage = 10;

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
    if (selectedDatabase && selectedTable) {
      fetchData();
    } else {
      setRows([]);
      setColumns([]);
      setTotalRows(0);
    }
  }, [selectedDatabase, selectedTable, currentPage]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const db = databases.find((d) => d.name === selectedDatabase);
      const mysqlDatabaseName = db?.mysqlName || selectedDatabase;
      
      // First get total count
      const countResult = await onExecuteQuery(
        mysqlDatabaseName,
        `SELECT COUNT(*) as total FROM \`${selectedTable}\``
      );
      
      if (countResult.success && Array.isArray(countResult.results) && countResult.results.length > 0) {
        const total = (countResult.results[0] as { total: number }).total;
        setTotalRows(total);
      }

      // Then get paginated data
      const offset = (currentPage - 1) * rowsPerPage;
      const result = await onExecuteQuery(
        mysqlDatabaseName,
        `SELECT * FROM \`${selectedTable}\` LIMIT ${rowsPerPage} OFFSET ${offset}`
      );

      if (result.success && Array.isArray(result.results)) {
        setRows(result.results as RowData[]);
        if (result.results.length > 0) {
          setColumns(Object.keys(result.results[0] as object));
        }
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
    setRows([]);
    setColumns([]);
    setError(null);
    setCurrentPage(1);
    setTotalRows(0);
    onClose();
  };

  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const formatValue = (value: unknown): string => {
    if (value === null) return 'NULL';
    if (value === undefined) return '';
    if (typeof value === 'object') {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return JSON.stringify(value);
    }
    return String(value);
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">View Data</h2>
                    <p className="text-sm text-gray-500">
                      {selectedTable ? `${selectedTable} - ${totalRows} rows` : 'Select a table to view data'}
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
                        setCurrentPage(1);
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
                        setCurrentPage(1);
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

                {/* Data Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      <span className="ml-3 text-gray-500">Loading data...</span>
                    </div>
                  ) : error ? (
                    <div className="p-8 text-center text-red-600">
                      {error}
                    </div>
                  ) : !selectedTable ? (
                    <div className="p-16 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Select a database and table to view data</p>
                    </div>
                  ) : rows.length === 0 ? (
                    <div className="p-16 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No data in this table</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[40vh]">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            {columns.map((col) => (
                              <th
                                key={col}
                                className="px-4 py-3 text-left font-medium text-gray-700 border-b"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="border-b last:border-b-0 hover:bg-gray-50"
                            >
                              {columns.map((col) => (
                                <td
                                  key={col}
                                  className="px-4 py-3 text-gray-600 max-w-xs truncate"
                                  title={formatValue(row[col])}
                                >
                                  {formatValue(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">
                      Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                      {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} rows
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="px-4 py-2 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
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

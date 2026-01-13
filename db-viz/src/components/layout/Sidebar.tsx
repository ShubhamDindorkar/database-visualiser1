'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Table,
  ChevronRight,
  ChevronDown,
  Plus,
  FolderPlus,
  Play,
  FileText,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Database as DatabaseType, Table as TableType } from '@/types/database';

interface SidebarProps {
  databases: DatabaseType[];
  tables: TableType[];
  selectedDatabaseId: string | null;
  selectedTableId: string | null;
  onSelectDatabase: (databaseId: string) => void;
  onSelectTable: (tableId: string) => void;
  onCreateDatabase: () => void;
  onCreateTable: () => void;
  onDeleteDatabase: (databaseId: string) => void;
  onDeleteTable: (tableId: string) => void;
  onQuickSQL: (type: 'CREATE' | 'SELECT' | 'UPDATE' | 'DELETE') => void;
}

export default function Sidebar({
  databases,
  tables,
  selectedDatabaseId,
  selectedTableId,
  onSelectDatabase,
  onSelectTable,
  onCreateDatabase,
  onCreateTable,
  onDeleteDatabase,
  onDeleteTable,
  onQuickSQL,
}: SidebarProps) {
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(new Set());

  const toggleDatabase = (dbId: string) => {
    setExpandedDatabases((prev) => {
      const next = new Set(prev);
      if (next.has(dbId)) {
        next.delete(dbId);
      } else {
        next.add(dbId);
      }
      return next;
    });
  };

  const getTablesForDatabase = (databaseId: string) => {
    return tables.filter((t) => t.databaseId === databaseId);
  };

  const sqlButtons = [
    { type: 'CREATE' as const, color: 'bg-green-500 hover:bg-green-600', icon: Plus },
    { type: 'SELECT' as const, color: 'bg-blue-500 hover:bg-blue-600', icon: FileText },
    { type: 'UPDATE' as const, color: 'bg-yellow-500 hover:bg-yellow-600', icon: Edit3 },
    { type: 'DELETE' as const, color: 'bg-red-500 hover:bg-red-600', icon: Trash2 },
  ];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 bg-white border-r border-gray-200 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Databases
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCreateDatabase}
            className="p-1.5 rounded-lg bg-black hover:bg-gray-900 text-white transition-colors"
            title="Create Database"
          >
            <FolderPlus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Quick SQL Buttons */}
        <div className="grid grid-cols-4 gap-1">
          {sqlButtons.map(({ type, color, icon: Icon }) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuickSQL(type)}
              className={`${color} text-white text-xs py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-colors`}
              title={type}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden lg:inline">{type}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Database List */}
      <div className="flex-1 overflow-y-auto p-2">
        {databases.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              No databases yet
            </p>
            <button
              onClick={onCreateDatabase}
              className="mt-2 text-sm text-gray-800 hover:text-black font-medium underline"
            >
              Create your first database
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {databases.map((db) => {
              const isExpanded = expandedDatabases.has(db.id);
              const isSelected = selectedDatabaseId === db.id;
              const dbTables = getTablesForDatabase(db.id);

              return (
                <div key={db.id}>
                  {/* Database Item */}
                  <motion.div
                    initial={false}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group
                      ${isSelected ? 'bg-gray-200' : 'hover:bg-gray-100'}
                    `}
                    onClick={() => {
                      onSelectDatabase(db.id);
                      toggleDatabase(db.id);
                    }}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </motion.div>
                    <Database className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-gray-600'}`} />
                    <span className={`flex-1 text-sm font-medium truncate ${isSelected ? 'text-black' : 'text-gray-800'}`}>
                      {db.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {dbTables.length}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDatabase(db.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-500 transition-all"
                      title="Delete Database"
                    >
                      <Trash2 className="w-3 h-3" />
                    </motion.button>
                  </motion.div>

                  {/* Tables */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 pl-4 border-l border-gray-200 overflow-hidden"
                      >
                        {dbTables.length === 0 ? (
                          <div className="py-2 text-xs text-gray-500">
                            No tables
                          </div>
                        ) : (
                          dbTables.map((table) => {
                            const isTableSelected = selectedTableId === table.id;
                            return (
                              <motion.div
                                key={table.id}
                                whileHover={{ x: 2 }}
                                className={`
                                  flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer group
                                  ${isTableSelected ? 'bg-gray-200' : 'hover:bg-gray-100'}
                                `}
                                onClick={() => onSelectTable(table.id)}
                              >
                                <Table className={`w-3.5 h-3.5 ${isTableSelected ? 'text-gray-800' : 'text-gray-500'}`} />
                                <span className={`flex-1 text-sm truncate ${isTableSelected ? 'text-black' : 'text-gray-700'}`}>
                                  {table.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {table.columns.length} cols
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTable(table.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-500 transition-all"
                                  title="Delete Table"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </motion.button>
                              </motion.div>
                            );
                          })
                        )}

                        {/* Add Table Button */}
                        {isSelected && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onCreateTable}
                            className="flex items-center gap-2 w-full px-3 py-1.5 mt-1 rounded-lg text-gray-800 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-sm">Add Table</span>
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.aside>
  );
}

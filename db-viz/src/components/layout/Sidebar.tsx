'use client';

import React, { useState, useMemo } from 'react';
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
  PlusCircle,
  XCircle,
  Link,
  Unlink,
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
  onQuickSQL: (type: 'CREATE' | 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DROP') => void;
  onEditTable: (tableId: string) => void;
  onManageForeignKeys: () => void;
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
  onEditTable,
  onManageForeignKeys,
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

  // Memoize table counts to prevent recalculation on every render
  const tableCountsByDatabase = useMemo(() => {
    const counts: Record<string, number> = {};
    databases.forEach((db) => {
      counts[db.id] = tables.filter((t) => t.databaseId === db.id).length;
    });
    return counts;
  }, [databases, tables]);

  const getTablesForDatabase = (databaseId: string) => {
    return tables.filter((t) => t.databaseId === databaseId);
  };

  const sqlButtons = [
    { type: 'CREATE' as const, color: 'bg-green-600 hover:bg-green-700', icon: Plus },
    { type: 'INSERT' as const, color: 'bg-emerald-600 hover:bg-emerald-700', icon: PlusCircle },
    { type: 'SELECT' as const, color: 'bg-blue-600 hover:bg-blue-700', icon: FileText },
    { type: 'UPDATE' as const, color: 'bg-yellow-500 hover:bg-yellow-600', icon: Edit3 },
    { type: 'DELETE' as const, color: 'bg-orange-600 hover:bg-orange-700', icon: Trash2 },
    { type: 'DROP' as const, color: 'bg-red-600 hover:bg-red-700', icon: XCircle },
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
            className="p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
            title="Create Database"
          >
            <FolderPlus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Quick SQL Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {sqlButtons.map(({ type, color, icon: Icon }) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuickSQL(type)}
              className={`${color} text-white text-xs py-2 px-2 rounded-lg flex items-center justify-center gap-1 font-medium`}
              title={type}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{type}</span>
            </motion.button>
          ))}
        </div>

        {/* Foreign Key Management */}
        {selectedDatabaseId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 pt-3 border-t border-gray-200"
          >
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Relationships
            </label>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onManageForeignKeys}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm"
            >
              <Link className="w-4 h-4" />
              <span>Manage Foreign Keys</span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Database List */}
      <div className="flex-1 overflow-y-auto p-2">
        {databases.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-3">
              No databases yet
            </p>
            <button
              onClick={onCreateDatabase}
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800"
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
                      flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer group transition-all duration-200
                      ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}
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
                    <Database className={`w-4 h-4 ${isSelected ? 'text-gray-900' : 'text-gray-600'}`} />
                    <span className={`flex-1 text-sm font-medium truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                      {db.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      {tableCountsByDatabase[db.id] || 0}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDatabase(db.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-all"
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
                                  flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group transition-all duration-200
                                  ${isTableSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}
                                `}
                                onClick={() => onSelectTable(table.id)}
                              >
                                <Table className={`w-3.5 h-3.5 ${isTableSelected ? 'text-gray-900' : 'text-gray-500'}`} />
                                <span className={`flex-1 text-sm truncate ${isTableSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {table.name}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                  {table.columns.length} cols
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTable(table.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                                  title="Edit Table"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTable(table.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-all"
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
                            className="flex items-center gap-2 w-full px-3 py-2 mt-1 rounded-lg text-gray-600 hover:bg-gray-50 transition-all border border-dashed border-gray-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-sm font-medium">Add Table</span>
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

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
  theme?: any;
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
  theme,
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
      transition={{ duration: 0.4, delay: 0.05 }}
      className={`w-72 ${theme?.sidebar || 'bg-white/95 border-gray-200'} border-r flex flex-col h-full backdrop-blur-xl shadow-lg shadow-gray-200/10`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${theme?.navbar?.includes('slate') ? 'border-slate-700 bg-slate-800' : 'border-gray-200/80 bg-gray-50/80'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-sm font-light ${theme?.text || 'text-gray-800'} uppercase tracking-wider`}>
            Databases
          </h2>
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateDatabase}
            className={`p-2 rounded-xl ${theme?.button || 'bg-slate-900 text-white hover:bg-black'} shadow-lg shadow-gray-900/10 transition-all`}
            title="Create Database"
          >
            <FolderPlus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Quick SQL Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {sqlButtons.map(({ type, color, icon: Icon }, index) => (
            <motion.button
              key={type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuickSQL(type)}
              className={`${color} text-white text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 font-light shadow-lg shadow-black/10 transition-shadow hover:shadow-xl`}
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
            transition={{ delay: 0.2 }}
            className={`mt-3 pt-3 border-t ${theme?.navbar?.includes('slate') ? 'border-slate-700' : 'border-gray-200/80'}`}
          >
            <label className={`block text-xs font-light ${theme?.textSecondary || 'text-gray-600'} uppercase tracking-wider mb-2`}>
              Relationships
            </label>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onManageForeignKeys}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 ${theme?.buttonSecondary || 'bg-slate-700 hover:bg-slate-800 text-white'} rounded-xl font-light text-sm shadow-lg shadow-slate-900/10 transition-all`}
            >
              <Link className="w-4 h-4" />
              <span>Manage Foreign Keys</span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Database List */}
      <div className="flex-1 overflow-y-auto p-3">
        {databases.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            <div className={`w-20 h-20 mx-auto ${theme?.buttonSecondary || 'bg-gradient-to-br from-gray-100 to-gray-50'} rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-gray-200/50 border border-gray-200/50`}>
              <Database className={`w-9 h-9 ${theme?.textSecondary || 'text-gray-400'}`} />
            </div>
            <p className={`text-sm ${theme?.textSecondary || 'text-gray-600'} mb-3 font-light`}>
              No databases yet
            </p>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateDatabase}
              className={`text-sm ${theme?.button || 'bg-gray-900 text-white hover:bg-black'} px-5 py-2.5 rounded-xl font-light shadow-lg shadow-gray-900/10 transition-all`}
            >
              Create your first database
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {databases.map((db) => {
              const isExpanded = expandedDatabases.has(db.id);
              const isSelected = selectedDatabaseId === db.id;
              const dbTables = getTablesForDatabase(db.id);

              return (
                <div key={db.id}>
                  {/* Database Item */}
                  <div
                    className={`
                      flex items-center gap-2 px-3 py-3 rounded-xl cursor-pointer group transition-all duration-200
                      ${isSelected ? (theme?.buttonSecondary || 'bg-gray-100 shadow-md shadow-gray-200/50 border border-gray-200/50') : (theme?.navbar?.includes('slate') ? 'hover:bg-slate-800' : 'hover:bg-gray-50 hover:shadow-sm')}
                    `}
                    onClick={() => {
                      onSelectDatabase(db.id);
                      toggleDatabase(db.id);
                    }}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <ChevronRight className={`w-4 h-4 ${theme?.textSecondary || 'text-gray-500'}`} />
                    </motion.div>
                    <Database className={`w-4 h-4 ${isSelected ? (theme?.text || 'text-gray-900') : (theme?.textSecondary || 'text-gray-600')}`} />
                    <span className={`flex-1 text-sm font-light truncate ${isSelected ? (theme?.text || 'text-gray-900') : (theme?.text || 'text-gray-800')}`}>
                      {db.name}
                    </span>
                    <span className={`text-xs ${theme?.textSecondary || 'text-gray-600'} ${theme?.buttonSecondary || 'bg-gray-200/60'} px-2.5 py-1 rounded-lg font-light`}>
                      {tableCountsByDatabase[db.id] || 0}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDatabase(db.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all shadow-sm"
                      title="Delete Database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>

                  {/* Tables */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, type: "spring", stiffness: 200 }}
                        className={`ml-5 pl-4 border-l-2 ${theme?.navbar?.includes('slate') ? 'border-slate-700' : 'border-gray-200'} overflow-hidden mt-1`}
                      >
                        {dbTables.length === 0 ? (
                          <div className={`py-3 text-xs ${theme?.textSecondary || 'text-gray-500'} italic`}>
                            No tables
                          </div>
                        ) : (
                          dbTables.map((table) => {
                            const isTableSelected = selectedTableId === table.id;
                            return (
                              <div
                                key={table.id}
                                onClick={() => onSelectTable(table.id)}
                                className={`
                                  flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all group
                                  ${isTableSelected ? (theme?.buttonSecondary || 'bg-gray-100 shadow-sm') : (theme?.navbar?.includes('slate') ? 'hover:bg-slate-800' : 'hover:bg-gray-50')}
                                `}
                              >
                                <Table className={`w-3.5 h-3.5 ${isTableSelected ? (theme?.text || 'text-gray-900') : (theme?.textSecondary || 'text-gray-500')}`} />
                                <span className={`flex-1 text-sm truncate ${isTableSelected ? (theme?.text || 'text-gray-900') : (theme?.text || 'text-gray-700')}`}>
                                  {table.name}
                                </span>
                                <span className={`text-xs ${theme?.textSecondary || 'text-gray-500'} ${theme?.buttonSecondary || 'bg-gray-100'} px-2 py-0.5 rounded-md`}>
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
                              </div>
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
                            <span className="text-sm font-light">Add Table</span>
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
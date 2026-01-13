'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Table, Plus, Trash2, Key, Link, AlertCircle, Check } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Column, DataType, DATA_TYPES, Table as TableType, areTypesCompatible } from '@/types/database';
import { v4 as uuidv4 } from 'uuid';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, columns: Column[]) => void;
  existingTables: TableType[];
  databaseName: string;
}

interface ColumnFormData {
  id: string;
  name: string;
  dataType: DataType;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignKeyTableId: string;
  foreignKeyColumnId: string;
  isNotNull: boolean;
  isUnique: boolean;
}

export default function CreateTableModal({
  isOpen,
  onClose,
  onCreate,
  existingTables,
  databaseName,
}: CreateTableModalProps) {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<ColumnFormData[]>([
    {
      id: uuidv4(),
      name: '',
      dataType: 'INT',
      isPrimaryKey: false,
      isForeignKey: false,
      foreignKeyTableId: '',
      foreignKeyColumnId: '',
      isNotNull: false,
      isUnique: false,
    },
  ]);
  const [errors, setErrors] = useState<{ tableName?: string; columns?: { [key: string]: string } }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateTableName = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Table name is required';
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
      return 'Invalid table name format';
    }
    if (existingTables.some((t) => t.name.toLowerCase() === value.toLowerCase())) {
      return 'A table with this name already exists';
    }
    return undefined;
  };

  const validateColumns = (): { [key: string]: string } => {
    const columnErrors: { [key: string]: string } = {};
    const primaryKeys = columns.filter((c) => c.isPrimaryKey);

    if (primaryKeys.length > 1) {
      primaryKeys.forEach((pk) => {
        columnErrors[`${pk.id}-pk`] = 'Only one primary key allowed per table';
      });
    }

    const columnNames = new Set<string>();
    columns.forEach((col) => {
      if (!col.name.trim()) {
        columnErrors[`${col.id}-name`] = 'Column name is required';
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col.name)) {
        columnErrors[`${col.id}-name`] = 'Invalid column name';
      } else if (columnNames.has(col.name.toLowerCase())) {
        columnErrors[`${col.id}-name`] = 'Duplicate column name';
      } else {
        columnNames.add(col.name.toLowerCase());
      }

      if (col.isForeignKey) {
        if (!col.foreignKeyTableId) {
          columnErrors[`${col.id}-fk`] = 'Select a reference table';
        } else if (!col.foreignKeyColumnId) {
          columnErrors[`${col.id}-fk`] = 'Select a reference column';
        } else {
          const refTable = existingTables.find((t) => t.id === col.foreignKeyTableId);
          const refColumn = refTable?.columns.find((c) => c.id === col.foreignKeyColumnId);
          if (refColumn && !areTypesCompatible(col.dataType, refColumn.dataType)) {
            columnErrors[`${col.id}-fk`] = `Data type must be compatible with ${refColumn.dataType}`;
          }
          if (refColumn && !refColumn.isPrimaryKey) {
            columnErrors[`${col.id}-fk`] = 'Foreign key must reference a primary key';
          }
        }
      }
    });

    return columnErrors;
  };

  const addColumn = () => {
    setColumns([
      ...columns,
      {
        id: uuidv4(),
        name: '',
        dataType: 'INT',
        isPrimaryKey: false,
        isForeignKey: false,
        foreignKeyTableId: '',
        foreignKeyColumnId: '',
        isNotNull: false,
        isUnique: false,
      },
    ]);
  };

  const removeColumn = (id: string) => {
    if (columns.length > 1) {
      setColumns(columns.filter((c) => c.id !== id));
    }
  };

  const updateColumn = (id: string, updates: Partial<ColumnFormData>) => {
    setColumns(columns.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    setErrors((prev) => ({ ...prev, columns: {} }));
  };

  const handlePrimaryKeyToggle = (id: string) => {
    setColumns(
      columns.map((c) => ({
        ...c,
        isPrimaryKey: c.id === id ? !c.isPrimaryKey : false,
        isNotNull: c.id === id && !c.isPrimaryKey ? true : c.isNotNull,
        isUnique: c.id === id && !c.isPrimaryKey ? true : c.isUnique,
      }))
    );
  };

  const getPrimaryKeyColumns = (tableId: string): Column[] => {
    const table = existingTables.find((t) => t.id === tableId);
    return table?.columns.filter((c) => c.isPrimaryKey) || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tableNameError = validateTableName(tableName);
    const columnErrors = validateColumns();

    if (tableNameError || Object.keys(columnErrors).length > 0) {
      setErrors({ tableName: tableNameError, columns: columnErrors });
      return;
    }

    setIsLoading(true);
    try {
      const formattedColumns: Column[] = columns.map((col) => {
        const column: Column = {
          id: col.id,
          name: col.name,
          dataType: col.dataType,
          isPrimaryKey: col.isPrimaryKey,
          isForeignKey: col.isForeignKey,
          isNotNull: col.isNotNull,
          isUnique: col.isUnique,
        };

        // Only add foreignKeyReference if it's a foreign key with valid references
        if (col.isForeignKey && col.foreignKeyTableId && col.foreignKeyColumnId) {
          const refTable = existingTables.find((t) => t.id === col.foreignKeyTableId);
          const refColumn = refTable?.columns.find((c) => c.id === col.foreignKeyColumnId);
          
          if (refTable && refColumn) {
            column.foreignKeyReference = {
              tableId: col.foreignKeyTableId,
              tableName: refTable.name,
              columnId: col.foreignKeyColumnId,
              columnName: refColumn.name,
            };
          }
        }

        return column;
      });

      await onCreate(tableName, formattedColumns);
      handleClose();
    } catch (error) {
      console.error('Error creating table:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTableName('');
    setColumns([
      {
        id: uuidv4(),
        name: '',
        dataType: 'INT',
        isPrimaryKey: false,
        isForeignKey: false,
        foreignKeyTableId: '',
        foreignKeyColumnId: '',
        isNotNull: false,
        isUnique: false,
      },
    ]);
    setErrors({});
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto py-8"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-[#0F172A] rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Table className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Create Table
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      in {databaseName}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <Input
                  label="Table Name"
                  placeholder="users"
                  value={tableName}
                  onChange={(e) => {
                    setTableName(e.target.value);
                    setErrors((prev) => ({ ...prev, tableName: undefined }));
                  }}
                  error={errors.tableName}
                  leftIcon={<Table className="w-4 h-4" />}
                />

                {/* Columns Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Columns
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addColumn}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Add Column
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {columns.map((column, index) => (
                      <motion.div
                        key={column.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-slate-50 dark:bg-[#1E293B] rounded-lg space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Column name"
                              value={column.name}
                              onChange={(e) => updateColumn(column.id, { name: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border text-sm
                                bg-white dark:bg-slate-800
                                text-slate-900 dark:text-slate-100
                                border-slate-300 dark:border-slate-600
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                ${errors.columns?.[`${column.id}-name`] ? 'border-red-500' : ''}
                              `}
                            />
                            {errors.columns?.[`${column.id}-name`] && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.columns[`${column.id}-name`]}
                              </p>
                            )}
                          </div>

                          <select
                            value={column.dataType}
                            onChange={(e) => updateColumn(column.id, { dataType: e.target.value as DataType })}
                            className="px-3 py-2 rounded-lg border text-sm
                              bg-white dark:bg-slate-800
                              text-slate-900 dark:text-slate-100
                              border-slate-300 dark:border-slate-600
                              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {DATA_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>

                          {columns.length > 1 && (
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeColumn(column.id)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>

                        {/* Constraints */}
                        <div className="flex flex-wrap gap-2">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePrimaryKeyToggle(column.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
                              ${column.isPrimaryKey
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }`}
                          >
                            <Key className="w-3 h-3" />
                            PK
                          </motion.button>

                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateColumn(column.id, { isForeignKey: !column.isForeignKey })}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
                              ${column.isForeignKey
                                ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }`}
                          >
                            <Link className="w-3 h-3" />
                            FK
                          </motion.button>

                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateColumn(column.id, { isNotNull: !column.isNotNull })}
                            disabled={column.isPrimaryKey}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
                              ${column.isNotNull
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }
                              ${column.isPrimaryKey ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            NOT NULL
                          </motion.button>

                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateColumn(column.id, { isUnique: !column.isUnique })}
                            disabled={column.isPrimaryKey}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
                              ${column.isUnique
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }
                              ${column.isPrimaryKey ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            UNIQUE
                          </motion.button>
                        </div>

                        {/* Foreign Key Reference */}
                        {column.isForeignKey && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700"
                          >
                            <select
                              value={column.foreignKeyTableId}
                              onChange={(e) =>
                                updateColumn(column.id, {
                                  foreignKeyTableId: e.target.value,
                                  foreignKeyColumnId: '',
                                })
                              }
                              className="flex-1 px-3 py-2 rounded-lg border text-sm
                                bg-white dark:bg-slate-800
                                text-slate-900 dark:text-slate-100
                                border-slate-300 dark:border-slate-600
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select table...</option>
                              {existingTables.map((table) => (
                                <option key={table.id} value={table.id}>
                                  {table.name}
                                </option>
                              ))}
                            </select>

                            <select
                              value={column.foreignKeyColumnId}
                              onChange={(e) =>
                                updateColumn(column.id, { foreignKeyColumnId: e.target.value })
                              }
                              disabled={!column.foreignKeyTableId}
                              className="flex-1 px-3 py-2 rounded-lg border text-sm
                                bg-white dark:bg-slate-800
                                text-slate-900 dark:text-slate-100
                                border-slate-300 dark:border-slate-600
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">Select column...</option>
                              {getPrimaryKeyColumns(column.foreignKeyTableId).map((col) => (
                                <option key={col.id} value={col.id}>
                                  {col.name} ({col.dataType})
                                </option>
                              ))}
                            </select>
                          </motion.div>
                        )}

                        {errors.columns?.[`${column.id}-pk`] && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.columns[`${column.id}-pk`]}
                          </p>
                        )}
                        {errors.columns?.[`${column.id}-fk`] && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.columns[`${column.id}-fk`]}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </form>

              {/* Actions */}
              <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={isLoading}
                  onClick={handleSubmit}
                >
                  Create Table
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { Key, Link, Hash, Type, Calendar, ToggleLeft, FileJson, Trash2 } from 'lucide-react';
import { Table, Column, DataType } from '@/types/database';

interface TableNodeData {
  table: Table;
  onDelete: (tableId: string) => void;
  isSelected: boolean;
}

const getTypeIcon = (dataType: DataType) => {
  if (['INT', 'BIGINT', 'SMALLINT', 'TINYINT', 'FLOAT', 'DOUBLE', 'DECIMAL'].includes(dataType)) {
    return <Hash className="w-3 h-3" />;
  }
  if (['VARCHAR', 'CHAR', 'TEXT', 'LONGTEXT'].includes(dataType)) {
    return <Type className="w-3 h-3" />;
  }
  if (['DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR'].includes(dataType)) {
    return <Calendar className="w-3 h-3" />;
  }
  if (dataType === 'BOOLEAN') {
    return <ToggleLeft className="w-3 h-3" />;
  }
  if (dataType === 'JSON') {
    return <FileJson className="w-3 h-3" />;
  }
  return <Type className="w-3 h-3" />;
};

function TableNode({ data, selected }: NodeProps<TableNodeData>) {
  const { table, onDelete, isSelected } = data;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative bg-white rounded-xl overflow-hidden
        shadow-lg hover:shadow-xl transition-shadow duration-300
        border-2 ${selected || isSelected ? 'border-black' : 'border-gray-200'}
        min-w-[220px]
      `}
      style={{
        transform: 'perspective(1000px) rotateX(2deg)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 3D Effect Shadow */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none"
        style={{ transform: 'translateZ(-1px)' }}
      />

      {/* Table Header */}
      <div className="bg-black px-4 py-3 flex items-center justify-between group">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full opacity-80" />
          <h3 className="text-white font-semibold text-sm tracking-wide">
            {table.name}
          </h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(table.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/20 text-white transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Columns */}
      <div className="divide-y divide-gray-100">
        {table.columns.map((column, index) => (
          <div
            key={column.id}
            className="relative px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            {/* Source Handle for FK */}
            {column.isForeignKey && (
              <Handle
                type="source"
                position={Position.Left}
                id={`${column.id}-source`}
                className="!w-3 !h-3 !bg-gray-800 !border-2 !border-white"
                style={{ left: -6 }}
              />
            )}

            {/* Column Info */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {column.isPrimaryKey && (
                <Key className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              )}
              {column.isForeignKey && (
                <Link className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />
              )}
              <span className="text-sm text-gray-900 truncate font-medium">
                {column.name}
              </span>
            </div>

            {/* Data Type */}
            <div className="flex items-center gap-1.5 text-gray-600">
              {getTypeIcon(column.dataType)}
              <span className="text-xs font-mono">{column.dataType}</span>
            </div>

            {/* Constraints Badges */}
            <div className="flex gap-1">
              {column.isNotNull && (
                <span className="text-[10px] px-1 py-0.5 bg-gray-200 text-gray-800 rounded font-medium">
                  NN
                </span>
              )}
              {column.isUnique && !column.isPrimaryKey && (
                <span className="text-[10px] px-1 py-0.5 bg-gray-400 text-gray-800 rounded font-medium">
                  UQ
                </span>
              )}
            </div>

            {/* Target Handle for PK */}
            {column.isPrimaryKey && (
              <Handle
                type="target"
                position={Position.Right}
                id={`${column.id}-target`}
                className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
                style={{ right: -6 }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Table Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{table.columns.length} columns</span>
          <span className="flex items-center gap-1">
            {table.columns.filter((c) => c.isPrimaryKey).length > 0 && (
              <span className="flex items-center gap-0.5">
                <Key className="w-3 h-3 text-amber-500" />
                {table.columns.filter((c) => c.isPrimaryKey).length}
              </span>
            )}
            {table.columns.filter((c) => c.isForeignKey).length > 0 && (
              <span className="flex items-center gap-0.5 ml-2">
                <Link className="w-3 h-3 text-gray-700" />
                {table.columns.filter((c) => c.isForeignKey).length}
              </span>
            )}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(TableNode);

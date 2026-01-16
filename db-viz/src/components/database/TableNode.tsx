'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { Key, Link, Hash, Type, Calendar, ToggleLeft, FileJson, Trash2, ChevronRight } from 'lucide-react';
import { Table, Column, DataType } from '@/types/database';

interface TableNodeData {
  table: Table;
  onDelete: (tableId: string) => void;
  onViewData: (tableId: string, tableName: string) => void;
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
  const { table, onDelete, onViewData, isSelected } = data;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative bg-white rounded-xl overflow-visible
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
      <div className="bg-black px-4 py-3 flex items-center justify-between group rounded-t-xl">
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
      <div className="divide-y divide-gray-100 overflow-hidden">
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
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 rounded-b-xl">
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

      {/* View Data Arrow Button */}
      <motion.button
        whileHover={{ scale: 1.1, x: 3 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onViewData(table.id, table.name);
        }}
        className="absolute -right-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-black hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-20"
        title="View table data"
      >
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

// Custom comparison function for memo to check if table columns changed
const arePropsEqual = (prevProps: NodeProps<TableNodeData>, nextProps: NodeProps<TableNodeData>) => {
  // Always re-render if table or columns changed
  if (prevProps.data.table.columns.length !== nextProps.data.table.columns.length) {
    return false;
  }
  
  // Check if any column properties changed
  for (let i = 0; i < prevProps.data.table.columns.length; i++) {
    const prevCol = prevProps.data.table.columns[i];
    const nextCol = nextProps.data.table.columns[i];
    
    if (
      prevCol.name !== nextCol.name ||
      prevCol.dataType !== nextCol.dataType ||
      prevCol.isPrimaryKey !== nextCol.isPrimaryKey ||
      prevCol.isForeignKey !== nextCol.isForeignKey ||
      prevCol.isNotNull !== nextCol.isNotNull ||
      prevCol.isUnique !== nextCol.isUnique
    ) {
      return false;
    }
  }
  
  // Check other props
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.data.isSelected === nextProps.data.isSelected &&
    prevProps.data.table.id === nextProps.data.table.id
  );
};

export default memo(TableNode, arePropsEqual);


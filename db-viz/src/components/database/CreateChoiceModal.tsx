'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Table } from 'lucide-react';

interface CreateChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChoose: (choice: 'database' | 'table') => void;
  hasSelectedDatabase: boolean;
}

export default function CreateChoiceModal({
  isOpen,
  onClose,
  onChoose,
  hasSelectedDatabase,
}: CreateChoiceModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">What would you like to create?</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Create Database Option */}
              <button
                onClick={() => {
                  onChoose('database');
                  onClose();
                }}
                className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Database className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800 mb-1">Database</h3>
                    <p className="text-xs text-gray-500">Create a new database</p>
                  </div>
                </div>
              </button>

              {/* Create Table Option */}
              <button
                onClick={() => {
                  if (!hasSelectedDatabase) {
                    alert('Please select a database first');
                    return;
                  }
                  onChoose('table');
                  onClose();
                }}
                disabled={!hasSelectedDatabase}
                className={`group relative p-6 border-2 rounded-xl transition-all duration-200 ${
                  hasSelectedDatabase
                    ? 'border-gray-200 hover:border-green-500 hover:bg-green-50'
                    : 'border-gray-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    hasSelectedDatabase
                      ? 'bg-green-100 group-hover:bg-green-200'
                      : 'bg-gray-100'
                  }`}>
                    <Table className={`w-8 h-8 ${
                      hasSelectedDatabase ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800 mb-1">Table</h3>
                    <p className="text-xs text-gray-500">
                      {hasSelectedDatabase ? 'Create a new table' : 'Select database first'}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {!hasSelectedDatabase && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 Tip: Select a database from the sidebar to create tables
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

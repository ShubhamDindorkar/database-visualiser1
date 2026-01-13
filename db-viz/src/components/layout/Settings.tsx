'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Info } from 'lucide-react';
import Button from '@/components/common/Button';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({
  isOpen,
  onClose,
}: SettingsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Settings Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-black">
                Settings
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Database Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-gray-800" />
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    Database
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-black mb-1">
                      Connection Status
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-800 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-600">
                        Simulation Mode Active
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-black mb-1">
                      SQL Engine
                    </p>
                    <p className="text-xs text-gray-600">
                      MySQL 8.0 (Simulated)
                    </p>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-gray-800" />
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    About
                  </h3>
                </div>

                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-black">
                    DB Visualiser
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Version 1.0.0
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    A visual MySQL database management tool for creating and managing databases, tables, and relationships.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <Button variant="secondary" className="w-full" onClick={onClose}>
                Close Settings
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

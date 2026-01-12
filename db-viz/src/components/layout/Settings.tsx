'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Monitor, Palette, Database, Info } from 'lucide-react';
import Button from '@/components/common/Button';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function Settings({
  isOpen,
  onClose,
  isDarkMode,
  onToggleTheme,
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
            className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Settings
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Appearance Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-purple-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Appearance
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      {isDarkMode ? (
                        <Moon className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Sun className="w-5 h-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Theme
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={onToggleTheme}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        isDarkMode ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        layout
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                        style={{ left: isDarkMode ? '26px' : '4px' }}
                      />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Database Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-green-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Database
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Connection Status
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Simulation Mode Active
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      SQL Engine
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      MySQL 8.0 (Simulated)
                    </p>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    About
                  </h3>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    DB Visualiser
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Version 1.0.0
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    A visual MySQL database management tool for creating and managing databases, tables, and relationships.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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

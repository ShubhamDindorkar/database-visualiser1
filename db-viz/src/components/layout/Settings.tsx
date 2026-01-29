'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Info, User as UserIcon, LogOut } from 'lucide-react';
import Button from '@/components/common/Button';
import { User } from '@/types/database';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

export default function Settings({
  isOpen,
  onClose,
  user,
  onLogout,
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
            className="fixed right-0 top-0 h-full w-80 bg-white/90 backdrop-blur-2xl shadow-2xl z-50 flex flex-col border-l border-gray-200/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/50">
              <h2 className="text-lg font-semibold text-gray-900">
                Settings
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Profile Section */}
              {user && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <UserIcon className="w-5 h-5 text-gray-700" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Profile
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm flex items-center gap-3">
                      {user.photoURL && (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'}
                          className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {user.displayName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-red-500/25"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Database Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-gray-700" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Database
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Connection Status
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-600">
                        Simulation Mode Active
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                    <p className="text-sm font-medium text-gray-900 mb-1">
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
                  <Info className="w-5 h-5 text-gray-700" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    About
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                  <p className="text-sm font-medium text-gray-900">
                    DB Visualiser
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Version 1.0.0
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    A visual SQL database management tool for creating and managing databases, tables, and relationships.
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

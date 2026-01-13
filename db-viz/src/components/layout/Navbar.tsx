'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import Image from 'next/image';
import { User as UserType } from '@/types/database';

interface NavbarProps {
  user: UserType | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export default function Navbar({
  user,
  isDarkMode,
  onToggleTheme,
  onLogout,
  onOpenSettings,
}: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-700 px-4 flex items-center justify-between shadow-sm z-50"
    >
      {/* Logo and App Name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            DB Visualiser
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            MySQL Workbench
          </p>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </motion.button>

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenSettings}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Settings"
        >
          <SettingsIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </motion.button>

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {user.displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'User'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-600"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}

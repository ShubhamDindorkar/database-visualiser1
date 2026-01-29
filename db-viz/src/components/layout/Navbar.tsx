'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import Image from 'next/image';
import { User as UserType } from '@/types/database';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export default function Navbar({
  user,
  onLogout,
  onOpenSettings,
}: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 flex items-center justify-between shadow-sm z-50"
    >
      {/* Logo and App Name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center shadow-lg">
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
          <h1 className="text-xl font-bold text-gray-900">
            DB Visualiser
          </h1>
          <p className="text-xs text-gray-500">
            {/* MySQL Workbench */}
          </p>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-white/50 hover:bg-white/80 border border-gray-200/50 shadow-sm transition-all"
          aria-label="Settings"
        >
          <SettingsIcon className="w-5 h-5 text-gray-700" />
        </motion.button>

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200/50">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user.displayName}
              </p>
              <p className="text-xs text-gray-500">
                {user.email}
              </p>
            </div>
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'User'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLogout}
              className="p-2 rounded-xl bg-red-50/80 hover:bg-red-100 text-red-600 transition-all border border-red-200/50"
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

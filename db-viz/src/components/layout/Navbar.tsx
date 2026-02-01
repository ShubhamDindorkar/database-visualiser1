'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Settings as SettingsIcon, User, Presentation, Terminal } from 'lucide-react';
import Image from 'next/image';
import { User as UserType } from '@/types/database';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  onOpenSettings: () => void;
  onPresentationMode?: () => void;
  onTerminalMode?: () => void;
  showModeButtons?: boolean;
  theme?: any;
}

export default function Navbar({
  user,
  onLogout,
  onOpenSettings,
  onPresentationMode,
  onTerminalMode,
  showModeButtons = false,
  theme,
}: NavbarProps) {
  const initialHeight = 64; // px (h-16)
  const maxExtra = 24; // max extra px to expand
  const expandScrollRange = 300; // px of scroll after which nav reaches full expansion

  const [height, setHeight] = useState<number>(initialHeight);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function onScroll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        const extra = Math.min(y, expandScrollRange) / expandScrollRange * maxExtra;
        setHeight(Math.round(initialHeight + extra));
      });
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

    const extra = Math.max(0, height - initialHeight);
    const basePaddingTop = 12; // px
    const paddingTop = Math.round(basePaddingTop + extra * 0.6);

    return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{ height: `${height}px`, paddingTop: `${paddingTop}px`, paddingBottom: `12px` }}
      className={`${theme?.navbar || 'bg-white/80 border-gray-200/50'} backdrop-blur-xl border-b px-4 flex items-start justify-between shadow-sm z-50 transition-[height,padding] duration-200 ease-out`}
    >
      {/* Logo and App Name */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${theme?.button || 'bg-gradient-to-br from-gray-900 to-black'} rounded-xl flex items-center justify-center shadow-lg ${theme?.navbar?.includes('slate') ? 'ring-2 ring-slate-600' : ''}`}>
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
          <h1 className={`text-xl font-bold ${theme?.text || 'text-gray-900'}`}>
            DB Visualiser
          </h1>
          <p className={`text-xs ${theme?.textSecondary || 'text-gray-500'}`}>
            {/* MySQL Workbench */}
          </p>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Mode Buttons */}
        {showModeButtons && (
          <div className="flex items-center gap-2 pr-3 border-r border-gray-200/50">
            {/* Presentation Mode */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onPresentationMode}
              className={`relative p-2.5 rounded-xl ${theme?.buttonSecondary || 'bg-white/50 hover:bg-blue-50 border-gray-200/50 hover:border-blue-200'} border shadow-sm transition-all group`}
              aria-label="Presentation Mode"
            >
              <Presentation className={`w-5 h-5 ${theme?.text || 'text-gray-600'} group-hover:text-blue-600 transition-colors`} />
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                Switch to Presentation Mode
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-slate-900" />
              </div>
            </motion.button>

            {/* Terminal Mode */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onTerminalMode}
              className={`relative p-2.5 rounded-xl ${theme?.buttonSecondary || 'bg-white/50 hover:bg-green-50 border-gray-200/50 hover:border-green-200'} border shadow-sm transition-all group`}
              aria-label="Terminal Mode"
            >
              <Terminal className={`w-5 h-5 ${theme?.text || 'text-gray-600'} group-hover:text-green-600 transition-colors`} />
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                Switch to Terminal Mode
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-slate-900" />
              </div>
            </motion.button>
          </div>
        )}

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenSettings}
          className={`p-2 rounded-xl ${theme?.buttonSecondary || 'bg-white/50 hover:bg-white/80 text-gray-700'} border ${theme?.navbar?.includes('border-gray') ? 'border-gray-200/50' : theme?.navbar?.includes('slate') ? 'border-slate-600' : 'border-gray-200/50'} shadow-sm transition-all`}
          aria-label="Settings"
        >
          <SettingsIcon className={`w-5 h-5 ${theme?.text || 'text-gray-700'}`} />
        </motion.button>

        {/* User Profile */}
        {user && (
          <div className={`flex items-center gap-3 pl-4 border-l ${theme?.navbar?.includes('border-gray') ? 'border-gray-200/50' : theme?.navbar?.includes('slate') ? 'border-slate-600' : 'border-gray-200/50'}`}>
            <div className="text-right hidden sm:block">
              <p className={`text-sm font-medium ${theme?.text || 'text-gray-900'}`}>
                {user.displayName}
              </p>
              <p className={`text-xs ${theme?.textSecondary || 'text-gray-500'}`}>
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
              <div className={`w-10 h-10 rounded-full ${theme?.button || 'bg-gradient-to-br from-gray-900 to-black'} flex items-center justify-center shadow-md`}>
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

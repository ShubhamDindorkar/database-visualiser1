'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const rafRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileDropdownOpen]);

    const extra = Math.max(0, height - initialHeight);
    const basePaddingTop = 12; // px
    const paddingTop = Math.round(basePaddingTop + extra * 0.6);

    return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ height: `${height}px`, paddingTop: `${paddingTop}px`, paddingBottom: `12px` }}
      className={`${theme?.navbar || 'bg-white/95 border-gray-200/50'} backdrop-blur-2xl border-b px-6 flex items-start justify-between shadow-lg shadow-gray-200/20 z-50 transition-[height,padding] duration-200 ease-out`}
    >
      {/* Logo and App Name */}
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3"
      >
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
          <h1 className={`text-xl font-light ${theme?.text || 'text-gray-900'}`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
            DB Visualiser
          </h1>
          <p className={`text-xs font-light ${theme?.textSecondary || 'text-gray-500'}`}>
            {/* MySQL Workbench */}
          </p>
        </div>
      </motion.div>

      {/* Right Side Actions */}
      <motion.div 
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3"
      >
        {/* Mode Buttons */}
        {showModeButtons && (
          <div className="flex items-center gap-2 pr-3 border-r border-gray-200/50">
            {/* Presentation Mode */}
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPresentationMode}
              className={`relative p-2.5 rounded-xl ${theme?.buttonSecondary || 'bg-white hover:bg-blue-50 border-gray-200/80 hover:border-blue-300'} border shadow-md shadow-gray-200/30 transition-all group`}
              aria-label="Presentation Mode"
            >
              <Presentation className={`w-5 h-5 ${theme?.text || 'text-gray-600'} group-hover:text-blue-600 transition-colors`} />
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-light rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                Switch to Presentation Mode
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-slate-900" />
              </div>
            </motion.button>

            {/* Terminal Mode */}
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onTerminalMode}
              className={`relative p-2.5 rounded-xl ${theme?.buttonSecondary || 'bg-white hover:bg-green-50 border-gray-200/80 hover:border-green-300'} border shadow-md shadow-gray-200/30 transition-all group`}
              aria-label="Terminal Mode"
            >
              <Terminal className={`w-5 h-5 ${theme?.text || 'text-gray-600'} group-hover:text-green-600 transition-colors`} />
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-light rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                Switch to Terminal Mode
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-slate-900" />
              </div>
            </motion.button>
          </div>
        )}

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSettings}
          className={`p-2.5 rounded-xl ${theme?.buttonSecondary || 'bg-white hover:bg-gray-50 text-gray-700'} border ${theme?.navbar?.includes('border-gray') ? 'border-gray-200/80' : theme?.navbar?.includes('slate') ? 'border-slate-600' : 'border-gray-200/80'} shadow-md shadow-gray-200/30 transition-all`}
          aria-label="Settings"
        >
          <SettingsIcon className={`w-5 h-5 ${theme?.text || 'text-gray-700'}`} />
        </motion.button>

        {/* User Profile with Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className={`flex items-center gap-2 pl-4 border-l ${theme?.navbar?.includes('border-gray') ? 'border-gray-200/50' : theme?.navbar?.includes('slate') ? 'border-slate-600' : 'border-gray-200/50'} cursor-pointer`}
              aria-label="User Profile"
            >
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
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 mt-2 w-72 ${theme?.modal || 'bg-white'} rounded-2xl shadow-2xl border ${theme?.navbar?.includes('slate') ? 'border-slate-700' : 'border-gray-200'} overflow-hidden z-50`}
                >
                  {/* Profile Info */}
                  <div className={`p-4 border-b ${theme?.navbar?.includes('slate') ? 'border-slate-700' : 'border-gray-200'}`}>
                    <div className="space-y-1">
                      <p className={`text-base font-light ${theme?.text || 'text-gray-900'}`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
                        {user.displayName || 'User'}
                      </p>
                      <p className={`text-sm font-light ${theme?.textSecondary || 'text-gray-500'} break-words`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <div className="p-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 ${theme?.navbar?.includes('slate') ? 'bg-slate-700 hover:bg-slate-600' : 'bg-black hover:bg-gray-900'} text-white rounded-lg transition-all text-sm shadow-md`}
                      style={{ fontFamily: 'var(--font-geist-sans)' }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.nav>
  );
}

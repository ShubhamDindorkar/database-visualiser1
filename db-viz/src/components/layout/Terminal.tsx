'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X, Minus, Maximize2, ChevronUp, ChevronDown } from 'lucide-react';
import { TerminalLog } from '@/types/database';

interface TerminalProps {
  logs: TerminalLog[];
  onCommand: (command: string) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export default function Terminal({
  logs,
  onCommand,
  isMinimized,
  onToggleMinimize,
}: TerminalProps) {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCommand(input.trim());
      setCommandHistory((prev) => [...prev, input.trim()]);
      setInput('');
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const getLogColor = (type: TerminalLog['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-gray-900/95 backdrop-blur-2xl border-t border-gray-700/50 flex flex-col shadow-2xl shadow-gray-900/20"
      style={{ height: isMinimized ? '48px' : '220px' }}
    >
      {/* Terminal Header */}
      <motion.div 
        className="flex items-center justify-between px-4 py-2.5 bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/50"
        whileHover={{ backgroundColor: 'rgba(31, 41, 55, 0.95)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <motion.div 
              whileHover={{ scale: 1.2 }}
              className="w-3 h-3 rounded-full bg-red-500"
            />
            <motion.div 
              whileHover={{ scale: 1.2 }}
              className="w-3 h-3 rounded-full bg-yellow-500"
            />
            <motion.div 
              whileHover={{ scale: 1.2 }}
              className="w-3 h-3 rounded-full bg-green-500"
            />
          </div>
          <div className="ml-3 flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">SQL Terminal</span>
            <span className="text-xs text-gray-400 bg-gray-700/60 px-2.5 py-1 rounded-lg font-medium">MySQL 8.0</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(55, 65, 81, 0.8)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleMinimize}
            className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Terminal Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {/* Logs Area */}
            <div
              className="flex-1 overflow-y-auto p-4 font-mono text-sm"
              onClick={() => inputRef.current?.focus()}
            >
              {/* Welcome Message */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-white mb-3"
              >
                <p className="text-gray-300">Welcome to MySQL Terminal (Connected to Local MySQL)</p>
                <p className="text-gray-400 text-xs mt-1">Type SQL commands or &apos;help&apos; for assistance.</p>
                <p className="text-gray-600 mt-2">---</p>
              </motion.div>

              {/* Logs */}
              {logs.map((log, index) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex gap-2 mb-1"
                >
                  <span className="text-gray-600">[{formatTimestamp(log.timestamp)}]</span>
                  <span className={getLogColor(log.type)}>{log.message}</span>
                </motion.div>
              ))}
              <div ref={logsEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="flex items-center px-4 pb-3 gap-2">
              <span className="text-white font-mono font-medium">mysql&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 outline-none text-white font-mono text-sm placeholder:text-gray-500 focus:border-gray-600 focus:bg-gray-800 transition-all"
                placeholder="Enter SQL command..."
                autoComplete="off"
                spellCheck={false}
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

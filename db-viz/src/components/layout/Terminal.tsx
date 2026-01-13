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
        return 'text-blue-400';
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
      className="bg-[#0F172A] border-t border-slate-700 flex flex-col"
      style={{ height: isMinimized ? '40px' : '200px' }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1E293B] border-b border-slate-700">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-slate-300">SQL Terminal</span>
          <span className="text-xs text-slate-500">MySQL 8.0</span>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleMinimize}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Terminal Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {/* Logs Area */}
            <div
              className="flex-1 overflow-y-auto p-3 font-mono text-sm"
              onClick={() => inputRef.current?.focus()}
            >
              {/* Welcome Message */}
              <div className="text-slate-500 mb-2">
                <p>Welcome to MySQL Terminal (Simulation Mode)</p>
                <p>Type SQL commands or &apos;help&apos; for assistance.</p>
                <p className="text-slate-600">---</p>
              </div>

              {/* Logs */}
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2 mb-1">
                  <span className="text-slate-600">[{formatTimestamp(log.timestamp)}]</span>
                  <span className={getLogColor(log.type)}>{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="flex items-center px-3 pb-3">
              <span className="text-emerald-400 font-mono">mysql&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm ml-2 placeholder:text-slate-600"
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

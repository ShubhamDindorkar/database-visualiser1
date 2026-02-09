'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Copy, Check, Loader2 } from 'lucide-react';
import { findMatchingIntent, SQLIntent } from '@/data/sqlKnowledgeBase';

interface Message {
    id: string;
    type: 'user' | 'bot';
    content: string;
    sql?: string[];
    timestamp: Date;
}

interface SQLChatbotProps {
    theme?: {
        navbar?: string;
        text?: string;
        textSecondary?: string;
        modal?: string;
    };
}

export default function SQLChatbot({ theme }: SQLChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            type: 'bot',
            content: "Hi! I'm your SQL Assistant. I can help you with:\n\n• Creating databases & tables\n• SELECT, INSERT, UPDATE, DELETE\n• JOINs and relationships\n• Constraints & indexes\n• SQL functions\n\nAsk me anything about SQL!",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentInput = inputValue.trim();
        setInputValue('');

        // First try rule-based matching
        const matchedIntent: SQLIntent | null = findMatchingIntent(currentInput);

        if (matchedIntent) {
            // Rule-based response found - use it immediately
            setTimeout(() => {
                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    type: 'bot',
                    content: matchedIntent.response.explanation,
                    sql: matchedIntent.response.sql,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMessage]);
            }, 300);
        } else {
            // No rule-based match - use OpenRouter AI fallback
            setIsLoading(true);

            try {
                const response = await fetch('/api/chat/openrouter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: currentInput }),
                });

                const data = await response.json();

                // Extract SQL queries - prefer API-provided sql, fall back to regex extraction
                let sqlQueries: string[] = data.sql || [];

                // If no SQL from API, try to extract from the message content
                if (sqlQueries.length === 0 && data.success && data.message) {
                    // Extract SQL from markdown code blocks
                    const codeBlockRegex = /```(?:sql)?\s*([\s\S]*?)```/gi;
                    let match;
                    while ((match = codeBlockRegex.exec(data.message)) !== null) {
                        const sqlContent = match[1].trim();
                        if (sqlContent && /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE|USE|SHOW|DESCRIBE|EXPLAIN|WITH)\b/i.test(sqlContent)) {
                            sqlQueries.push(sqlContent);
                        }
                    }
                }

                // Clean the message by removing SQL code blocks and standalone SQL
                let cleanMessage = data.message;
                if (sqlQueries.length > 0) {
                    // Remove markdown code blocks
                    cleanMessage = cleanMessage.replace(/```(?:sql)?\s*[\s\S]*?```/gi, '');

                    // Also remove the actual SQL statements if they appear as plain text
                    for (const sql of sqlQueries) {
                        // Escape special regex characters in the SQL
                        const escapedSQL = sql.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        cleanMessage = cleanMessage.replace(new RegExp(escapedSQL, 'gi'), '');
                    }

                    // Clean up extra whitespace and newlines
                    cleanMessage = cleanMessage.replace(/\n{3,}/g, '\n\n').trim();
                }

                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    type: 'bot',
                    content: data.success
                        ? (cleanMessage || data.message)
                        : "I'm sorry, I couldn't process your request right now. Please try again or ask a different SQL-related question.",
                    sql: sqlQueries.length > 0 ? sqlQueries : undefined,
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, botMessage]);
            } catch (error) {
                console.error('OpenRouter API error:', error);

                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    type: 'bot',
                    content: "I'm having trouble connecting to the AI service. Please check your connection and try again.",
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const copyToClipboard = (sql: string[], messageId: string) => {
        const text = sql.join('\n');
        navigator.clipboard.writeText(text);
        setCopiedId(messageId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const quickQuestions = [
        "Create users table",
        "How to JOIN tables?",
        "What is foreign key?",
        "SELECT with WHERE"
    ];

    const handleQuickQuestion = (question: string) => {
        setInputValue(question);
        setTimeout(() => handleSend(), 100);
    };

    const isDark = theme?.navbar?.includes('slate');

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${isOpen
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                }}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <Bot className="w-6 h-6" />
                )}
            </motion.button>

            {/* Chat Popup */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-48px)] rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'
                            }`}
                        style={{
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                            maxHeight: 'calc(100vh - 150px)',
                        }}
                    >
                        {/* Header */}
                        <div className={`p-4 border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-600' : 'bg-gray-900'}`}>
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
                                        SQL Assistant
                                    </h3>
                                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
                                        Rule-based SQL helper
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            className={`p-4 overflow-y-auto ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                            style={{ height: '350px' }}
                        >
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${message.type === 'user'
                                            ? 'bg-blue-600'
                                            : isDark ? 'bg-slate-700' : 'bg-gray-100'
                                            }`}>
                                            {message.type === 'user' ? (
                                                <User className="w-4 h-4 text-white" />
                                            ) : (
                                                <Bot className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`} />
                                            )}
                                        </div>

                                        {/* Message Content */}
                                        <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                                            <div className={`inline-block p-3 rounded-xl max-w-full text-left ${message.type === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : isDark ? 'bg-slate-800 text-slate-200' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                <p className="text-sm whitespace-pre-wrap" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                                                    {message.content}
                                                </p>

                                                {/* SQL Code Block */}
                                                {message.sql && message.sql.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className={`relative rounded-lg overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-gray-900'}`}>
                                                            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
                                                                <span className="text-xs text-gray-400">SQL</span>
                                                                <button
                                                                    onClick={() => copyToClipboard(message.sql!, message.id)}
                                                                    className="text-gray-400 hover:text-white transition-colors"
                                                                >
                                                                    {copiedId === message.id ? (
                                                                        <Check className="w-4 h-4 text-green-400" />
                                                                    ) : (
                                                                        <Copy className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <pre className="p-3 overflow-x-auto text-sm">
                                                                <code className="text-green-400">
                                                                    {message.sql.join('\n')}
                                                                </code>
                                                            </pre>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Quick Questions */}
                        {messages.length <= 2 && (
                            <div className={`px-4 pb-2 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                                <p className={`text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Quick questions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickQuestions.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => handleQuickQuestion(q)}
                                            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${isDark
                                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            style={{ fontFamily: 'var(--font-geist-sans)' }}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className={`p-4 border-t ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about SQL..."
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                                        ? 'bg-slate-700 text-white placeholder-slate-400 border-slate-600'
                                        : 'bg-white text-gray-900 placeholder-gray-400 border-gray-200'
                                        } border`}
                                    style={{ fontFamily: 'var(--font-geist-sans)' }}
                                />
                                <motion.button
                                    whileHover={{ scale: isLoading ? 1 : 1.05 }}
                                    whileTap={{ scale: isLoading ? 1 : 0.95 }}
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isLoading}
                                    className={`p-2.5 rounded-xl transition-all ${inputValue.trim() && !isLoading
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : isDark ? 'bg-slate-700 text-slate-500' : 'bg-gray-200 text-gray-400'
                                        }`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

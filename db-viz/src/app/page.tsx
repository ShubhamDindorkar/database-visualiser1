'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Database, Table, GitBranch, Terminal, Sparkles, ArrowRight, Check } from 'lucide-react';
import Button from '@/components/common/Button';

// Initial positions for the draggable tables
const INITIAL_POSITIONS = {
  users: { x: 0, y: 0 },
  orders: { x: 0, y: 0 },
  products: { x: 0, y: 0 },
};

const features = [
  {
    icon: Database,
    title: 'Create Databases',
    description: 'Design and manage multiple databases with visual tools',
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Table,
    title: 'Visual Tables',
    description: 'Build tables with columns, types, and constraints visually',
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    icon: GitBranch,
    title: 'Relationships',
    description: 'Define primary and foreign keys with visual connectors',
    color: 'text-sky-500',
    bg: 'bg-sky-100 dark:bg-sky-900/30',
  },
  {
    icon: Terminal,
    title: 'SQL Terminal',
    description: 'Interactive terminal with SQL syntax highlighting',
    color: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
];

const capabilities = [
  'Drag-and-drop table positioning',
  'Real-time relationship visualization',
  'SQL constraint validation',
  'Dark and light theme support',
  'Cloud sync with Firebase',
  'Export schema diagrams',
];

export default function LandingPage() {
  const router = useRouter();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [tablePositions, setTablePositions] = useState(INITIAL_POSITIONS);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  const handleDrag = useCallback((tableId: string, info: { offset: { x: number; y: number } }) => {
    setTablePositions(prev => ({
      ...prev,
      [tableId]: { x: info.offset.x, y: info.offset.y }
    }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"
              >
                <Database className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                DB Visualiser
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#020617] dark:to-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Visual Database Design Tool
              </span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6"
            >
              Design Your{' '}
              <span className="text-blue-600 dark:text-blue-400">
                MySQL Database
              </span>{' '}
              Visually
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10"
            >
              Create, manage, and visualize your MySQL databases with an intuitive drag-and-drop interface.
              Design tables, define relationships, and see your schema come to life.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/login')}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Get Started Free
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </motion.div>
          </div>

          {/* Hero Illustration - Draggable Tables with Relations */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 relative"
          >
            <div className="bg-slate-100 dark:bg-[#1E293B] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 p-8 min-h-[400px]">
              {/* Interactive Database Schema Visualization */}
              <div 
                ref={constraintsRef}
                className="relative w-full h-[350px]"
              >
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-slate-600" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Dynamic Relationship Lines SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                  {/* Line from Users to Orders */}
                  <motion.line
                    x1={140 + tablePositions.users.x}
                    y1={175 + tablePositions.users.y}
                    x2={340 + tablePositions.orders.x}
                    y2={175 + tablePositions.orders.y}
                    stroke="#2563EB"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  {/* Connection dots */}
                  <motion.circle
                    cx={140 + tablePositions.users.x}
                    cy={175 + tablePositions.users.y}
                    r="5"
                    fill="#2563EB"
                    animate={{ scale: isDragging ? 1 : [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: isDragging ? 0 : Infinity }}
                  />
                  <motion.circle
                    cx={340 + tablePositions.orders.x}
                    cy={175 + tablePositions.orders.y}
                    r="5"
                    fill="#2563EB"
                    animate={{ scale: isDragging ? 1 : [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: isDragging ? 0 : Infinity, delay: 0.3 }}
                  />

                  {/* Line from Orders to Products */}
                  <motion.line
                    x1={520 + tablePositions.orders.x}
                    y1={175 + tablePositions.orders.y}
                    x2={720 + tablePositions.products.x}
                    y2={175 + tablePositions.products.y}
                    stroke="#10B981"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                  {/* Connection dots */}
                  <motion.circle
                    cx={520 + tablePositions.orders.x}
                    cy={175 + tablePositions.orders.y}
                    r="5"
                    fill="#10B981"
                    animate={{ scale: isDragging ? 1 : [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: isDragging ? 0 : Infinity, delay: 0.5 }}
                  />
                  <motion.circle
                    cx={720 + tablePositions.products.x}
                    cy={175 + tablePositions.products.y}
                    r="5"
                    fill="#10B981"
                    animate={{ scale: isDragging ? 1 : [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: isDragging ? 0 : Infinity, delay: 0.7 }}
                  />
                </svg>

                {/* Table 1: Users - Left */}
                <motion.div
                  drag
                  dragConstraints={constraintsRef}
                  dragElastic={0.1}
                  dragMomentum={false}
                  onDrag={(_, info) => handleDrag('users', info)}
                  onDragStart={() => setIsDragging('users')}
                  onDragEnd={() => setIsDragging(null)}
                  whileDrag={{ scale: 1.02, zIndex: 50 }}
                  animate={!isDragging ? { y: [0, -8, 0] } : {}}
                  transition={!isDragging ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
                  className="absolute left-[20px] top-[100px] w-[160px] bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing select-none"
                  style={{ zIndex: isDragging === 'users' ? 50 : 2 }}
                >
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-white/80 rounded-full" />
                    <span className="text-white font-semibold text-sm">Users</span>
                    <div className="ml-auto text-white/60 text-xs">⋮⋮</div>
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-400 rounded flex items-center justify-center">
                        <span className="text-[7px] text-amber-900 font-bold">PK</span>
                      </div>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">id</span>
                      <span className="text-[10px] text-slate-400 ml-auto">INT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-200 dark:bg-slate-600 rounded" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">email</span>
                      <span className="text-[10px] text-slate-400 ml-auto">VARCHAR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-200 dark:bg-slate-600 rounded" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">name</span>
                      <span className="text-[10px] text-slate-400 ml-auto">VARCHAR</span>
                    </div>
                  </div>
                </motion.div>

                {/* Table 2: Orders - Center */}
                <motion.div
                  drag
                  dragConstraints={constraintsRef}
                  dragElastic={0.1}
                  dragMomentum={false}
                  onDrag={(_, info) => handleDrag('orders', info)}
                  onDragStart={() => setIsDragging('orders')}
                  onDragEnd={() => setIsDragging(null)}
                  whileDrag={{ scale: 1.02, zIndex: 50 }}
                  animate={!isDragging ? { y: [0, 10, 0] } : {}}
                  transition={!isDragging ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } : {}}
                  className="absolute left-[340px] top-[80px] w-[180px] bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing select-none"
                  style={{ zIndex: isDragging === 'orders' ? 50 : 3 }}
                >
                  <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-white/80 rounded-full" />
                    <span className="text-white font-semibold text-sm">Orders</span>
                    <div className="ml-auto text-white/60 text-xs">⋮⋮</div>
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-400 rounded flex items-center justify-center">
                        <span className="text-[7px] text-amber-900 font-bold">PK</span>
                      </div>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">id</span>
                      <span className="text-[10px] text-slate-400 ml-auto">INT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-sky-400 rounded flex items-center justify-center">
                        <span className="text-[7px] text-sky-900 font-bold">FK</span>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-300">user_id</span>
                      <span className="text-[10px] text-slate-400 ml-auto">INT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-sky-400 rounded flex items-center justify-center">
                        <span className="text-[7px] text-sky-900 font-bold">FK</span>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-300">product_id</span>
                      <span className="text-[10px] text-slate-400 ml-auto">INT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-200 dark:bg-slate-600 rounded" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">total</span>
                      <span className="text-[10px] text-slate-400 ml-auto">DECIMAL</span>
                    </div>
                  </div>
                </motion.div>

                {/* Table 3: Products - Right */}
                <motion.div
                  drag
                  dragConstraints={constraintsRef}
                  dragElastic={0.1}
                  dragMomentum={false}
                  onDrag={(_, info) => handleDrag('products', info)}
                  onDragStart={() => setIsDragging('products')}
                  onDragEnd={() => setIsDragging(null)}
                  whileDrag={{ scale: 1.02, zIndex: 50 }}
                  animate={!isDragging ? { y: [0, -6, 0] } : {}}
                  transition={!isDragging ? { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 } : {}}
                  className="absolute left-[680px] top-[100px] w-[160px] bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing select-none"
                  style={{ zIndex: isDragging === 'products' ? 50 : 2 }}
                >
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-white/80 rounded-full" />
                    <span className="text-white font-semibold text-sm">Products</span>
                    <div className="ml-auto text-white/60 text-xs">⋮⋮</div>
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-400 rounded flex items-center justify-center">
                        <span className="text-[7px] text-amber-900 font-bold">PK</span>
                      </div>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">id</span>
                      <span className="text-[10px] text-slate-400 ml-auto">INT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-200 dark:bg-slate-600 rounded" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">name</span>
                      <span className="text-[10px] text-slate-400 ml-auto">VARCHAR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-200 dark:bg-slate-600 rounded" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">price</span>
                      <span className="text-[10px] text-slate-400 ml-auto">DECIMAL</span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating glow effects */}
                <motion.div
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute left-[10%] top-[30%] w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"
                />
                <motion.div
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute right-[10%] top-[25%] w-28 h-28 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
                />
                <motion.div
                  animate={{ opacity: [0.25, 0.45, 0.25] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute left-[45%] top-[40%] w-24 h-24 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"
                />

                {/* Drag hint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2 pointer-events-none">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 9l4-4 4 4M5 15l4 4 4-4" />
                  </svg>
                  Drag tables to reposition
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 -left-8 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Powerful Features for Database Design
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need to design, visualize, and manage your MySQL databases
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 bg-slate-50 dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-4 bg-slate-100 dark:bg-[#020617]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Everything You Need to Design Professional Databases
              </h2>
              <p className="text-lg text-slate-700 dark:text-slate-300 mb-8">
                Our visual tool provides all the features you need to create robust, well-designed MySQL database schemas.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {capabilities.map((capability, index) => (
                  <motion.div
                    key={capability}
                    initial={{ x: -10, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-slate-800 dark:text-slate-200">{capability}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-[#0F172A] rounded-xl p-4 shadow-2xl border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div className="font-mono text-sm">
                  <p className="text-emerald-400">mysql&gt; <span className="text-slate-200">CREATE TABLE users (</span></p>
                  <p className="text-slate-200 pl-4">id INT PRIMARY KEY AUTO_INCREMENT,</p>
                  <p className="text-slate-200 pl-4">name VARCHAR(255) NOT NULL,</p>
                  <p className="text-slate-200 pl-4">email VARCHAR(255) UNIQUE</p>
                  <p className="text-slate-200">);</p>
                  <p className="text-slate-500 mt-2">Query OK, 0 rows affected (0.02 sec)</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Design Your Database?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start creating beautiful, well-structured MySQL databases today.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/login')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="bg-white text-blue-600 hover:bg-slate-100"
            >
              Get Started for Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#0F172A] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">DB Visualiser</span>
          </div>
          <p className="text-sm">© 2026 DB Visualiser. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

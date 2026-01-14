'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Database, Table, GitBranch, Terminal, Sparkles, ArrowRight, Check, X } from 'lucide-react';
import Button from '@/components/common/Button';

const features = [
  {
    icon: Database,
    title: 'Create Databases',
    description: 'Design and manage multiple databases with visual tools',
    color: 'text-black',
    bg: 'bg-gray-100',
    detailedDescription: 'Create and manage multiple MySQL databases with our intuitive visual interface. Each database is stored securely in Firebase with real-time synchronization. You can create, rename, and delete databases with just a few clicks. All your databases are organized in a clean sidebar for easy navigation.',
    image: '/database-feature.svg',
  },
  {
    icon: Table,
    title: 'Visual Tables',
    description: 'Build tables with columns, types, and constraints visually',
    color: 'text-black',
    bg: 'bg-gray-100',
    detailedDescription: 'Design tables visually without writing SQL. Add columns with various data types (INT, VARCHAR, TEXT, DATE, etc.), set primary keys, define NOT NULL constraints, and specify default values. Tables are displayed as interactive nodes that you can drag and position anywhere on the canvas.',
    image: '/table-feature.svg',
  },
  {
    icon: GitBranch,
    title: 'Relationships',
    description: 'Define primary and foreign keys with visual connectors',
    color: 'text-black',
    bg: 'bg-gray-100',
    detailedDescription: 'Create relationships between tables by defining foreign keys. Visual connectors automatically appear between related tables, showing the relationship direction. The system validates your relationships to ensure referential integrity and prevents invalid configurations.',
    image: '/relationship-feature.svg',
  },
  {
    icon: Terminal,
    title: 'SQL Terminal',
    description: 'Interactive terminal with SQL syntax highlighting',
    color: 'text-black',
    bg: 'bg-gray-100',
    detailedDescription: 'Execute SQL commands directly with our built-in terminal. Features include syntax highlighting, command history, and real-time query results. Quick action buttons for common operations like CREATE, SELECT, UPDATE, and DELETE help you work faster.',
    image: '/terminal-feature.svg',
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
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-black rounded-xl flex items-center justify-center"
              >
                <Database className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-black">
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
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Visual Database Design Tool
              </span> */}
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-6"
            >
              Design Your
              
              Database Visually
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-700 max-w-3xl mx-auto mb-10"
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

          {/* Hero Illustration - Floating Tables with Relations */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 relative"
          >
            <div className="bg-gray-100 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 p-8 min-h-[400px]">
              {/* Floating Database Schema Visualization */}
              <div className="relative w-full h-[350px] flex items-center justify-center">
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-500" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Container for tables and lines - uses flexbox for proper spacing */}
                <div className="relative flex items-center justify-between w-full max-w-4xl px-4" style={{ zIndex: 2 }}>
                  
                  {/* Table 1: Users - Left */}
                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-[180px] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200"
                  >
                    <div className="bg-blue-600 px-4 py-3 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-blue-300 rounded-full" />
                      <span className="text-white font-semibold text-sm">Users</span>
                    </div>
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-400 rounded flex items-center justify-center">
                          <span className="text-[7px] text-amber-900 font-bold">PK</span>
                        </div>
                        <span className="text-xs text-gray-800 font-medium">id</span>
                        <span className="text-[10px] text-gray-500 ml-auto">INT</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded" />
                        <span className="text-xs text-gray-700">email</span>
                        <span className="text-[10px] text-gray-500 ml-auto">VARCHAR</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded" />
                        <span className="text-xs text-gray-700">name</span>
                        <span className="text-[10px] text-gray-500 ml-auto">VARCHAR</span>
                      </div>
                    </div>
                    {/* Connection point - right side */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg z-10" />
                  </motion.div>

                  {/* Relationship Line 1: Users -> Orders */}
                  <svg className="absolute left-[180px] right-[calc(50%+90px)] top-1/2 h-4 -translate-y-1/2 overflow-visible" style={{ zIndex: 1, width: 'calc(50% - 180px - 90px)' }}>
                    <motion.line
                      x1="0"
                      y1="50%"
                      x2="100%"
                      y2="50%"
                      stroke="#2563EB"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                    {/* Animated dot flowing along the line */}
                    <motion.circle
                      r="4"
                      fill="#2563EB"
                      animate={{ cx: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      cy="50%"
                    />
                  </svg>

                  {/* Table 2: Orders - Center */}
                  <motion.div
                    animate={{ 
                      y: [0, 12, 0],
                    }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="relative w-[180px] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200 mx-8"
                  >
                    {/* Connection point - left side */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg z-10" />
                    
                    <div className="bg-emerald-600 px-4 py-3 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-emerald-300 rounded-full" />
                      <span className="text-white font-semibold text-sm">Orders</span>
                    </div>
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-400 rounded flex items-center justify-center">
                          <span className="text-[7px] text-amber-900 font-bold">PK</span>
                        </div>
                        <span className="text-xs text-gray-800 font-medium">id</span>
                        <span className="text-[10px] text-gray-500 ml-auto">INT</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                          <span className="text-[7px] text-white font-bold">FK</span>
                        </div>
                        <span className="text-xs text-gray-700">user_id</span>
                        <span className="text-[10px] text-gray-500 ml-auto">INT</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded flex items-center justify-center">
                          <span className="text-[7px] text-white font-bold">FK</span>
                        </div>
                        <span className="text-xs text-gray-700">product_id</span>
                        <span className="text-[10px] text-gray-500 ml-auto">INT</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded" />
                        <span className="text-xs text-gray-700">total</span>
                        <span className="text-[10px] text-gray-500 ml-auto">DECIMAL</span>
                      </div>
                    </div>
                    {/* Connection point - right side */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg z-10" />
                  </motion.div>

                  {/* Relationship Line 2: Orders -> Products */}
                  <svg className="absolute right-[180px] left-[calc(50%+90px)] top-1/2 h-4 -translate-y-1/2 overflow-visible" style={{ zIndex: 1, width: 'calc(50% - 180px - 90px)' }}>
                    <motion.line
                      x1="0"
                      y1="50%"
                      x2="100%"
                      y2="50%"
                      stroke="#A855F7"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                    {/* Animated dot flowing along the line */}
                    <motion.circle
                      r="4"
                      fill="#A855F7"
                      animate={{ cx: ['0%', '100%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                      cy="50%"
                    />
                  </svg>

                  {/* Table 3: Products - Right */}
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    className="relative w-[180px] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200"
                  >
                    {/* Connection point - left side */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg z-10" />
                    
                    <div className="bg-purple-600 px-4 py-3 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-purple-300 rounded-full" />
                      <span className="text-white font-semibold text-sm">Products</span>
                    </div>
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-400 rounded flex items-center justify-center">
                          <span className="text-[7px] text-amber-900 font-bold">PK</span>
                        </div>
                        <span className="text-xs text-gray-800 font-medium">id</span>
                        <span className="text-[10px] text-gray-500 ml-auto">INT</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded" />
                        <span className="text-xs text-gray-700">name</span>
                        <span className="text-[10px] text-gray-500 ml-auto">VARCHAR</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded" />
                        <span className="text-xs text-gray-700">price</span>
                        <span className="text-[10px] text-gray-500 ml-auto">DECIMAL</span>
                      </div>
                    </div>
                  </motion.div>

                </div>

                {/* Floating glow effects */}
                <motion.div
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute left-[10%] top-[30%] w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"
                />
                <motion.div
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute right-[10%] top-[25%] w-28 h-28 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"
                />
                <motion.div
                  animate={{ opacity: [0.25, 0.45, 0.25] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute left-[45%] top-[40%] w-24 h-24 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
                />
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 -left-8 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Powerful Features for Database Design
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
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
                onClick={() => setSelectedFeature(feature)}
                className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-700">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-black mb-6">
                Everything You Need to Design Professional Databases
              </h2>
              <p className="text-lg text-gray-800 mb-8">
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
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-900">{capability}</span>
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
              <div className="bg-[#0F172A] rounded-xl p-4 shadow-2xl border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div className="font-mono text-sm">
                  <p className="text-gray-500">mysql&gt; <span className="text-gray-200">CREATE TABLE users (</span></p>
                  <p className="text-gray-200 pl-4">id INT PRIMARY KEY AUTO_INCREMENT,</p>
                  <p className="text-gray-200 pl-4">name VARCHAR(255) NOT NULL,</p>
                  <p className="text-gray-200 pl-4">email VARCHAR(255) UNIQUE</p>
                  <p className="text-gray-200">);</p>
                  <p className="text-gray-600 mt-2">Query OK, 0 rows affected (0.02 sec)</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Design Your Database?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Start creating beautiful, well-structured MySQL databases today.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/login')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="bg-white text-black hover:bg-gray-100"
            >
              Get Started for Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#000000] text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">DB Visualiser</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-sm">© 2026 DB Visualiser. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/terms-of-service')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <button
                onClick={() => router.push('/privacy-policy')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Feature Detail Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setSelectedFeature(null)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <selectedFeature.icon className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-black">{selectedFeature.title}</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedFeature(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Feature Illustration */}
                <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl mb-6 flex items-center justify-center border border-gray-100">
                  {selectedFeature.title === 'Create Databases' && (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Database className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="w-32 h-4 bg-blue-200 rounded" />
                        <div className="w-24 h-3 bg-blue-100 rounded" />
                        <div className="w-28 h-3 bg-blue-100 rounded" />
                      </div>
                    </div>
                  )}
                  {selectedFeature.title === 'Visual Tables' && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="bg-emerald-500 px-4 py-2 text-white text-sm font-semibold">Users Table</div>
                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-amber-400 rounded" />
                          <span className="text-xs text-gray-700">id (INT)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-200 rounded" />
                          <span className="text-xs text-gray-700">name (VARCHAR)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-200 rounded" />
                          <span className="text-xs text-gray-700">email (VARCHAR)</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedFeature.title === 'Relationships' && (
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-semibold shadow-lg">Users</div>
                      <svg width="60" height="20">
                        <line x1="0" y1="10" x2="60" y2="10" stroke="#3B82F6" strokeWidth="2" />
                        <circle cx="55" cy="10" r="4" fill="#3B82F6" />
                      </svg>
                      <div className="w-20 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-semibold shadow-lg">Orders</div>
                    </div>
                  )}
                  {selectedFeature.title === 'SQL Terminal' && (
                    <div className="bg-gray-900 rounded-lg p-4 shadow-lg w-64">
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                        <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                      </div>
                      <div className="font-mono text-xs">
                        <p className="text-gray-500">mysql&gt; <span className="text-green-400">SELECT * FROM users;</span></p>
                        <p className="text-gray-400 mt-1">3 rows returned</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-gray-700 leading-relaxed">
                  {selectedFeature.detailedDescription}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

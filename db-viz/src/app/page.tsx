'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Database, Table, GitBranch, Terminal, Sparkles, ArrowRight, Check } from 'lucide-react';
import Button from '@/components/common/Button';

const features = [
  {
    icon: Database,
    title: 'Create Databases',
    description: 'Design and manage multiple databases with visual tools',
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Table,
    title: 'Visual Tables',
    description: 'Build tables with columns, types, and constraints visually',
    color: 'text-green-600',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    icon: GitBranch,
    title: 'Relationships',
    description: 'Define primary and foreign keys with visual connectors',
    color: 'text-purple-600',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    icon: Terminal,
    title: 'SQL Terminal',
    description: 'Interactive terminal with SQL syntax highlighting',
    color: 'text-orange-600',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <Database className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
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
      <section className="pt-32 pb-20 px-4">
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
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Design Your{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                MySQL Database
              </span>{' '}
              Visually
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10"
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

          {/* Hero Illustration */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 relative"
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 p-8">
              {/* Mock Dashboard Preview */}
              <div className="flex gap-4">
                {/* Mock Sidebar */}
                <div className="w-48 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded" />
                        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock Canvas */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm relative">
                  {/* Mock Tables */}
                  <div className="flex gap-8 items-start">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-40 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md"
                    >
                      <div className="bg-blue-500 px-3 py-2">
                        <div className="h-3 w-16 bg-white/80 rounded" />
                      </div>
                      <div className="p-3 space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                            <div className="h-2 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Connection Line */}
                    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" width="100" height="2">
                      <motion.line
                        x1="0"
                        y1="1"
                        x2="100"
                        y2="1"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </svg>

                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      className="w-40 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md"
                    >
                      <div className="bg-purple-500 px-3 py-2">
                        <div className="h-3 w-16 bg-white/80 rounded" />
                      </div>
                      <div className="p-3 space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-2">
                            {i === 1 && <div className="w-2 h-2 bg-purple-400 rounded-full" />}
                            {i !== 1 && <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />}
                            <div className="h-2 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Database Design
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
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
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Everything You Need to Design Professional Databases
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
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
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{capability}</span>
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
              <div className="bg-gray-900 rounded-xl p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div className="font-mono text-sm">
                  <p className="text-green-400">mysql&gt; <span className="text-white">CREATE TABLE users (</span></p>
                  <p className="text-white pl-4">id INT PRIMARY KEY AUTO_INCREMENT,</p>
                  <p className="text-white pl-4">name VARCHAR(255) NOT NULL,</p>
                  <p className="text-white pl-4">email VARCHAR(255) UNIQUE</p>
                  <p className="text-white">);</p>
                  <p className="text-gray-500 mt-2">Query OK, 0 rows affected (0.02 sec)</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
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
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Get Started for Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
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

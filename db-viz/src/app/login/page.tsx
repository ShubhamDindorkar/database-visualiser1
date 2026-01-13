'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Database, Shield, Zap, Users } from 'lucide-react';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { useAuth } from '@/hooks/useAuth';

const benefits = [
  {
    icon: Database,
    title: 'Visual Design',
    description: 'Create database schemas with drag-and-drop ease',
  },
  {
    icon: Shield,
    title: 'Secure Storage',
    description: 'Your data is safely stored in the cloud',
  },
  {
    icon: Zap,
    title: 'Real-time Sync',
    description: 'Changes sync instantly across devices',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Share and collaborate on database designs',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#020617]">
      {/* Left Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] p-12 flex-col justify-between">
        <div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-blue-500/30">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white">DB Visualiser</span>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Design databases the visual way
            </h1>
            <p className="text-xl text-slate-300">
              Create, manage, and visualize your MySQL databases with our intuitive interface.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700"
              >
                <benefit.icon className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                <p className="text-slate-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-slate-500 text-sm"
        >
          Trusted by developers worldwide
        </motion.p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              DB Visualiser
            </span>
          </div>

          <div className="bg-white dark:bg-[#1E293B]/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Sign in to continue to your dashboard
              </p>
            </div>

            <GoogleLoginButton onClick={handleGoogleSignIn} isLoading={loading} />

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                By signing in, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all duration-200 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Home
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
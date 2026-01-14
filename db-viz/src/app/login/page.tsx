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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-black border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Benefits with BLACK background */}
      <div className="hidden lg:flex lg:w-1/2 bg-black p-12 flex-col justify-between">
        <div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Database className="w-6 h-6 text-white" />
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
            <p className="text-xl text-gray-400">
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
                className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <benefit.icon className="w-8 h-8 text-white mb-3" />
                <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                <p className="text-gray-500 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-white text-sm">
          Trusted by developers worldwide
        </motion.p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-black">
              DB Visualiser
            </span>
          </div>

          <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-black mb-2">
                Welcome back
              </h2>
              <p className="text-gray-700">
                Sign in to continue to your dashboard
              </p>
            </div>

            <GoogleLoginButton onClick={handleGoogleSignIn} isLoading={loading} />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                By signing in, you agree to our{' '}
                <button
                  onClick={() => router.push('/terms-of-service')}
                  className="text-black hover:text-gray-800 underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  onClick={() => router.push('/privacy-policy')}
                  className="text-black hover:text-gray-800 underline"
                >
                  Privacy Policy
                </button>
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 transition-all duration-200 font-medium"
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
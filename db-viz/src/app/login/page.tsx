'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Database } from 'lucide-react';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import GitHubLoginButton from '@/components/auth/GitHubLoginButton';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn, signInGithub } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      setIsGoogleLoading(true);
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setAuthError(null);
      setIsGithubLoading(true);
      await signInGithub();
    } catch (error) {
      console.error('GitHub sign in error:', error);
      setAuthError('Failed to sign in with GitHub. Please try again.');
    } finally {
      setIsGithubLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-gray-200/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gray-200/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-gray-100/20 via-white/10 to-gray-100/20 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md px-4 relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-black">
            DB Visualiser
          </span>
        </div>

        {/* Glass Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-white/50">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-black mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500 text-sm">
              Sign in to continue to your dashboard
            </p>
          </div>

          <div className="space-y-3">
            <GoogleLoginButton onClick={handleGoogleSignIn} isLoading={isGoogleLoading} />
            <GitHubLoginButton onClick={handleGithubSignIn} isLoading={isGithubLoading} />
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl"
            >
              <p className="text-sm text-red-600 text-center">{authError}</p>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200/50">
            <p className="text-xs text-gray-400 text-center">
              By signing in, you agree to our{' '}
              <button
                onClick={() => router.push('/terms-of-service')}
                className="text-gray-600 hover:text-black transition-colors"
              >
                Terms
              </button>{' '}
              and{' '}
              <button
                onClick={() => router.push('/privacy-policy')}
                className="text-gray-600 hover:text-black transition-colors"
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
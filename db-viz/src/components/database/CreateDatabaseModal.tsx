'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

interface CreateDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, password: string) => void;
  existingNames: string[];
  theme?: any;
}

export default function CreateDatabaseModal({
  isOpen,
  onClose,
  onCreate,
  existingNames,
  theme,
}: CreateDatabaseModalProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateName = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Database name is required';
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
      return 'Name must start with letter or underscore, and contain only letters, numbers, and underscores';
    }
    if (value.length > 64) {
      return 'Name must be 64 characters or less';
    }
    if (existingNames.some((n) => n.toLowerCase() === value.toLowerCase())) {
      return 'A database with this name already exists';
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    const passwordError = validatePassword(password);
    const confirmError = password !== confirmPassword ? 'Passwords do not match' : undefined;

    if (nameError || passwordError || confirmError) {
      setErrors({ name: nameError, password: passwordError, confirmPassword: confirmError });
      return;
    }

    setIsLoading(true);
    try {
      await onCreate(name, password);
      handleClose();
    } catch (error) {
      console.error('Error creating database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`${theme?.modal || 'bg-white'} rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b ${theme?.navbar?.includes('slate') ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 ${theme?.button || 'bg-blue-600'} rounded-xl flex items-center justify-center`}>
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${theme?.text || 'text-gray-900'}`}>
                      Create Database
                    </h2>
                    <p className={`text-sm ${theme?.textSecondary || 'text-gray-500'}`}>
                      Create a new MySQL database
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className={`p-2 rounded-lg ${theme?.buttonSecondary || 'hover:bg-gray-100'} transition-all`}
                >
                  <X className={`w-5 h-5 ${theme?.textSecondary || 'text-gray-500'}`} />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <Input
                  label="Database Name"
                  placeholder="my_database"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  error={errors.name}
                  leftIcon={<Database className="w-4 h-4" />}
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    error={errors.password}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  error={errors.confirmPassword}
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                {/* Info Box */}
                <div className={`flex items-start gap-3 p-4 ${theme?.buttonSecondary || 'bg-blue-50 border-blue-200'} border rounded-xl`}>
                  <AlertCircle className={`w-5 h-5 ${theme?.button?.includes('blue') ? 'text-blue-600' : theme?.text || 'text-blue-600'} mt-0.5 flex-shrink-0`} />
                  <p className={`text-sm ${theme?.text || 'text-gray-700'}`}>
                    The password will be securely hashed and stored. Make sure to remember it for future access.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    isLoading={isLoading}
                  >
                    Create Database
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

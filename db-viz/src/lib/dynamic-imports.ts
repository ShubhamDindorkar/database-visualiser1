/**
 * Dynamic import utilities for code splitting and performance optimization
 * These functions lazy-load components to reduce initial bundle size
 */

import dynamic from 'next/dynamic';

// Modal Components - Lazy load for better initial page load
export const DynamicCreateDatabaseModal = dynamic(
  () => import('@/components/database/CreateDatabaseModal'),
  {
    loading: () => null, // Don't show loading for modals
  }
);

export const DynamicCreateTableModal = dynamic(
  () => import('@/components/database/CreateTableModal'),
  {
    loading: () => null,
  }
);

export const DynamicEditTableModal = dynamic(
  () => import('@/components/database/EditTableModal'),
  {
    loading: () => null,
  }
);

export const DynamicInsertDataModal = dynamic(
  () => import('@/components/database/InsertDataModal'),
  {
    loading: () => null,
  }
);

export const DynamicUpdateDataModal = dynamic(
  () => import('@/components/database/UpdateDataModal'),
  {
    loading: () => null,
  }
);

export const DynamicDeleteDataModal = dynamic(
  () => import('@/components/database/DeleteDataModal'),
  {
    loading: () => null,
  }
);

export const DynamicSelectDataModal = dynamic(
  () => import('@/components/database/SelectDataModal'),
  {
    loading: () => null,
  }
);

export const DynamicDropModal = dynamic(
  () => import('@/components/database/DropModal'),
  {
    loading: () => null,
  }
);

export const DynamicCreateChoiceModal = dynamic(
  () => import('@/components/database/CreateChoiceModal'),
  {
    loading: () => null,
  }
);

export const DynamicForeignKeyModal = dynamic(
  () => import('@/components/database/ForeignKeyModal'),
  {
    loading: () => null,
  }
);

export const DynamicExportModal = dynamic(
  () => import('@/components/database/ExportModal'),
  {
    loading: () => null,
  }
);

export const DynamicQueryResultsPanel = dynamic(
  () => import('@/components/database/QueryResultsPanel'),
  {
    loading: () => null,
  }
);

export const DynamicSQLChatbot = dynamic(
  () => import('@/components/chatbot/SQLChatbot'),
  {
    loading: () => null,
  }
);

// Ensure ssr is enabled for components that need it
Object.defineProperty(DynamicCreateDatabaseModal, 'ssr', { value: true });
Object.defineProperty(DynamicCreateTableModal, 'ssr', { value: true });
Object.defineProperty(DynamicEditTableModal, 'ssr', { value: true });
Object.defineProperty(DynamicInsertDataModal, 'ssr', { value: true });
Object.defineProperty(DynamicUpdateDataModal, 'ssr', { value: true });
Object.defineProperty(DynamicDeleteDataModal, 'ssr', { value: true });
Object.defineProperty(DynamicSelectDataModal, 'ssr', { value: true });
Object.defineProperty(DynamicDropModal, 'ssr', { value: true });
Object.defineProperty(DynamicCreateChoiceModal, 'ssr', { value: true });
Object.defineProperty(DynamicForeignKeyModal, 'ssr', { value: true });
Object.defineProperty(DynamicExportModal, 'ssr', { value: true });
Object.defineProperty(DynamicQueryResultsPanel, 'ssr', { value: true });
Object.defineProperty(DynamicSQLChatbot, 'ssr', { value: true });

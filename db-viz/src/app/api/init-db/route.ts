import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';

/**
 * POST /api/init-db
 * 
 * Initialize database schema and system tables
 * Only call this ONCE on first Railway deployment
 * 
 * Security: Use the INIT_TOKEN environment variable to prevent unauthorized initialization
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the initialization token for security
    const token = request.headers.get('x-init-token');
    const expectedToken = process.env.INIT_TOKEN;

    if (!token || token !== expectedToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing initialization token' },
        { status: 401 }
      );
    }

    let connection: any = null;

    try {
      connection = await getConnection();

      // Create system database for metadata tracking
      await connection.execute(
        'CREATE DATABASE IF NOT EXISTS db_viz_system'
      );

      // Switch to system database
      await connection.changeUser({ database: 'db_viz_system' });

      // Create user metadata table to track user initialization
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS user_metadata (
          user_id VARCHAR(255) PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          database_count INT DEFAULT 0,
          last_login TIMESTAMP NULL,
          INDEX idx_created (created_at),
          INDEX idx_login (last_login)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Create database tracking table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS user_databases (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          database_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user (user_id),
          INDEX idx_created (created_at),
          UNIQUE KEY unique_user_db (user_id, database_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Create query history table for tracking user queries
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS query_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          database_name VARCHAR(255) NOT NULL,
          query_text LONGTEXT NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          execution_time_ms INT,
          status ENUM('success', 'error') DEFAULT 'success',
          error_message TEXT,
          INDEX idx_user (user_id),
          INDEX idx_database (database_name),
          INDEX idx_executed (executed_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      return NextResponse.json({
        success: true,
        message: 'Database initialized successfully',
        tables: [
          'db_viz_system.user_metadata',
          'db_viz_system.user_databases',
          'db_viz_system.query_history',
        ],
      });
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize database',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/init-db
 * Check if database is initialized
 */
export async function GET(request: NextRequest) {
  try {
    let connection: any = null;

    try {
      connection = await getConnection();

      // Try to query the system database
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'db_viz_system'
      `) as any;

      const isInitialized = Array.isArray(tables) && tables.length > 0;

      return NextResponse.json({
        success: true,
        initialized: isInitialized,
        tables: isInitialized ? (tables as any[]).map((t: any) => t.TABLE_NAME) : [],
      });
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  } catch (error) {
    console.error('Database check error:', error);

    return NextResponse.json({
      success: true,
      initialized: false,
      tables: [],
      message: 'Database not yet initialized',
    });
  }
}

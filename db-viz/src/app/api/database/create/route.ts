import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getPrefixedDatabaseName } from '@/lib/mysql';
import { setNoCacheHeaders } from '@/lib/cache-headers';

interface CreateDatabaseRequest {
  name: string;
  userId: string;
}

/**
 * POST /api/database/create
 * 
 * Create a new MySQL database with user isolation.
 * Database names are prefixed with userId to ensure user isolation.
 * 
 * Request body:
 * {
 *   "name": "database_name",
 *   "userId": "user_firebase_uid"
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "message": string,
 *   "database": string,
 *   "actualDatabaseName": string,
 *   "error"?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateDatabaseRequest = await request.json();
    const { name, userId } = body;

    // Validate database name and userId
    if (!name || typeof name !== 'string') {
      const response = NextResponse.json({
        success: false,
        error: 'Database name is required',
      }, { status: 400 });
      return setNoCacheHeaders(response);
    }

    if (!userId || typeof userId !== 'string') {
      const response = NextResponse.json({
        success: false,
        error: 'User ID is required',
      }, { status: 400 });
      return setNoCacheHeaders(response);
    }

    const trimmedName = name.trim();
    
    // Create prefixed database name for user isolation
    // Format: user_{userId}_{databaseName}
    const prefixedName = getPrefixedDatabaseName(trimmedName, userId);

    // Validate database name format (MySQL naming rules)
    // Must start with letter or underscore, contain only alphanumeric and underscores
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedName)) {
      const response = NextResponse.json({
        success: false,
        error: 'Invalid database name. Name must start with a letter or underscore and contain only letters, numbers, and underscores.',
      }, { status: 400 });
      return setNoCacheHeaders(response);
    }

    // Check length (MySQL limit is 64 characters, accounting for prefix)
    if (prefixedName.length > 64) {
      const response = NextResponse.json({
        success: false,
        error: 'Database name is too long',
      }, { status: 400 });
      return setNoCacheHeaders(response);
    }

    // Execute CREATE DATABASE query with prefixed name
    // Using backticks to safely escape the database name
    const query = `CREATE DATABASE \`${prefixedName}\``;
    const result = await executeQuery(query);

    if (result.success) {
      const response = NextResponse.json({
        success: true,
        message: `Database '${trimmedName}' created successfully`,
        database: trimmedName, // Return user-friendly name
        actualDatabaseName: prefixedName, // Return actual MySQL name
      });
      return setNoCacheHeaders(response);
    } else {
      // Handle specific MySQL errors
      let errorMessage = result.error || 'Failed to create database';
      
      if (result.errno === 1007) {
        errorMessage = `Database '${trimmedName}' already exists`;
      }

      const response = NextResponse.json({
        success: false,
        error: errorMessage,
        code: result.code,
        errno: result.errno,
      }, { status: 400 });
      return setNoCacheHeaders(response);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const response = NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
    return setNoCacheHeaders(response);
  }
}

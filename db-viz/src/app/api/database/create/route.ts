import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

interface CreateDatabaseRequest {
  name: string;
}

/**
 * POST /api/database/create
 * 
 * Create a new MySQL database.
 * Called when user creates a database from the UI.
 * 
 * Request body:
 * {
 *   "name": "database_name"
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "message": string,
 *   "database": string,
 *   "error"?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateDatabaseRequest = await request.json();
    const { name } = body;

    // Validate database name
    if (!name || typeof name !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Database name is required',
      }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Validate database name format (MySQL naming rules)
    // Must start with letter or underscore, contain only alphanumeric and underscores
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedName)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid database name. Name must start with a letter or underscore and contain only letters, numbers, and underscores.',
      }, { status: 400 });
    }

    // Check length (MySQL limit is 64 characters)
    if (trimmedName.length > 64) {
      return NextResponse.json({
        success: false,
        error: 'Database name must be 64 characters or less',
      }, { status: 400 });
    }

    // Execute CREATE DATABASE query
    // Using backticks to safely escape the database name
    const query = `CREATE DATABASE \`${trimmedName}\``;
    const result = await executeQuery(query);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Database '${trimmedName}' created successfully`,
        database: trimmedName,
      });
    } else {
      // Handle specific MySQL errors
      let errorMessage = result.error || 'Failed to create database';
      
      if (result.errno === 1007) {
        errorMessage = `Database '${trimmedName}' already exists`;
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        code: result.code,
        errno: result.errno,
      }, { status: 400 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}

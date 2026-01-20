import { NextRequest, NextResponse } from 'next/server';
import {
  executeQuery,
  executeQueryInDatabase,
  formatResultsForTerminal,
  formatErrorForTerminal,
  isDatabaseOwnedByUser,
} from '@/lib/mysql';

interface ExecuteQueryRequest {
  database?: string;
  query: string;
  userId?: string;
}

/**
 * POST /api/query/execute
 * 
 * Execute SQL queries from the frontend terminal.
 * Supports all SQL operations: CREATE, SELECT, INSERT, UPDATE, DELETE, etc.
 * 
 * Request body:
 * {
 *   "database": "optional_database_name",
 *   "query": "SQL QUERY STRING"
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "results": any,
 *   "formattedOutput": string[],
 *   "error"?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExecuteQueryRequest = await request.json();
    const { database, query, userId } = body;

    // Validate request
    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Query is required',
        formattedOutput: ['ERROR: Query is required'],
      }, { status: 400 });
    }

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return NextResponse.json({
        success: false,
        error: 'Query cannot be empty',
        formattedOutput: ['ERROR: Query cannot be empty'],
      }, { status: 400 });
    }

    // Validate database ownership if userId and database are provided
    if (userId && database && !isDatabaseOwnedByUser(database, userId)) {
      return NextResponse.json({
        success: false,
        error: 'Access denied. You can only access your own databases.',
        formattedOutput: ['ERROR 1044 (42000): Access denied. You can only access your own databases.'],
      }, { status: 403 });
    }

    // Determine if we need a database context
    const upperQuery = trimmedQuery.toUpperCase();
    const needsDatabase = !(
      upperQuery.startsWith('CREATE DATABASE') ||
      upperQuery.startsWith('DROP DATABASE') ||
      upperQuery.startsWith('SHOW DATABASES') ||
      upperQuery.startsWith('USE ')
    );

    let result;
    
    if (needsDatabase && database) {
      // Execute query within the specified database
      result = await executeQueryInDatabase(database, trimmedQuery);
    } else if (needsDatabase && !database) {
      // Query needs a database but none specified
      return NextResponse.json({
        success: false,
        error: 'No database selected',
        formattedOutput: ['ERROR 1046 (3D000): No database selected'],
      }, { status: 400 });
    } else {
      // Execute query without database context (CREATE DATABASE, SHOW DATABASES, etc.)
      result = await executeQuery(trimmedQuery);
    }

    if (result.success) {
      const formattedOutput = formatResultsForTerminal(result.results, trimmedQuery);
      
      return NextResponse.json({
        success: true,
        results: result.results,
        formattedOutput,
      });
    } else {
      const formattedError = formatErrorForTerminal(
        result.error || 'Unknown error',
        result.code,
        result.errno
      );
      
      return NextResponse.json({
        success: false,
        error: result.error,
        code: result.code,
        errno: result.errno,
        sqlState: result.sqlState,
        formattedOutput: [formattedError],
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      formattedOutput: [`ERROR: ${errorMessage}`],
    }, { status: 500 });
  }
}

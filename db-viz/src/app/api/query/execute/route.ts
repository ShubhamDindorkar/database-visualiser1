import { NextRequest, NextResponse } from 'next/server';
import {
  executeQuery,
  executeQueryInDatabase,
  formatResultsForTerminal,
  formatErrorForTerminal,
  isDatabaseOwnedByUser,
} from '@/lib/postgresql';
import { setNoCacheHeaders } from '@/lib/cache-headers';

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
 *   "database": "optional_schema_name",
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
    let { database, query, userId } = body;

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

    // Validate schema ownership if userId and database are provided
    if (userId && database && !isDatabaseOwnedByUser(database, userId)) {
      return NextResponse.json({
        success: false,
        error: 'Access denied. You can only access your own schemas.',
        formattedOutput: ['ERROR: Access denied. You can only access your own schemas.'],
      }, { status: 403 });
    }

    // Handle special commands for PostgreSQL compatibility
    let processedQuery = trimmedQuery;
    let isSpecialCommand = false;
    
    // Convert SHOW DATABASES to information_schema query for PostgreSQL
    if (trimmedQuery.toUpperCase() === 'SHOW DATABASES') {
      processedQuery = `
        SELECT schema_name as "Database"
        FROM information_schema.schemata 
        WHERE schema_name NOT LIKE 'pg_%' 
        AND schema_name != 'information_schema'
        ORDER BY schema_name
      `;
      isSpecialCommand = true;
    }
    
    // Convert SHOW TABLES to PostgreSQL information_schema query
    if (trimmedQuery.toUpperCase() === 'SHOW TABLES' || trimmedQuery.toUpperCase().startsWith('SHOW TABLES')) {
      if (database) {
        processedQuery = `
          SELECT table_name as "Tables_in_${database}"
          FROM information_schema.tables
          WHERE table_schema = '${database}'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `;
      }
      isSpecialCommand = false; // SHOW TABLES needs schema context
    }

    // Determine if we need a schema context
    const upperQuery = processedQuery.toUpperCase();
    const needsSchema = !(
      upperQuery.includes('CREATE SCHEMA') ||
      upperQuery.includes('DROP SCHEMA') ||
      upperQuery.includes('INFORMATION_SCHEMA') ||
      isSpecialCommand
    );

    let result;
    
    if (needsSchema && database) {
      // Execute query within the specified schema
      result = await executeQueryInDatabase(database, processedQuery);
    } else if (needsSchema && !database) {
      // Query needs a schema but none specified
      return NextResponse.json({
        success: false,
        error: 'No schema selected',
        formattedOutput: ['ERROR: No schema selected'],
      }, { status: 400 });
    } else {
      // Execute query without schema context
      result = await executeQuery(processedQuery);
    }

    if (result.success) {
      const formattedOutput = formatResultsForTerminal(result.results, trimmedQuery);
      
      const response = NextResponse.json({
        success: true,
        results: result.results,
        formattedOutput,
      });
      return setNoCacheHeaders(response);
    } else {
      const formattedError = formatErrorForTerminal(
        result.error || 'Unknown error',
        result.code
      );
      
      const response = NextResponse.json({
        success: false,
        error: result.error,
        code: result.code,
        sqlState: result.sqlState,
        formattedOutput: [formattedError],
      });
      return setNoCacheHeaders(response);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const response = NextResponse.json({
      success: false,
      error: errorMessage,
      formattedOutput: [`ERROR: ${errorMessage}`],
    }, { status: 500 });
    return setNoCacheHeaders(response);
  }
}

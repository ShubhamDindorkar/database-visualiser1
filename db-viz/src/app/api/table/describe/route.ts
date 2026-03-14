import { NextRequest, NextResponse } from 'next/server';
import { executeQueryInDatabase, isDatabaseOwnedByUser } from '@/lib/mysql';
import { setNoCacheHeaders } from '@/lib/cache-headers';

interface DescribeTableRequest {
  database: string;
  table: string;
  userId?: string;
}

/**
 * POST /api/table/describe
 * 
 * Get the structure of a table from MySQL.
 * Returns column information including name, type, nullable, key, default, and extra.
 * 
 * Request body:
 * {
 *   "database": "database_name",
 *   "table": "table_name"
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "columns": [...],
 *   "error"?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: DescribeTableRequest = await request.json();
    const { database, table, userId } = body;

    // Validate request
    if (!database || typeof database !== 'string') {
      const response = NextResponse.json({
        success: false,
        error: 'Database name is required',
      }, { status: 400 });
      return setNoCacheHeaders(response);
    }

    if (!table || typeof table !== 'string') {
      const response = NextResponse.json({
        success: false,
        error: 'Table name is required',
      }, { status: 400 });
      return setNoCacheHeaders(response);
    }

    // Validate database ownership if userId is provided
    if (userId && !isDatabaseOwnedByUser(database, userId)) {
      const response = NextResponse.json({
        success: false,
        error: 'Access denied. You can only access your own databases.',
      }, { status: 403 });
      return setNoCacheHeaders(response);
    }

    const result = await executeQueryInDatabase(database, `DESCRIBE \`${table}\``);

    if (result.success) {
      const response = NextResponse.json({
        success: true,
        columns: result.results,
      });
      return setNoCacheHeaders(response);
    } else {
      const response = NextResponse.json({
        success: false,
        error: result.error,
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

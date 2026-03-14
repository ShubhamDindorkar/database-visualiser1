import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getUserDatabasePrefix, getDisplayDatabaseName } from '@/lib/mysql';
import { setNoCacheHeaders } from '@/lib/cache-headers';

/**
 * GET /api/database/list
 * 
 * List MySQL databases for a specific user.
 * Filters databases by user prefix for isolation.
 * 
 * Query params:
 *   userId: User's Firebase UID
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "databases": Array<{name: string, actualName: string}>,
 *   "error"?: string
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      const response = NextResponse.json({
        success: false,
        error: 'User ID is required',
      }, { status: 400 });
      return setNoCacheHeaders(response);
    }

    const result = await executeQuery('SHOW DATABASES');

    if (result.success) {
      // Extract database names from result
      const allDatabases = (result.results as { Database: string }[]).map(
        (row) => row.Database
      );

      // Filter databases by user prefix
      const userPrefix = getUserDatabasePrefix(userId);
      const userDatabases = allDatabases
        .filter((db) => db.startsWith(userPrefix))
        .map((db) => ({
          name: getDisplayDatabaseName(db, userId), // Remove prefix for display
          actualName: db, // Keep actual name for MySQL operations
        }));

      const response = NextResponse.json({
        success: true,
        databases: userDatabases,
      });
      return setNoCacheHeaders(response);
    } else {
      const response = NextResponse.json({
        success: false,
        error: result.error,
        code: result.code,
      }, { status: 500 });
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

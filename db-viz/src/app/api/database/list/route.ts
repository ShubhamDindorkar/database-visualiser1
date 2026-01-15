import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

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
      return NextResponse.json({
        success: false,
        error: 'User ID is required',
      }, { status: 400 });
    }

    const result = await executeQuery('SHOW DATABASES');

    if (result.success) {
      // Extract database names from result
      const allDatabases = (result.results as { Database: string }[]).map(
        (row) => row.Database
      );

      // Filter databases by user prefix
      const userPrefix = `user_${userId.substring(0, 8)}_`;
      const userDatabases = allDatabases
        .filter((db) => db.startsWith(userPrefix))
        .map((db) => ({
          name: db.replace(userPrefix, ''), // Remove prefix for display
          actualName: db, // Keep actual name for MySQL operations
        }));

      return NextResponse.json({
        success: true,
        databases: userDatabases,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        code: result.code,
      }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}

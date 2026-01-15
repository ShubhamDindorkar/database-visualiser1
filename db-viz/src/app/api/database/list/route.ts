import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

/**
 * GET /api/database/list
 * 
 * List all MySQL databases.
 * Returns an array of database names.
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "databases": string[],
 *   "error"?: string
 * }
 */
export async function GET() {
  try {
    const result = await executeQuery('SHOW DATABASES');

    if (result.success) {
      // Extract database names from result
      const databases = (result.results as { Database: string }[]).map(
        (row) => row.Database
      );

      return NextResponse.json({
        success: true,
        databases,
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

import { NextRequest, NextResponse } from 'next/server';
import { executeQueryInDatabase } from '@/lib/mysql';

interface DescribeTableRequest {
  database: string;
  table: string;
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
    const { database, table } = body;

    // Validate request
    if (!database || typeof database !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Database name is required',
      }, { status: 400 });
    }

    if (!table || typeof table !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Table name is required',
      }, { status: 400 });
    }

    const result = await executeQueryInDatabase(database, `DESCRIBE \`${table}\``);

    if (result.success) {
      return NextResponse.json({
        success: true,
        columns: result.results,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
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

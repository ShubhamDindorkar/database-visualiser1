import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

/**
 * GET /api/test-mysql
 * 
 * Test endpoint to verify MySQL connectivity.
 * Executes SHOW DATABASES to confirm the connection is working.
 * This endpoint is for development testing only.
 */
export async function GET() {
  try {
    const result = await executeQuery('SHOW DATABASES');
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'MySQL connection successful',
        databases: result.results,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'MySQL connection failed',
        error: result.error,
        code: result.code,
      }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to MySQL',
      error: errorMessage,
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

interface DropDatabaseRequest {
  name: string;
  userId: string;
}

/**
 * POST /api/database/drop
 * 
 * Drop (delete) a MySQL database.
 * Called when user deletes a database from the UI.
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
 *   "error"?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: DropDatabaseRequest = await request.json();
    const { name, userId } = body;

    // Validate database name and userId
    if (!name || typeof name !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Database name is required',
      }, { status: 400 });
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'User ID is required',
      }, { status: 400 });
    }

    const trimmedName = name.trim();
    
    // Create prefixed database name for user isolation
    const prefixedName = `user_${userId.substring(0, 8)}_${trimmedName}`;

    // Execute DROP DATABASE query with prefixed name
    // Using backticks to safely escape the database name
    const query = `DROP DATABASE \`${prefixedName}\``;
    const result = await executeQuery(query);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Database '${trimmedName}' dropped successfully`,
      });
    } else {
      // Handle specific MySQL errors
      let errorMessage = result.error || 'Failed to drop database';
      
      if (result.errno === 1008) {
        errorMessage = `Database '${trimmedName}' does not exist`;
      } else if (result.errno === 1044) {
        errorMessage = 'Access denied. You can only drop your own databases.';
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

import { NextRequest, NextResponse } from 'next/server';
import { executeQueryInDatabase } from '@/lib/mysql';

interface Column {
  name: string;
  dataType: string;
  isPrimaryKey?: boolean;
  isNotNull?: boolean;
  isUnique?: boolean;
  isAutoIncrement?: boolean;
  defaultValue?: string;
  isForeignKey?: boolean;
  foreignKeyReference?: {
    tableName: string;
    columnName: string;
  };
}

interface CreateTableRequest {
  database: string;
  tableName: string;
  columns: Column[];
}

/**
 * POST /api/table/create
 * 
 * Create a new table in a MySQL database.
 * Called when user creates a table from the UI.
 * 
 * Request body:
 * {
 *   "database": "database_name",
 *   "tableName": "table_name",
 *   "columns": [
 *     {
 *       "name": "column_name",
 *       "dataType": "INT",
 *       "isPrimaryKey": true,
 *       "isNotNull": true,
 *       ...
 *     }
 *   ]
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
    const body: CreateTableRequest = await request.json();
    const { database, tableName, columns } = body;

    // Validate request
    if (!database || typeof database !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Database name is required',
      }, { status: 400 });
    }

    if (!tableName || typeof tableName !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Table name is required',
      }, { status: 400 });
    }

    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one column is required',
      }, { status: 400 });
    }

    // Build CREATE TABLE query
    const columnDefinitions: string[] = [];
    const foreignKeys: string[] = [];
    const primaryKeys: string[] = [];

    for (const column of columns) {
      let definition = `\`${column.name}\` ${column.dataType}`;

      // Add length for VARCHAR
      if (column.dataType.toUpperCase() === 'VARCHAR') {
        definition += '(255)';
      }

      // Add constraints
      if (column.isNotNull) {
        definition += ' NOT NULL';
      }

      // Add AUTO_INCREMENT for auto increment columns
      if (column.isAutoIncrement) {
        definition += ' AUTO_INCREMENT';
      }

      if (column.isUnique && !column.isPrimaryKey) {
        definition += ' UNIQUE';
      }

      if (column.defaultValue !== undefined && column.defaultValue !== '') {
        // Handle special default values
        if (column.defaultValue.toUpperCase() === 'NULL') {
          definition += ' DEFAULT NULL';
        } else if (column.defaultValue.toUpperCase() === 'CURRENT_TIMESTAMP') {
          definition += ' DEFAULT CURRENT_TIMESTAMP';
        } else if (
          column.dataType.toUpperCase().includes('INT') ||
          column.dataType.toUpperCase().includes('FLOAT') ||
          column.dataType.toUpperCase().includes('DOUBLE') ||
          column.dataType.toUpperCase().includes('DECIMAL')
        ) {
          definition += ` DEFAULT ${column.defaultValue}`;
        } else {
          definition += ` DEFAULT '${column.defaultValue}'`;
        }
      }

      columnDefinitions.push(definition);

      // Track primary keys
      if (column.isPrimaryKey) {
        primaryKeys.push(`\`${column.name}\``);
      }

      // Track foreign keys
      if (column.isForeignKey && column.foreignKeyReference) {
        foreignKeys.push(
          `FOREIGN KEY (\`${column.name}\`) REFERENCES \`${column.foreignKeyReference.tableName}\`(\`${column.foreignKeyReference.columnName}\`)`
        );
      }
    }

    // Add primary key constraint
    if (primaryKeys.length > 0) {
      columnDefinitions.push(`PRIMARY KEY (${primaryKeys.join(', ')})`);
    }

    // Add foreign key constraints
    foreignKeys.forEach((fk) => {
      columnDefinitions.push(fk);
    });

    const query = `CREATE TABLE \`${tableName.trim()}\` (\n  ${columnDefinitions.join(',\n  ')}\n)`;

    const result = await executeQueryInDatabase(database.trim(), query);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Table '${tableName}' created successfully in database '${database}'`,
        table: tableName,
      });
    } else {
      // Handle specific MySQL errors
      let errorMessage = result.error || 'Failed to create table';

      if (result.errno === 1050) {
        errorMessage = `Table '${tableName}' already exists`;
      } else if (result.errno === 1049) {
        errorMessage = `Database '${database}' does not exist`;
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

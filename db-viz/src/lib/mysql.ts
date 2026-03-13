import mysql from 'mysql2/promise';

// MySQL connection configuration
// Supports both local dev (MYSQL_*) and Railway (MYSQL*) environment variables
// Railway auto-provides: MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD
const connectionConfig = {
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost',
  port: parseInt(
    process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306'
  ),
  user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
};

// Connection pool for better performance
let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: connectionConfig.host,
      port: connectionConfig.port,
      user: connectionConfig.user,
      password: connectionConfig.password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

/**
 * Generate the user-specific database prefix
 * Format: user_{first8charsOfUserId}_
 */
export function getUserDatabasePrefix(userId: string): string {
  return `user_${userId.substring(0, 8)}_`;
}

/**
 * Check if a database name belongs to a specific user
 */
export function isDatabaseOwnedByUser(databaseName: string, userId: string): boolean {
  const prefix = getUserDatabasePrefix(userId);
  return databaseName.startsWith(prefix);
}

/**
 * Get the actual MySQL database name with user prefix
 */
export function getPrefixedDatabaseName(databaseName: string, userId: string): string {
  const prefix = getUserDatabasePrefix(userId);
  // If already prefixed, return as is
  if (databaseName.startsWith(prefix)) {
    return databaseName;
  }
  return `${prefix}${databaseName}`;
}

/**
 * Remove user prefix from database name for display
 */
export function getDisplayDatabaseName(mysqlName: string, userId: string): string {
  const prefix = getUserDatabasePrefix(userId);
  if (mysqlName.startsWith(prefix)) {
    return mysqlName.replace(prefix, '');
  }
  return mysqlName;
}

/**
 * Create a MySQL connection without specifying a database
 * Used for operations like CREATE DATABASE, SHOW DATABASES
 */
export async function getConnection() {
  return getPool().getConnection();
}

/**
 * Create a MySQL connection to a specific database
 * Used for operations within a database like CREATE TABLE, INSERT, SELECT, etc.
 */
export async function getConnectionWithDatabase(database: string) {
  const connection = await getPool().getConnection();
  await connection.changeUser({ database });
  return connection;
}

/**
 * Execute a query without a specific database context
 */
export async function executeQuery(query: string) {
  let connection: any = null;
  try {
    connection = await getConnection();
    const [results] = await connection.execute(query);
    return { success: true, results };
  } catch (error: unknown) {
    const mysqlError = error as { message: string; code?: string; errno?: number; sqlState?: string };
    return {
      success: false,
      error: mysqlError.message,
      code: mysqlError.code,
      errno: mysqlError.errno,
      sqlState: mysqlError.sqlState,
    };
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

/**
 * Execute a query within a specific database context
 */
export async function executeQueryInDatabase(database: string, query: string) {
  let connection: any = null;
  try {
    connection = await getConnectionWithDatabase(database);
    const [results, fields] = await connection.execute(query);
    return { success: true, results, fields };
  } catch (error: unknown) {
    const mysqlError = error as { message: string; code?: string; errno?: number; sqlState?: string };
    return {
      success: false,
      error: mysqlError.message,
      code: mysqlError.code,
      errno: mysqlError.errno,
      sqlState: mysqlError.sqlState,
    };
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

/**
 * Format MySQL results for terminal display
 * Makes the output look like MySQL CLI output
 */
export function formatResultsForTerminal(results: unknown, query: string): string[] {
  const logs: string[] = [];
  const upperQuery = query.toUpperCase().trim();

  // Handle different query types
  if (Array.isArray(results) && results.length > 0) {
    // SELECT, SHOW, DESCRIBE queries return arrays
    if (typeof results[0] === 'object' && results[0] !== null) {
      const columns = Object.keys(results[0] as Record<string, unknown>);
      
      // Calculate column widths
      const widths = columns.map((col) => {
        const values = results.map((row) => String((row as Record<string, unknown>)[col] ?? 'NULL'));
        return Math.max(col.length, ...values.map((v) => v.length));
      });

      // Build separator
      const separator = '+' + widths.map((w) => '-'.repeat(w + 2)).join('+') + '+';

      logs.push(separator);
      logs.push('| ' + columns.map((col, i) => col.padEnd(widths[i])).join(' | ') + ' |');
      logs.push(separator);

      // Add rows
      results.forEach((row) => {
        const values = columns.map((col, i) => 
          String((row as Record<string, unknown>)[col] ?? 'NULL').padEnd(widths[i])
        );
        logs.push('| ' + values.join(' | ') + ' |');
      });

      logs.push(separator);
      logs.push(`${results.length} row(s) in set`);
    }
  } else if (results && typeof results === 'object') {
    // INSERT, UPDATE, DELETE return result objects
    const resultInfo = results as { affectedRows?: number; insertId?: number; changedRows?: number };
    
    if ('affectedRows' in resultInfo) {
      if (upperQuery.startsWith('INSERT')) {
        logs.push(`Query OK, ${resultInfo.affectedRows} row(s) affected`);
        if (resultInfo.insertId) {
          logs.push(`Last insert ID: ${resultInfo.insertId}`);
        }
      } else if (upperQuery.startsWith('UPDATE')) {
        logs.push(`Query OK, ${resultInfo.affectedRows} row(s) affected, ${resultInfo.changedRows || 0} row(s) changed`);
      } else if (upperQuery.startsWith('DELETE')) {
        logs.push(`Query OK, ${resultInfo.affectedRows} row(s) affected`);
      } else if (upperQuery.startsWith('CREATE')) {
        logs.push('Query OK, 0 rows affected');
      } else if (upperQuery.startsWith('DROP')) {
        logs.push('Query OK, 0 rows affected');
      } else if (upperQuery.startsWith('ALTER')) {
        logs.push('Query OK, 0 rows affected');
      } else {
        logs.push(`Query OK, ${resultInfo.affectedRows} row(s) affected`);
      }
    }
  } else if (results === undefined || (Array.isArray(results) && results.length === 0)) {
    if (upperQuery.startsWith('SELECT') || upperQuery.startsWith('SHOW') || upperQuery.startsWith('DESC')) {
      logs.push('Empty set');
    } else {
      logs.push('Query OK');
    }
  }

  return logs;
}

/**
 * Format MySQL error for terminal display
 */
export function formatErrorForTerminal(error: string, code?: string, errno?: number): string {
  if (errno && code) {
    return `ERROR ${errno} (${code}): ${error}`;
  }
  return `ERROR: ${error}`;
}

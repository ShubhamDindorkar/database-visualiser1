/**
 * SQL Parser and Importer
 * Parses SQL file contents and creates tables/databases accordingly
 */

export interface ParsedSQL {
  databaseName: string | null;
  createTableStatements: Array<{
    tableName: string;
    sql: string;
  }>;
  insertStatements: Array<{
    tableName: string;
    sql: string;
  }>;
  otherStatements: Array<{
    type: string;
    sql: string;
  }>;
}

/**
 * Parse SQL file contents
 */
export function parseSQLFile(sqlContent: string): ParsedSQL {
  const result: ParsedSQL = {
    databaseName: null,
    createTableStatements: [],
    insertStatements: [],
    otherStatements: [],
  };

  // Split by semicolon, but be careful with strings
  const statements = splitSQLStatements(sqlContent);

  for (const statement of statements) {
    const trimmed = statement.trim();
    if (!trimmed) continue;

    const upperCase = trimmed.toUpperCase();

    // Check for CREATE DATABASE
    if (upperCase.startsWith('CREATE DATABASE')) {
      const match = trimmed.match(
        /CREATE\s+DATABASE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([^`\s;]+)`?/i
      );
      if (match) {
        result.databaseName = match[1];
      }
    }
    // Check for USE DATABASE
    else if (upperCase.startsWith('USE')) {
      const match = trimmed.match(/USE\s+`?([^`\s;]+)`?/i);
      if (match) {
        result.databaseName = match[1];
      }
    }
    // Check for CREATE TABLE
    else if (upperCase.startsWith('CREATE TABLE')) {
      const match = trimmed.match(
        /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([^`\s(]+)`?/i
      );
      if (match) {
        result.createTableStatements.push({
          tableName: match[1],
          sql: trimmed,
        });
      }
    }
    // Check for INSERT
    else if (upperCase.startsWith('INSERT')) {
      const match = trimmed.match(/INSERT\s+INTO\s+`?([^`\s(\n]+)`?/i);
      if (match) {
        result.insertStatements.push({
          tableName: match[1],
          sql: trimmed,
        });
      }
    }
    // Other statements (TRIGGER, PROCEDURE, etc.)
    else if (
      upperCase.startsWith('CREATE TRIGGER') ||
      upperCase.startsWith('CREATE PROCEDURE') ||
      upperCase.startsWith('CREATE FUNCTION')
    ) {
      result.otherStatements.push({
        type: 'STORED_OBJECT',
        sql: trimmed,
      });
    }
  }

  return result;
}

/**
 * Split SQL statements carefully (respecting strings and comments)
 */
function splitSQLStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let inLineComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    // Handle line comments
    if (!inString && char === '-' && nextChar === '-') {
      inLineComment = true;
      i++; // skip next -
      continue;
    }

    // End line comment
    if (inLineComment && (char === '\n' || char === '\r')) {
      inLineComment = false;
      current += char;
      continue;
    }

    if (inLineComment) continue;

    // Handle block comments
    if (!inString && char === '/' && nextChar === '*') {
      inComment = true;
      i++; // skip *
      continue;
    }

    if (inComment && char === '*' && nextChar === '/') {
      inComment = false;
      i++; // skip /
      continue;
    }

    if (inComment) continue;

    // Handle strings
    if ((char === "'" || char === '"' || char === '`') && !inString) {
      inString = true;
      stringChar = char;
      current += char;
      continue;
    }

    if (inString && char === stringChar && sql[i - 1] !== '\\') {
      inString = false;
      current += char;
      continue;
    }

    // Handle statement terminator
    if (!inString && char === ';') {
      current += char;
      if (current.trim()) {
        statements.push(current);
      }
      current = '';
      continue;
    }

    current += char;
  }

  // Add remaining statement
  if (current.trim()) {
    statements.push(current);
  }

  return statements;
}

/**
 * Extract table name from CREATE TABLE statement
 */
export function extractTableName(createTableSQL: string): string {
  const match = createTableSQL.match(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([^`\s(]+)`?/i
  );
  return match ? match[1] : '';
}

/**
 * Extract column definitions from CREATE TABLE statement
 */
export function extractColumns(createTableSQL: string): Array<{
  name: string;
  type: string;
  constraints: string[];
}> {
  const columns: Array<{
    name: string;
    type: string;
    constraints: string[];
  }> = [];

  // Remove CREATE TABLE part and get the content between parentheses
  const match = createTableSQL.match(/\(([\s\S]*)\)(?:\s*;)?$/);
  if (!match) return columns;

  const content = match[1];

  // Split by comma, but be careful with nested parentheses (for foreign key constraints)
  const parts = splitByTopLevelComma(content);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Skip constraint definitions that start with PRIMARY KEY, FOREIGN KEY, etc.
    if (
      trimmed.toUpperCase().startsWith('PRIMARY KEY') ||
      trimmed.toUpperCase().startsWith('FOREIGN KEY') ||
      trimmed.toUpperCase().startsWith('UNIQUE') ||
      trimmed.toUpperCase().startsWith('CHECK') ||
      trimmed.toUpperCase().startsWith('CONSTRAINT')
    ) {
      continue;
    }

    // Parse column definition
    const columnMatch = trimmed.match(/`?(\w+)`?\s+([^\s]+)(.*)$/i);
    if (columnMatch) {
      const name = columnMatch[1];
      const type = columnMatch[2];
      const constraintsStr = columnMatch[3].trim();
      const constraints = constraintsStr
        .split(/\s+/)
        .filter((c) => c && c !== '');

      columns.push({
        name,
        type,
        constraints,
      });
    }
  }

  return columns;
}

/**
 * Split string by comma at top level only (respecting parentheses)
 */
function splitByTopLevelComma(str: string): string[] {
  const parts: string[] = [];
  let current = '';
  let parenLevel = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    // Handle strings
    if ((char === "'" || char === '"' || char === '`') && !inString) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && str[i - 1] !== '\\') {
      inString = false;
    }

    if (!inString) {
      if (char === '(') parenLevel++;
      else if (char === ')') parenLevel--;
      else if (char === ',' && parenLevel === 0) {
        parts.push(current);
        current = '';
        continue;
      }
    }

    current += char;
  }

  if (current) parts.push(current);
  return parts;
}

/**
 * Validate if SQL looks reasonable for import
 */
export function validateSQL(sqlContent: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = sqlContent.trim();

  if (!trimmed) {
    return { valid: false, error: 'SQL file is empty' };
  }

  if (!trimmed.includes('CREATE TABLE')) {
    return {
      valid: false,
      error: 'No CREATE TABLE statements found in the SQL file',
    };
  }

  return { valid: true };
}

/**
 * Generate a database name from filename if no database is specified
 */
export function generateDatabaseName(fileName: string): string {
  return fileName
    .replace(/\.sql$/i, '')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^(\d)/, '_$1') // prepend _ if starts with number
    .substring(0, 64);
}

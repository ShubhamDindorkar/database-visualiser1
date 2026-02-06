// SQL Knowledge Base for Rule-Based Chatbot
// Each intent contains patterns to match and responses with SQL and explanations

export interface SQLIntent {
    intent: string;
    patterns: string[];
    response: {
        sql: string[];
        explanation: string;
    };
}

export const sqlKnowledgeBase: SQLIntent[] = [
    // Database Creation
    {
        intent: "create_database",
        patterns: [
            "create database",
            "new database",
            "make database",
            "how to create db",
            "create db"
        ],
        response: {
            sql: [
                "CREATE DATABASE database_name;",
                "USE database_name;"
            ],
            explanation: "Use CREATE DATABASE to create a new database. The USE statement selects it as the active database for subsequent operations."
        }
    },
    {
        intent: "create_students_db",
        patterns: [
            "students database",
            "student db",
            "create students",
            "student table",
            "students table"
        ],
        response: {
            sql: [
                "CREATE DATABASE students_db;",
                "USE students_db;",
                "CREATE TABLE students (",
                "  student_id INT PRIMARY KEY AUTO_INCREMENT,",
                "  first_name VARCHAR(50) NOT NULL,",
                "  last_name VARCHAR(50) NOT NULL,",
                "  email VARCHAR(100) UNIQUE,",
                "  date_of_birth DATE,",
                "  enrollment_date DATE DEFAULT CURRENT_DATE,",
                "  gpa DECIMAL(3,2)",
                ");"
            ],
            explanation: "This creates a students database with a comprehensive students table including auto-incrementing ID, personal info, email with unique constraint, and academic details."
        }
    },
    {
        intent: "create_users_table",
        patterns: [
            "users table",
            "user table",
            "create users",
            "user management"
        ],
        response: {
            sql: [
                "CREATE TABLE users (",
                "  user_id INT PRIMARY KEY AUTO_INCREMENT,",
                "  username VARCHAR(50) NOT NULL UNIQUE,",
                "  email VARCHAR(100) NOT NULL UNIQUE,",
                "  password_hash VARCHAR(255) NOT NULL,",
                "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,",
                "  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,",
                "  is_active BOOLEAN DEFAULT TRUE",
                ");"
            ],
            explanation: "A standard users table with authentication fields, timestamps for tracking, and an active status flag. Passwords should always be stored as hashes."
        }
    },
    {
        intent: "create_orders_table",
        patterns: [
            "orders table",
            "order table",
            "create orders",
            "ecommerce orders",
            "shopping orders"
        ],
        response: {
            sql: [
                "CREATE TABLE orders (",
                "  order_id INT PRIMARY KEY AUTO_INCREMENT,",
                "  user_id INT NOT NULL,",
                "  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,",
                "  total_amount DECIMAL(10,2) NOT NULL,",
                "  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',",
                "  shipping_address TEXT,",
                "  FOREIGN KEY (user_id) REFERENCES users(user_id)",
                ");"
            ],
            explanation: "An orders table for e-commerce with status tracking using ENUM, foreign key to users, and automatic timestamp for order date."
        }
    },
    {
        intent: "create_products_table",
        patterns: [
            "products table",
            "product table",
            "create products",
            "inventory table",
            "items table"
        ],
        response: {
            sql: [
                "CREATE TABLE products (",
                "  product_id INT PRIMARY KEY AUTO_INCREMENT,",
                "  name VARCHAR(100) NOT NULL,",
                "  description TEXT,",
                "  price DECIMAL(10,2) NOT NULL,",
                "  stock_quantity INT DEFAULT 0,",
                "  category_id INT,",
                "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,",
                "  FOREIGN KEY (category_id) REFERENCES categories(category_id)",
                ");"
            ],
            explanation: "A products table for inventory management with pricing, stock tracking, and category relationships."
        }
    },
    {
        intent: "create_employees_table",
        patterns: [
            "employees table",
            "employee table",
            "create employees",
            "staff table",
            "hr table"
        ],
        response: {
            sql: [
                "CREATE TABLE employees (",
                "  employee_id INT PRIMARY KEY AUTO_INCREMENT,",
                "  first_name VARCHAR(50) NOT NULL,",
                "  last_name VARCHAR(50) NOT NULL,",
                "  email VARCHAR(100) UNIQUE,",
                "  phone VARCHAR(20),",
                "  hire_date DATE NOT NULL,",
                "  department_id INT,",
                "  salary DECIMAL(10,2),",
                "  manager_id INT,",
                "  FOREIGN KEY (department_id) REFERENCES departments(department_id),",
                "  FOREIGN KEY (manager_id) REFERENCES employees(employee_id)",
                ");"
            ],
            explanation: "An employees table with self-referencing foreign key for manager hierarchy and department relationship. Includes essential HR fields."
        }
    },
    {
        intent: "create_cars_table",
        patterns: [
            "cars table",
            "car table",
            "create cars",
            "vehicles table",
            "automobile table"
        ],
        response: {
            sql: [
                "CREATE TABLE cars (",
                "  car_id INT PRIMARY KEY AUTO_INCREMENT,",
                "  make VARCHAR(50) NOT NULL,",
                "  model VARCHAR(50) NOT NULL,",
                "  year INT NOT NULL,",
                "  color VARCHAR(30),",
                "  price DECIMAL(10,2),",
                "  mileage INT,",
                "  vin VARCHAR(17) UNIQUE,",
                "  is_available BOOLEAN DEFAULT TRUE",
                ");"
            ],
            explanation: "A cars table for dealership or rental management with VIN (Vehicle Identification Number) as unique identifier and availability tracking."
        }
    },

    // SELECT Queries
    {
        intent: "select_all",
        patterns: [
            "select all",
            "get all records",
            "fetch all data",
            "show all",
            "display all rows"
        ],
        response: {
            sql: [
                "SELECT * FROM table_name;"
            ],
            explanation: "SELECT * retrieves all columns from a table. For better performance, specify only needed columns instead of using *."
        }
    },
    {
        intent: "select_specific",
        patterns: [
            "select specific columns",
            "get certain columns",
            "choose columns",
            "select some fields"
        ],
        response: {
            sql: [
                "SELECT column1, column2, column3",
                "FROM table_name;"
            ],
            explanation: "Specify column names to retrieve only the data you need. This improves query performance and reduces data transfer."
        }
    },
    {
        intent: "select_where",
        patterns: [
            "select where",
            "filter data",
            "conditional select",
            "where clause",
            "filter rows"
        ],
        response: {
            sql: [
                "SELECT * FROM table_name",
                "WHERE condition;",
                "",
                "-- Examples:",
                "SELECT * FROM users WHERE age > 18;",
                "SELECT * FROM products WHERE price BETWEEN 10 AND 50;",
                "SELECT * FROM orders WHERE status = 'pending';"
            ],
            explanation: "The WHERE clause filters rows based on conditions. You can use comparison operators (=, >, <, >=, <=, <>), BETWEEN, IN, LIKE, and logical operators (AND, OR, NOT)."
        }
    },
    {
        intent: "select_distinct",
        patterns: [
            "select distinct",
            "unique values",
            "no duplicates",
            "distinct records"
        ],
        response: {
            sql: [
                "SELECT DISTINCT column_name",
                "FROM table_name;",
                "",
                "-- Multiple columns:",
                "SELECT DISTINCT column1, column2",
                "FROM table_name;"
            ],
            explanation: "DISTINCT removes duplicate values from the result set. When used with multiple columns, it returns unique combinations of those columns."
        }
    },

    // JOIN Operations
    {
        intent: "inner_join",
        patterns: [
            "inner join",
            "join tables",
            "combine tables",
            "match records",
            "join two tables"
        ],
        response: {
            sql: [
                "SELECT a.column1, b.column2",
                "FROM table_a a",
                "INNER JOIN table_b b ON a.id = b.a_id;"
            ],
            explanation: "INNER JOIN returns only rows that have matching values in both tables. It's the most common type of join and excludes non-matching rows from both tables."
        }
    },
    {
        intent: "left_join",
        patterns: [
            "left join",
            "left outer join",
            "all from left table"
        ],
        response: {
            sql: [
                "SELECT a.column1, b.column2",
                "FROM table_a a",
                "LEFT JOIN table_b b ON a.id = b.a_id;"
            ],
            explanation: "LEFT JOIN returns all rows from the left table and matching rows from the right table. Non-matching right rows show NULL values."
        }
    },
    {
        intent: "right_join",
        patterns: [
            "right join",
            "right outer join",
            "all from right table"
        ],
        response: {
            sql: [
                "SELECT a.column1, b.column2",
                "FROM table_a a",
                "RIGHT JOIN table_b b ON a.id = b.a_id;"
            ],
            explanation: "RIGHT JOIN returns all rows from the right table and matching rows from the left table. Non-matching left rows show NULL values."
        }
    },

    // Aggregate Functions
    {
        intent: "aggregate_count",
        patterns: [
            "count records",
            "count rows",
            "how many",
            "total count",
            "count function"
        ],
        response: {
            sql: [
                "-- Count all rows:",
                "SELECT COUNT(*) FROM table_name;",
                "",
                "-- Count non-null values:",
                "SELECT COUNT(column_name) FROM table_name;",
                "",
                "-- Count with condition:",
                "SELECT COUNT(*) FROM orders WHERE status = 'completed';"
            ],
            explanation: "COUNT() returns the number of rows. COUNT(*) counts all rows, while COUNT(column) counts non-NULL values in that column."
        }
    },
    {
        intent: "aggregate_sum_avg",
        patterns: [
            "sum values",
            "calculate total",
            "average",
            "mean value",
            "sum function",
            "avg function"
        ],
        response: {
            sql: [
                "-- Sum:",
                "SELECT SUM(amount) FROM orders;",
                "",
                "-- Average:",
                "SELECT AVG(price) FROM products;",
                "",
                "-- Combined:",
                "SELECT ",
                "  SUM(total_amount) as total_sales,",
                "  AVG(total_amount) as avg_order_value",
                "FROM orders;"
            ],
            explanation: "SUM() calculates the total of numeric values. AVG() calculates the arithmetic mean. Both ignore NULL values."
        }
    },
    {
        intent: "group_by",
        patterns: [
            "group by",
            "group records",
            "aggregate by category",
            "summarize by"
        ],
        response: {
            sql: [
                "SELECT category, COUNT(*) as item_count",
                "FROM products",
                "GROUP BY category;",
                "",
                "-- With HAVING (filter groups):",
                "SELECT category, COUNT(*) as item_count",
                "FROM products",
                "GROUP BY category",
                "HAVING COUNT(*) > 5;"
            ],
            explanation: "GROUP BY groups rows with the same values. Use aggregate functions with GROUP BY. HAVING filters groups (unlike WHERE which filters rows)."
        }
    },

    // Data Modification
    {
        intent: "insert_data",
        patterns: [
            "insert data",
            "add record",
            "insert into",
            "add new row",
            "insert row"
        ],
        response: {
            sql: [
                "-- Insert single row:",
                "INSERT INTO table_name (column1, column2, column3)",
                "VALUES ('value1', 'value2', 'value3');",
                "",
                "-- Insert multiple rows:",
                "INSERT INTO table_name (column1, column2)",
                "VALUES ",
                "  ('value1a', 'value2a'),",
                "  ('value1b', 'value2b'),",
                "  ('value1c', 'value2c');"
            ],
            explanation: "INSERT INTO adds new rows to a table. You can insert single or multiple rows. Column order must match value order."
        }
    },
    {
        intent: "update_data",
        patterns: [
            "update data",
            "modify record",
            "change value",
            "update row",
            "edit record"
        ],
        response: {
            sql: [
                "UPDATE table_name",
                "SET column1 = 'new_value', column2 = 'another_value'",
                "WHERE condition;",
                "",
                "-- Example:",
                "UPDATE users",
                "SET email = 'new@email.com', updated_at = NOW()",
                "WHERE user_id = 1;"
            ],
            explanation: "UPDATE modifies existing records. ALWAYS use WHERE clause to avoid updating all rows accidentally. Test with SELECT first."
        }
    },
    {
        intent: "delete_data",
        patterns: [
            "delete data",
            "remove record",
            "delete row",
            "remove from table"
        ],
        response: {
            sql: [
                "DELETE FROM table_name",
                "WHERE condition;",
                "",
                "-- Example:",
                "DELETE FROM orders WHERE status = 'cancelled';",
                "",
                "-- Delete all (use with caution!):",
                "DELETE FROM table_name;"
            ],
            explanation: "DELETE removes rows from a table. ALWAYS use WHERE clause to avoid deleting all data. Consider using soft deletes (is_deleted flag) instead."
        }
    },

    // Constraints
    {
        intent: "primary_key",
        patterns: [
            "primary key",
            "pk constraint",
            "unique identifier",
            "primary key constraint"
        ],
        response: {
            sql: [
                "-- During table creation:",
                "CREATE TABLE users (",
                "  user_id INT PRIMARY KEY AUTO_INCREMENT,",
                "  username VARCHAR(50)",
                ");",
                "",
                "-- Add to existing table:",
                "ALTER TABLE table_name",
                "ADD PRIMARY KEY (column_name);"
            ],
            explanation: "PRIMARY KEY uniquely identifies each row. It must be unique and NOT NULL. A table can have only one primary key, but it can consist of multiple columns (composite key)."
        }
    },
    {
        intent: "foreign_key",
        patterns: [
            "foreign key",
            "fk constraint",
            "reference another table",
            "relationship between tables",
            "create relationship"
        ],
        response: {
            sql: [
                "-- During table creation:",
                "CREATE TABLE orders (",
                "  order_id INT PRIMARY KEY,",
                "  user_id INT,",
                "  FOREIGN KEY (user_id) REFERENCES users(user_id)",
                ");",
                "",
                "-- With ON DELETE/UPDATE actions:",
                "FOREIGN KEY (user_id) REFERENCES users(user_id)",
                "  ON DELETE CASCADE",
                "  ON UPDATE CASCADE"
            ],
            explanation: "FOREIGN KEY links two tables together. It references a PRIMARY KEY in another table. CASCADE options automatically propagate changes to related records."
        }
    },
    {
        intent: "unique_constraint",
        patterns: [
            "unique constraint",
            "unique values only",
            "no duplicate values",
            "ensure unique"
        ],
        response: {
            sql: [
                "-- During table creation:",
                "email VARCHAR(100) UNIQUE,",
                "",
                "-- Add to existing table:",
                "ALTER TABLE table_name",
                "ADD UNIQUE (column_name);",
                "",
                "-- Composite unique:",
                "ALTER TABLE table_name",
                "ADD UNIQUE (column1, column2);"
            ],
            explanation: "UNIQUE constraint ensures all values in a column are different. Unlike PRIMARY KEY, you can have multiple UNIQUE constraints and they allow NULL values."
        }
    },
    {
        intent: "not_null_constraint",
        patterns: [
            "not null",
            "required field",
            "mandatory column",
            "prevent null"
        ],
        response: {
            sql: [
                "-- During table creation:",
                "column_name VARCHAR(50) NOT NULL,",
                "",
                "-- Add to existing column:",
                "ALTER TABLE table_name",
                "MODIFY column_name VARCHAR(50) NOT NULL;"
            ],
            explanation: "NOT NULL constraint ensures a column cannot have NULL values. Use it for mandatory fields like usernames, emails, or IDs."
        }
    },
    {
        intent: "check_constraint",
        patterns: [
            "check constraint",
            "validate data",
            "data validation",
            "ensure value range"
        ],
        response: {
            sql: [
                "-- During table creation:",
                "CREATE TABLE products (",
                "  price DECIMAL(10,2) CHECK (price > 0),",
                "  quantity INT CHECK (quantity >= 0)",
                ");",
                "",
                "-- Named constraint:",
                "CONSTRAINT chk_age CHECK (age >= 18 AND age <= 120)"
            ],
            explanation: "CHECK constraint limits the values that can be placed in a column. It's useful for enforcing business rules at the database level."
        }
    },
    {
        intent: "auto_increment",
        patterns: [
            "auto increment",
            "auto id",
            "automatic id",
            "sequence",
            "auto generate id"
        ],
        response: {
            sql: [
                "-- MySQL:",
                "id INT PRIMARY KEY AUTO_INCREMENT",
                "",
                "-- Set starting value:",
                "ALTER TABLE table_name AUTO_INCREMENT = 1000;",
                "",
                "-- PostgreSQL uses SERIAL:",
                "id SERIAL PRIMARY KEY"
            ],
            explanation: "AUTO_INCREMENT automatically generates unique numbers for new rows. It's commonly used for primary keys. Each new row gets the last value + 1."
        }
    },

    // Table Operations
    {
        intent: "alter_table",
        patterns: [
            "alter table",
            "modify table",
            "change table structure",
            "add column",
            "drop column"
        ],
        response: {
            sql: [
                "-- Add column:",
                "ALTER TABLE table_name",
                "ADD column_name datatype;",
                "",
                "-- Drop column:",
                "ALTER TABLE table_name",
                "DROP COLUMN column_name;",
                "",
                "-- Modify column:",
                "ALTER TABLE table_name",
                "MODIFY column_name new_datatype;",
                "",
                "-- Rename column:",
                "ALTER TABLE table_name",
                "RENAME COLUMN old_name TO new_name;"
            ],
            explanation: "ALTER TABLE changes table structure. You can add, remove, or modify columns. Be careful with DROP COLUMN on production databases."
        }
    },
    {
        intent: "drop_table",
        patterns: [
            "drop table",
            "delete table",
            "remove table",
            "destroy table"
        ],
        response: {
            sql: [
                "-- Drop single table:",
                "DROP TABLE table_name;",
                "",
                "-- Drop if exists (prevents error):",
                "DROP TABLE IF EXISTS table_name;",
                "",
                "-- Drop multiple tables:",
                "DROP TABLE table1, table2, table3;"
            ],
            explanation: "DROP TABLE permanently deletes a table and all its data. This action cannot be undone. Always backup before dropping tables in production."
        }
    },
    {
        intent: "truncate_table",
        patterns: [
            "truncate table",
            "clear table",
            "empty table",
            "remove all rows fast"
        ],
        response: {
            sql: [
                "TRUNCATE TABLE table_name;"
            ],
            explanation: "TRUNCATE removes all rows from a table quickly. It's faster than DELETE because it doesn't log individual row deletions. It also resets AUTO_INCREMENT."
        }
    },

    // Indexes
    {
        intent: "create_index",
        patterns: [
            "create index",
            "add index",
            "improve performance",
            "speed up queries",
            "index column"
        ],
        response: {
            sql: [
                "-- Simple index:",
                "CREATE INDEX idx_name ON table_name(column_name);",
                "",
                "-- Unique index:",
                "CREATE UNIQUE INDEX idx_email ON users(email);",
                "",
                "-- Composite index:",
                "CREATE INDEX idx_name_date ON orders(customer_name, order_date);"
            ],
            explanation: "Indexes speed up data retrieval but slow down INSERT/UPDATE. Create indexes on columns frequently used in WHERE, JOIN, and ORDER BY clauses."
        }
    },

    // Subqueries
    {
        intent: "subquery",
        patterns: [
            "subquery",
            "nested query",
            "query inside query",
            "inner query"
        ],
        response: {
            sql: [
                "-- Subquery in WHERE:",
                "SELECT * FROM products",
                "WHERE price > (SELECT AVG(price) FROM products);",
                "",
                "-- Subquery in FROM:",
                "SELECT avg_price FROM",
                "  (SELECT category, AVG(price) as avg_price",
                "   FROM products GROUP BY category) as subq;",
                "",
                "-- Subquery with IN:",
                "SELECT * FROM users",
                "WHERE user_id IN (SELECT user_id FROM orders);"
            ],
            explanation: "Subqueries are queries nested inside other queries. They can be used in SELECT, FROM, WHERE, and HAVING clauses. Consider using JOINs for better performance."
        }
    },

    // Ordering and Limiting
    {
        intent: "order_by",
        patterns: [
            "order by",
            "sort results",
            "ascending",
            "descending",
            "arrange data"
        ],
        response: {
            sql: [
                "-- Ascending (default):",
                "SELECT * FROM products ORDER BY price ASC;",
                "",
                "-- Descending:",
                "SELECT * FROM products ORDER BY price DESC;",
                "",
                "-- Multiple columns:",
                "SELECT * FROM users ORDER BY last_name ASC, first_name ASC;"
            ],
            explanation: "ORDER BY sorts the result set. ASC (ascending) is default. You can sort by multiple columns - the second column breaks ties in the first."
        }
    },
    {
        intent: "limit_offset",
        patterns: [
            "limit results",
            "pagination",
            "first n rows",
            "skip rows",
            "limit offset"
        ],
        response: {
            sql: [
                "-- First 10 rows:",
                "SELECT * FROM products LIMIT 10;",
                "",
                "-- Pagination (skip first 20, get next 10):",
                "SELECT * FROM products LIMIT 10 OFFSET 20;",
                "",
                "-- Alternative syntax:",
                "SELECT * FROM products LIMIT 20, 10;"
            ],
            explanation: "LIMIT restricts the number of rows returned. OFFSET skips rows before returning. This is essential for pagination in web applications."
        }
    },

    // LIKE and Pattern Matching
    {
        intent: "like_pattern",
        patterns: [
            "like pattern",
            "pattern matching",
            "search text",
            "wildcard search",
            "contains"
        ],
        response: {
            sql: [
                "-- Starts with:",
                "SELECT * FROM users WHERE name LIKE 'John%';",
                "",
                "-- Ends with:",
                "SELECT * FROM users WHERE email LIKE '%@gmail.com';",
                "",
                "-- Contains:",
                "SELECT * FROM products WHERE description LIKE '%sale%';",
                "",
                "-- Single character wildcard:",
                "SELECT * FROM users WHERE name LIKE 'J_hn';"
            ],
            explanation: "LIKE is used for pattern matching. % matches any sequence of characters. _ matches exactly one character. Use ILIKE for case-insensitive matching (PostgreSQL)."
        }
    },

    // NULL Handling
    {
        intent: "null_handling",
        patterns: [
            "null values",
            "is null",
            "is not null",
            "handle null",
            "check null"
        ],
        response: {
            sql: [
                "-- Check for NULL:",
                "SELECT * FROM users WHERE phone IS NULL;",
                "",
                "-- Check for NOT NULL:",
                "SELECT * FROM users WHERE email IS NOT NULL;",
                "",
                "-- Replace NULL with default:",
                "SELECT COALESCE(phone, 'N/A') FROM users;",
                "",
                "-- IFNULL (MySQL):",
                "SELECT IFNULL(phone, 'No phone') FROM users;"
            ],
            explanation: "NULL represents missing or unknown data. Use IS NULL or IS NOT NULL to check (not = NULL). COALESCE returns the first non-NULL value."
        }
    },

    // Views
    {
        intent: "create_view",
        patterns: [
            "create view",
            "virtual table",
            "saved query",
            "view definition"
        ],
        response: {
            sql: [
                "-- Create view:",
                "CREATE VIEW active_users AS",
                "SELECT user_id, username, email",
                "FROM users",
                "WHERE is_active = TRUE;",
                "",
                "-- Use view:",
                "SELECT * FROM active_users;",
                "",
                "-- Drop view:",
                "DROP VIEW IF EXISTS active_users;"
            ],
            explanation: "Views are virtual tables based on SELECT queries. They simplify complex queries, provide security by limiting data access, and don't store data themselves."
        }
    },

    // Transactions
    {
        intent: "transactions",
        patterns: [
            "transaction",
            "commit",
            "rollback",
            "begin transaction",
            "atomic operation"
        ],
        response: {
            sql: [
                "-- Start transaction:",
                "START TRANSACTION;",
                "",
                "-- Your SQL operations:",
                "UPDATE accounts SET balance = balance - 100 WHERE id = 1;",
                "UPDATE accounts SET balance = balance + 100 WHERE id = 2;",
                "",
                "-- If all successful:",
                "COMMIT;",
                "",
                "-- If error occurs:",
                "ROLLBACK;"
            ],
            explanation: "Transactions ensure ACID properties (Atomicity, Consistency, Isolation, Durability). All operations succeed together or fail together, maintaining data integrity."
        }
    },

    // Data Types
    {
        intent: "data_types",
        patterns: [
            "data types",
            "column types",
            "mysql types",
            "what type to use"
        ],
        response: {
            sql: [
                "-- Numeric: INT, BIGINT, DECIMAL(10,2), FLOAT",
                "-- String: VARCHAR(255), CHAR(10), TEXT",
                "-- Date/Time: DATE, DATETIME, TIMESTAMP, TIME",
                "-- Boolean: BOOLEAN, TINYINT(1)",
                "-- Binary: BLOB, BINARY",
                "-- Special: JSON, ENUM('a','b','c')"
            ],
            explanation: "Choose data types based on data nature and size. VARCHAR for variable text, DECIMAL for money, TIMESTAMP for auto-updating times, ENUM for predefined choices."
        }
    },

    // UNION
    {
        intent: "union_queries",
        patterns: [
            "union",
            "combine results",
            "merge queries",
            "union all"
        ],
        response: {
            sql: [
                "-- UNION (removes duplicates):",
                "SELECT name FROM customers",
                "UNION",
                "SELECT name FROM suppliers;",
                "",
                "-- UNION ALL (keeps duplicates):",
                "SELECT name FROM customers",
                "UNION ALL",
                "SELECT name FROM suppliers;"
            ],
            explanation: "UNION combines results from multiple SELECT statements. UNION removes duplicates, UNION ALL keeps them. Both require matching column count and compatible types."
        }
    },

    // CASE Statement
    {
        intent: "case_statement",
        patterns: [
            "case when",
            "if else sql",
            "conditional logic",
            "case statement"
        ],
        response: {
            sql: [
                "SELECT product_name, price,",
                "  CASE",
                "    WHEN price < 10 THEN 'Budget'",
                "    WHEN price < 50 THEN 'Mid-range'",
                "    WHEN price < 100 THEN 'Premium'",
                "    ELSE 'Luxury'",
                "  END AS price_category",
                "FROM products;"
            ],
            explanation: "CASE provides if-then-else logic in SQL. It evaluates conditions in order and returns the result for the first true condition. ELSE handles unmatched cases."
        }
    },

    // Date Functions
    {
        intent: "date_functions",
        patterns: [
            "date functions",
            "current date",
            "date difference",
            "date format"
        ],
        response: {
            sql: [
                "-- Current date/time:",
                "SELECT NOW(), CURDATE(), CURTIME();",
                "",
                "-- Extract parts:",
                "SELECT YEAR(date_col), MONTH(date_col), DAY(date_col);",
                "",
                "-- Date arithmetic:",
                "SELECT DATE_ADD(date_col, INTERVAL 7 DAY);",
                "SELECT DATEDIFF(end_date, start_date);",
                "",
                "-- Format date:",
                "SELECT DATE_FORMAT(date_col, '%Y-%m-%d');"
            ],
            explanation: "Date functions manipulate date/time values. NOW() returns current datetime, DATE_ADD/SUB for arithmetic, DATEDIFF for differences, DATE_FORMAT for custom display."
        }
    },

    // String Functions
    {
        intent: "string_functions",
        patterns: [
            "string functions",
            "text manipulation",
            "concat",
            "substring"
        ],
        response: {
            sql: [
                "-- Concatenate:",
                "SELECT CONCAT(first_name, ' ', last_name) AS full_name;",
                "",
                "-- Substring:",
                "SELECT SUBSTRING(name, 1, 3);",
                "",
                "-- Case conversion:",
                "SELECT UPPER(name), LOWER(email);",
                "",
                "-- Trim whitespace:",
                "SELECT TRIM(name);",
                "",
                "-- Length:",
                "SELECT LENGTH(description);"
            ],
            explanation: "String functions manipulate text data. CONCAT joins strings, SUBSTRING extracts parts, UPPER/LOWER change case, TRIM removes whitespace, LENGTH counts characters."
        }
    }
];

// Function to find matching intent based on user input
export function findMatchingIntent(userInput: string): SQLIntent | null {
    const normalizedInput = userInput.toLowerCase().trim();

    // Score each intent based on pattern matches
    let bestMatch: SQLIntent | null = null;
    let highestScore = 0;

    for (const intent of sqlKnowledgeBase) {
        let score = 0;

        for (const pattern of intent.patterns) {
            if (normalizedInput.includes(pattern.toLowerCase())) {
                // Longer pattern matches get higher scores
                score += pattern.length;
            }
        }

        if (score > highestScore) {
            highestScore = score;
            bestMatch = intent;
        }
    }

    return highestScore > 0 ? bestMatch : null;
}

// Fallback response for unrecognized queries
export const fallbackResponse = {
    sql: [],
    explanation: "I'm sorry, I couldn't find a specific answer for your question. I can help you with:\n\n• Creating databases and tables (students, users, orders, products, etc.)\n• SELECT queries with WHERE, JOIN, GROUP BY\n• INSERT, UPDATE, DELETE operations\n• Constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, etc.)\n• Indexes, Views, and Transactions\n• SQL functions (date, string, aggregate)\n\nTry asking something like:\n• 'How to create a students table?'\n• 'Show me JOIN syntax'\n• 'What is a foreign key?'"
};

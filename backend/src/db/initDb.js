import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'departmenthub_db';

/**
 * Execute SQL file handling multi-statements safely
 */
async function executeSqlFile(connection, filePath) {
  const fullPath = path.resolve(filePath);
  console.log(`Executing SQL script: ${fullPath}`);
  const sqlContent = fs.readFileSync(fullPath, 'utf8');

  // Split SQL content into statements by semicolon, ignoring comments
  const lines = sqlContent.split('\n');
  const cleanedLines = lines.filter(line => !line.trim().startsWith('--') && line.trim().length > 0);
  const cleanedSql = cleanedLines.join('\n');

  // Split by semicolon that is not within quotes/blocks
  const statements = cleanedSql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt) {
      await connection.query(stmt);
    }
  }
}

export async function initializeDatabase() {
  console.log('----------------------------------------------------');
  console.log('DepartmentHub Database Initialization');
  console.log(`Target: ${dbUser}@${dbHost}:${dbPort} -> Database: ${dbName}`);
  console.log('----------------------------------------------------');

  let connection;
  try {
    // 1. Connect without DB name to ensure database creation
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true
    });

    console.log('[1/4] Connected to MySQL server successfully.');

    // 2. Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`[2/4] Database '${dbName}' created/verified.`);

    // 3. Execute schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('[3/4] Schema tables and constraints applied from database/schema.sql');

    // 4. Execute seed.sql
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await connection.query(seedSql);
    console.log('[4/4] Seed dataset inserted successfully from database/seed.sql');

    // Verify row counts
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n--- Database Summary ---');
    console.log(`Total Tables Created: ${tables.length}`);
    for (const tableObj of tables) {
      const tableName = Object.values(tableObj)[0];
      const [[{ count }]] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      console.log(` - ${tableName.padEnd(25)}: ${count} records`);
    }

    console.log('\n✔ Database setup and seeding completed successfully!\n');
  } catch (error) {
    console.error('\n✖ Database initialization failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run directly if invoked from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase();
}

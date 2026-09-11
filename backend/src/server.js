import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { testConnection } from './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection at startup
    console.log('Testing MySQL database connection...');
    const conn = await testConnection();
    if (conn.success) {
      console.log(`✔ MySQL Connection active on database '${process.env.DB_NAME || 'departmenthub_db'}' (Version: ${conn.data.version})`);
    } else {
      console.warn(`⚠ MySQL connection warning: ${conn.message}`);
      console.warn('  Ensure XAMPP MySQL is started and database has been initialized with "npm run db:init".');
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 DepartmentHub Backend API Server running on port ${PORT}`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
      console.log(`   DB Health:    http://localhost:${PORT}/api/health/db`);
      console.log(`   Environment:  ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal error during backend server startup:', error);
    process.exit(1);
  }
}

startServer();

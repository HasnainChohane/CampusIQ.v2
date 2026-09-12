import { pool, testConnection } from '../db/connection.js';

/**
 * Basic Application Health Check
 */
export async function getSystemHealth(req, res) {
  const uptimeSeconds = Math.floor(process.uptime());
  res.status(200).json({
    status: 'ok',
    service: 'CampusIQ Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`,
    nodeVersion: process.version
  });
}

/**
 * Detailed Database Health Check & Schema Statistics
 */
export async function getDatabaseHealth(req, res, next) {
  const startTime = Date.now();
  try {
    const connStatus = await testConnection();

    if (!connStatus.success) {
      return res.status(503).json({
        status: 'degraded',
        database: {
          connected: false,
          error: connStatus.error,
          message: connStatus.message
        },
        latencyMs: Date.now() - startTime
      });
    }

    // Query list of tables and counts
    const [tables] = await pool.query('SHOW TABLES');
    const tableStats = {};
    let totalRecords = 0;

    for (const tableObj of tables) {
      const tableName = Object.values(tableObj)[0];
      const [[{ count }]] = await pool.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      tableStats[tableName] = count;
      totalRecords += count;
    }

    const latencyMs = Date.now() - startTime;

    res.status(200).json({
      status: 'healthy',
      database: {
        connected: true,
        name: process.env.DB_NAME || 'departmenthub_db',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        version: connStatus.data.version,
        latencyMs,
        tablesCount: tables.length,
        totalRecords,
        tableStats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

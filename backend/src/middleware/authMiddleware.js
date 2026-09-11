import jwt from 'jsonwebtoken';
import { pool } from '../db/connection.js';

const JWT_SECRET = process.env.JWT_SECRET || 'departmenthub_jwt_secure_secret_key_2026_mvp';

/**
 * Middleware to authenticate requests using JWT Bearer token
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required. No token provided.' }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists in database and is active
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.department_id, u.avatar_url, u.is_active, d.name as department_name, d.code as department_code 
       FROM users u 
       JOIN departments d ON u.department_id = d.id 
       WHERE u.id = ? AND u.is_active = TRUE`,
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: 'User account not found or is deactivated.' }
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: { message: 'Invalid or expired authentication token.' }
    });
  }
}

/**
 * Middleware to enforce role-based access control (RBAC)
 * @param  {...string} allowedRoles - List of allowed roles, e.g. ('admin', 'officer')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required.' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { 
          message: `Access denied. Role '${req.user.role}' does not have sufficient permissions for this action.` 
        }
      });
    }

    next();
  };
}

import { pool } from '../db/connection.js';

/**
 * GET /api/inventory
 * List inventory items with search and filters (category, condition, availability)
 */
export async function getInventory(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { search, category, condition, availability } = req.query;

    let query = `SELECT id, item_name, category, total_quantity, available_quantity, assigned_quantity,
                        \`condition\`, purchase_date, purchase_value, location, created_at, updated_at
                 FROM inventory
                 WHERE department_id = ?`;
    const params = [departmentId];

    if (search) {
      query += ` AND (item_name LIKE ? OR location LIKE ?)`;
      const searchWild = `%${search.trim()}%`;
      params.push(searchWild, searchWild);
    }

    if (category && category !== 'all') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (condition && condition !== 'all') {
      query += ` AND \`condition\` = ?`;
      params.push(condition);
    }

    if (availability === 'low') {
      query += ` AND available_quantity <= 3 AND available_quantity > 0`;
    } else if (availability === 'out') {
      query += ` AND available_quantity = 0`;
    } else if (availability === 'available') {
      query += ` AND available_quantity > 0`;
    }

    query += ` ORDER BY category ASC, item_name ASC`;

    const [items] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: {
        inventory: items,
        total: items.length
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventory/stats
 * Aggregate inventory summary KPIs
 */
export async function getInventoryStats(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;

    const [[stats]] = await pool.query(
      `SELECT 
         COUNT(*) as total_items,
         SUM(total_quantity) as total_units,
         SUM(available_quantity) as available_units,
         SUM(assigned_quantity) as assigned_units,
         SUM(purchase_value) as total_valuation,
         SUM(CASE WHEN \`condition\` = 'Damaged' THEN 1 ELSE 0 END) as damaged_count,
         SUM(CASE WHEN available_quantity <= 3 THEN 1 ELSE 0 END) as low_stock_count
       FROM inventory
       WHERE department_id = ?`,
      [departmentId]
    );

    res.status(200).json({
      success: true,
      data: {
        totalItems: stats.total_items || 0,
        totalUnits: stats.total_units || 0,
        availableUnits: stats.available_units || 0,
        assignedUnits: stats.assigned_units || 0,
        totalValuation: parseFloat(stats.total_valuation || 0),
        damagedCount: stats.damaged_count || 0,
        lowStockCount: stats.low_stock_count || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventory/:id
 * Retrieve single item details and active/historical assignments
 */
export async function getInventoryById(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;

    const [items] = await pool.query(
      `SELECT * FROM inventory WHERE id = ? AND department_id = ?`,
      [id, departmentId]
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found.' }
      });
    }

    const item = items[0];

    // Fetch assignments
    const [assignments] = await pool.query(
      `SELECT ia.*, u.name as assigned_user_name, u.email as assigned_user_email, u.role as assigned_user_role
       FROM inventory_assignments ia
       LEFT JOIN users u ON ia.assigned_to_user_id = u.id
       WHERE ia.inventory_id = ?
       ORDER BY ia.status ASC, ia.assigned_date DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        item: {
          ...item,
          assignments
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/inventory
 * Create a new inventory record
 */
export async function createInventoryItem(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { item_name, category, total_quantity, condition, purchase_date, purchase_value, location } = req.body;

    if (!item_name || !category || !total_quantity || !location) {
      return res.status(400).json({
        success: false,
        error: { message: 'Item Name, Category, Total Quantity, and Location are required.' }
      });
    }

    const quantity = parseInt(total_quantity, 10);
    const value = parseFloat(purchase_value || 0);

    const [result] = await pool.query(
      `INSERT INTO inventory (department_id, item_name, category, total_quantity, available_quantity, assigned_quantity, \`condition\`, purchase_date, purchase_value, location)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      [
        departmentId,
        item_name.trim(),
        category,
        quantity,
        quantity, // initial available equals total
        condition || 'Good',
        purchase_date || new Date().toISOString().split('T')[0],
        value,
        location.trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully.',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/inventory/:id
 * Update inventory details
 */
export async function updateInventoryItem(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;
    const { item_name, category, total_quantity, condition, purchase_date, purchase_value, location } = req.body;

    const [current] = await pool.query(`SELECT assigned_quantity FROM inventory WHERE id = ? AND department_id = ?`, [id, departmentId]);
    if (current.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'Item not found.' } });
    }

    const assignedQty = current[0].assigned_quantity;
    let newTotal = total_quantity !== undefined ? parseInt(total_quantity, 10) : undefined;

    if (newTotal !== undefined && newTotal < assignedQty) {
      return res.status(400).json({
        success: false,
        error: { message: `Total quantity cannot be less than currently assigned quantity (${assignedQty}).` }
      });
    }

    const newAvailable = newTotal !== undefined ? (newTotal - assignedQty) : undefined;

    const [result] = await pool.query(
      `UPDATE inventory 
       SET item_name = COALESCE(?, item_name),
           category = COALESCE(?, category),
           total_quantity = COALESCE(?, total_quantity),
           available_quantity = COALESCE(?, available_quantity),
           \`condition\` = COALESCE(?, \`condition\`),
           purchase_date = COALESCE(?, purchase_date),
           purchase_value = COALESCE(?, purchase_value),
           location = COALESCE(?, location)
       WHERE id = ? AND department_id = ?`,
      [item_name, category, newTotal, newAvailable, condition, purchase_date, purchase_value, location, id, departmentId]
    );

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/inventory/:id
 */
export async function deleteInventoryItem(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;

    const [result] = await pool.query(
      `DELETE FROM inventory WHERE id = ? AND department_id = ?`,
      [id, departmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found.' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/inventory/:id/assign
 * Assign an item to a user or room location in a database transaction
 */
export async function assignInventoryItem(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const inventoryId = req.params.id;
    const { assigned_to_user_id, assigned_to_location, quantity } = req.body;
    const assignQty = parseInt(quantity || 1, 10);

    if (assignQty <= 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, error: { message: 'Quantity must be at least 1.' } });
    }

    if (!assigned_to_user_id && !assigned_to_location) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'Please specify an assigned user or location room.' }
      });
    }

    // Lock item row for update
    const [[item]] = await connection.query(
      `SELECT available_quantity, total_quantity, assigned_quantity FROM inventory WHERE id = ? FOR UPDATE`,
      [inventoryId]
    );

    if (!item) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: { message: 'Inventory item not found.' } });
    }

    if (item.available_quantity < assignQty) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: { message: `Insufficient availability. Only ${item.available_quantity} units available.` }
      });
    }

    // Record assignment
    const today = new Date().toISOString().split('T')[0];
    await connection.query(
      `INSERT INTO inventory_assignments (inventory_id, assigned_to_user_id, assigned_to_location, quantity, assigned_date, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [inventoryId, assigned_to_user_id || null, assigned_to_location || null, assignQty, today]
    );

    // Update quantities
    await connection.query(
      `UPDATE inventory 
       SET assigned_quantity = assigned_quantity + ?,
           available_quantity = available_quantity - ?
       WHERE id = ?`,
      [assignQty, assignQty, inventoryId]
    );

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Asset assigned successfully.'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * PUT /api/inventory/assignments/:assignmentId/return
 * Return an active assignment in a database transaction
 */
export async function returnInventoryAssignment(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { assignmentId } = req.params;

    const [[assignment]] = await connection.query(
      `SELECT * FROM inventory_assignments WHERE id = ? FOR UPDATE`,
      [assignmentId]
    );

    if (!assignment) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: { message: 'Assignment record not found.' } });
    }

    if (assignment.status === 'returned') {
      await connection.rollback();
      return res.status(400).json({ success: false, error: { message: 'This assignment has already been returned.' } });
    }

    const today = new Date().toISOString().split('T')[0];

    // Mark returned
    await connection.query(
      `UPDATE inventory_assignments SET status = 'returned', return_date = ? WHERE id = ?`,
      [today, assignmentId]
    );

    // Recalculate inventory quantities
    await connection.query(
      `UPDATE inventory 
       SET assigned_quantity = GREATEST(0, assigned_quantity - ?),
           available_quantity = available_quantity + ?
       WHERE id = ?`,
      [assignment.quantity, assignment.quantity, assignment.inventory_id]
    );

    await connection.commit();
    res.status(200).json({
      success: true,
      message: 'Asset returned to inventory successfully.'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

import { pool } from '../db/connection.js';

/**
 * Service function to automatically update or create inventory record upon purchase approval
 * Can be called with an active db connection (for transaction workflows) or standalone
 */
export async function recordApprovedPurchaseInInventory({
  departmentId = 1,
  itemName,
  category = 'Computers',
  quantity = 1,
  purchaseValue = 0,
  location = 'Department Storage',
  connection = null
}) {
  const runner = connection || pool;

  // Check if item with exact name already exists in the same location/category
  const [existing] = await runner.query(
    `SELECT id, total_quantity, available_quantity, purchase_value 
     FROM inventory 
     WHERE department_id = ? AND item_name = ? AND category = ?`,
    [departmentId, itemName, category]
  );

  if (existing.length > 0) {
    // Increase quantity of existing inventory item
    const current = existing[0];
    const newTotal = current.total_quantity + quantity;
    const newAvailable = current.available_quantity + quantity;
    const newValue = parseFloat(current.purchase_value) + parseFloat(purchaseValue);

    await runner.query(
      `UPDATE inventory 
       SET total_quantity = ?, available_quantity = ?, purchase_value = ? 
       WHERE id = ?`,
      [newTotal, newAvailable, newValue, current.id]
    );

    return {
      success: true,
      action: 'updated',
      inventoryId: current.id,
      item_name: itemName,
      newTotal
    };
  } else {
    // Create new inventory asset entry
    const today = new Date().toISOString().split('T')[0];
    const [insertResult] = await runner.query(
      `INSERT INTO inventory (department_id, item_name, category, total_quantity, available_quantity, assigned_quantity, \`condition\`, purchase_date, purchase_value, location)
       VALUES (?, ?, ?, ?, ?, 0, 'Good', ?, ?, ?)`,
      [departmentId, itemName, category, quantity, quantity, today, purchaseValue, location]
    );

    return {
      success: true,
      action: 'created',
      inventoryId: insertResult.insertId,
      item_name: itemName,
      totalQuantity: quantity
    };
  }
}

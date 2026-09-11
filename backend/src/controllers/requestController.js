import { pool } from '../db/connection.js';
import { analyzeRequestText } from '../services/aiService.js';
import { recordApprovedPurchaseInInventory } from '../services/inventoryService.js';

/**
 * GET /api/requests
 * List requests with search and multi-criteria filtering
 */
export async function getRequests(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { search, type, status, priority, onlyMine } = req.query;

    let query = `SELECT r.id, r.department_id, r.requester_id, r.title, r.description,
                        r.type, r.status, r.priority, r.assigned_to, r.ai_summary, r.ai_extracted_data,
                        r.created_at, r.updated_at,
                        u.name as requester_name, u.email as requester_email, u.role as requester_role,
                        reviewer.name as assigned_to_name
                 FROM requests r
                 JOIN users u ON r.requester_id = u.id
                 LEFT JOIN users reviewer ON r.assigned_to = reviewer.id
                 WHERE r.department_id = ?`;
    const params = [departmentId];

    if (onlyMine === 'true' && req.user?.id) {
      query += ` AND r.requester_id = ?`;
      params.push(req.user.id);
    }

    if (search) {
      query += ` AND (r.title LIKE ? OR r.description LIKE ? OR u.name LIKE ?)`;
      const searchWild = `%${search.trim()}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (type && type !== 'all') {
      query += ` AND r.type = ?`;
      params.push(type);
    }

    if (status && status !== 'all') {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (priority && priority !== 'all') {
      query += ` AND r.priority = ?`;
      params.push(priority);
    }

    query += ` ORDER BY r.created_at DESC`;

    const [requests] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: {
        requests,
        total: requests.length
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/requests/stats
 */
export async function getRequestStats(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;

    const [[stats]] = await pool.query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
         SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
         SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
         SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned,
         SUM(CASE WHEN type = 'purchase' THEN 1 ELSE 0 END) as purchase_count,
         SUM(CASE WHEN type = 'leave' THEN 1 ELSE 0 END) as leave_count,
         SUM(CASE WHEN type = 'maintenance' THEN 1 ELSE 0 END) as maintenance_count,
         SUM(CASE WHEN type = 'general' THEN 1 ELSE 0 END) as general_count
       FROM requests
       WHERE department_id = ?`,
      [departmentId]
    );

    res.status(200).json({
      success: true,
      data: {
        total: stats.total || 0,
        pending: stats.pending || 0,
        underReview: stats.under_review || 0,
        approved: stats.approved || 0,
        rejected: stats.rejected || 0,
        returned: stats.returned || 0,
        types: {
          purchase: stats.purchase_count || 0,
          leave: stats.leave_count || 0,
          maintenance: stats.maintenance_count || 0,
          general: stats.general_count || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/requests/:id
 * Retrieve request detail with full history timeline and comments
 */
export async function getRequestById(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;

    const [requests] = await pool.query(
      `SELECT r.*,
              u.name as requester_name, u.email as requester_email, u.role as requester_role, u.avatar_url as requester_avatar,
              reviewer.name as assigned_to_name, reviewer.email as assigned_to_email
       FROM requests r
       JOIN users u ON r.requester_id = u.id
       LEFT JOIN users reviewer ON r.assigned_to = reviewer.id
       WHERE r.id = ? AND r.department_id = ?`,
      [id, departmentId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Request not found.' }
      });
    }

    const requestItem = requests[0];

    // Fetch history
    const [history] = await pool.query(
      `SELECT h.*, u.name as changed_by_name, u.role as changed_by_role
       FROM request_history h
       JOIN users u ON h.changed_by = u.id
       WHERE h.request_id = ?
       ORDER BY h.created_at ASC`,
      [id]
    );

    // Fetch comments
    const [comments] = await pool.query(
      `SELECT c.*, u.name as user_name, u.role as user_role, u.avatar_url as user_avatar
       FROM request_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.request_id = ?
       ORDER BY c.created_at ASC`,
      [id]
    );

    // Fetch linked expense/inventory if approved purchase
    const [linkedExpenses] = await pool.query(
      `SELECT e.id as expense_id, e.amount, e.category, e.date, e.inventory_id, i.item_name as inventory_item_name
       FROM expenses e
       LEFT JOIN inventory i ON e.inventory_id = i.id
       WHERE e.related_request_id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        request: {
          ...requestItem,
          history,
          comments,
          linkedExpense: linkedExpenses.length > 0 ? linkedExpenses[0] : null
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/requests
 * Submit a new request with automated AI extraction and analysis
 */
export async function createRequest(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const departmentId = req.user?.department_id || 1;
    const requesterId = req.user?.id || 1;
    const { title, description, type, priority, assigned_to } = req.body;

    if (!title || !description) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'Title and description are required.' }
      });
    }

    // Run AI analysis
    const aiAnalysis = await analyzeRequestText(description, title);

    const finalType = type || aiAnalysis.type || 'general';
    const finalPriority = priority || aiAnalysis.priority || 'medium';

    const [result] = await connection.query(
      `INSERT INTO requests (department_id, requester_id, title, description, type, status, priority, assigned_to, ai_summary, ai_extracted_data)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [
        departmentId,
        requesterId,
        title.trim(),
        description.trim(),
        finalType,
        finalPriority,
        assigned_to || null,
        aiAnalysis.ai_summary,
        JSON.stringify(aiAnalysis.ai_extracted_data)
      ]
    );

    const requestId = result.insertId;

    // Log creation in audit history
    await connection.query(
      `INSERT INTO request_history (request_id, changed_by, old_status, new_status, remarks)
       VALUES (?, ?, NULL, 'pending', 'Request submitted by requester')`,
      [requestId, requesterId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully with AI analysis.',
      data: {
        id: requestId,
        ai_summary: aiAnalysis.ai_summary,
        ai_extracted_data: aiAnalysis.ai_extracted_data
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * POST /api/requests/:id/status
 * Reviewer status action (approve, reject, return, under_review) + Connected Purchase Sync
 */
export async function updateRequestStatus(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;
    const changedBy = req.user?.id || 1;
    const { status, remarks, assigned_to, syncPurchase } = req.body;

    if (!status) {
      await connection.rollback();
      return res.status(400).json({ success: false, error: { message: 'New status is required.' } });
    }

    // Lock request
    const [[currentReq]] = await connection.query(
      `SELECT * FROM requests WHERE id = ? AND department_id = ? FOR UPDATE`,
      [id, departmentId]
    );

    if (!currentReq) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: { message: 'Request not found.' } });
    }

    const oldStatus = currentReq.status;

    // 1. Update request status
    await connection.query(
      `UPDATE requests 
       SET status = ?, 
           assigned_to = COALESCE(?, assigned_to),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, assigned_to, id]
    );

    // 2. Insert history audit log
    await connection.query(
      `INSERT INTO request_history (request_id, changed_by, old_status, new_status, remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [id, changedBy, oldStatus, status, remarks || `Status changed from ${oldStatus} to ${status}`]
    );

    // 3. Connected Purchase Workflow:
    // If status changed to 'approved' and type is 'purchase' (or syncPurchase is true)
    let purchaseSyncResult = null;
    if (status === 'approved' && (currentReq.type === 'purchase' || syncPurchase)) {
      let extracted = {};
      try {
        extracted = typeof currentReq.ai_extracted_data === 'string' 
          ? JSON.parse(currentReq.ai_extracted_data) 
          : (currentReq.ai_extracted_data || {});
      } catch (e) {}

      const itemName = extracted.item || currentReq.title.replace(/We need\s*/i, '').slice(0, 50);
      const category = extracted.category || 'Computers';
      const quantity = parseInt(extracted.quantity || 1, 10);
      const estimatedCost = parseFloat(extracted.estimated_cost || 5000);

      // A. Update/Create in inventory
      const invSync = await recordApprovedPurchaseInInventory({
        departmentId,
        itemName,
        category,
        quantity,
        purchaseValue: estimatedCost,
        location: 'Lab B-104 (AI Lab)',
        connection
      });

      // B. Create expense entry
      const today = new Date().toISOString().split('T')[0];
      const [expResult] = await connection.query(
        `INSERT INTO expenses (department_id, category, amount, date, description, related_request_id, inventory_id)
         VALUES (?, 'Equipment Purchase', ?, ?, ?, ?, ?)`,
        [
          departmentId,
          estimatedCost,
          today,
          `Approved Purchase: ${quantity}x ${itemName} (Request #${id})`,
          id,
          invSync.inventoryId || null
        ]
      );

      purchaseSyncResult = {
        inventory: invSync,
        expenseId: expResult.insertId,
        amount: estimatedCost
      };
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: `Request status updated to '${status}'.`,
      data: {
        oldStatus,
        newStatus: status,
        purchaseSync: purchaseSyncResult
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * POST /api/requests/:id/comments
 * Add comment to a request
 */
export async function addRequestComment(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Comment text cannot be empty.' } });
    }

    const [result] = await pool.query(
      `INSERT INTO request_comments (request_id, user_id, comment) VALUES (?, ?, ?)`,
      [id, userId, comment.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/requests/analyze
 * Live AI text analysis helper for instant frontend preview
 */
export async function analyzeRequestEndpoint(req, res, next) {
  try {
    const { text, title } = req.body;
    if (!text && !title) {
      return res.status(400).json({ success: false, error: { message: 'Text or title is required.' } });
    }

    const analysis = await analyzeRequestText(text || '', title || '');
    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
}

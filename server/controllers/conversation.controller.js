import db from '../config/db.js';

/**
 * List all conversations for the authenticated user
 * GET /api/conversations
 */
export async function getConversations(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new conversation
 * POST /api/conversations
 */
export async function createConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const result = await db.query(
      'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
      [userId, title || 'New Conversation']
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific conversation with its messages
 * GET /api/conversations/:id
 */
export async function getConversationById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Strict ownership verification
    const convResult = await db.query(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied.',
      });
    }

    // Fetch messages for this conversation
    const messagesResult = await db.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...convResult.rows[0],
        messages: messagesResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update conversation title
 * PATCH /api/conversations/:id
 */
export async function updateConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title } = req.body;

    // Strict ownership check & update
    const result = await db.query(
      'UPDATE conversations SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [title, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied.',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a conversation
 * DELETE /api/conversations/:id
 */
export async function deleteConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Ownership check & delete
    const result = await db.query(
      'DELETE FROM conversations WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully.',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get messages of a conversation
 * GET /api/conversations/:id/messages
 */
export async function getConversationMessages(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership
    const convResult = await db.query(
      'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied.',
      });
    }

    const messagesResult = await db.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.status(200).json({
      success: true,
      count: messagesResult.rows.length,
      data: messagesResult.rows,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getConversations,
  createConversation,
  getConversationById,
  updateConversation,
  deleteConversation,
  getConversationMessages,
};

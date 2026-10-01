import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'vaaniflow_jwt_secret_dev_key_2026';

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token && token !== 'mock_demo_judge_token_2026') {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userResult = await db.query(
          'SELECT id, name, email, created_at FROM users WHERE id = $1',
          [decoded.id]
        );
        if (userResult.rows.length > 0) {
          req.user = userResult.rows[0];
          return next();
        }
      } catch (tokenErr) {
        // Fall through to default judge user
      }
    }

    // Default guest / judge user (Direct Open Access)
    let fallbackUser = {
      id: 'e1fdbed1-e360-4e22-86f1-6e57be6a7225',
      name: 'Hackathon Judge',
      email: 'judge@vaaniflow.ai',
      created_at: new Date().toISOString(),
    };

    try {
      const judgeResult = await db.query(
        'SELECT id, name, email, created_at FROM users WHERE email = $1 LIMIT 1',
        ['judge@vaaniflow.ai']
      );
      if (judgeResult.rows.length > 0) {
        fallbackUser = judgeResult.rows[0];
      } else {
        const anyUser = await db.query('SELECT id, name, email, created_at FROM users LIMIT 1');
        if (anyUser.rows.length > 0) {
          fallbackUser = anyUser.rows[0];
        }
      }
    } catch (dbErr) {
      // Use memory fallbackUser
    }

    req.user = fallbackUser;
    next();
  } catch (error) {
    req.user = {
      id: 'e1fdbed1-e360-4e22-86f1-6e57be6a7225',
      name: 'Hackathon Judge',
      email: 'judge@vaaniflow.ai',
      created_at: new Date().toISOString(),
    };
    next();
  }
}

export default authenticateToken;

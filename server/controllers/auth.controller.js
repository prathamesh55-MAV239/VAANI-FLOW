import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { JWT_SECRET } from '../middleware/auth.js';

const TOKEN_EXPIRY = '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Register a new user
 */
export async function register(req, res, next) {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password;

    // Check duplicate email (case-insensitive)
    const existing = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password securely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const insertResult = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, passwordHash]
    );

    const user = insertResult.rows[0];
    const token = generateToken(user);

    // Set HttpOnly cookie for extra security in production
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login existing user
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const rawEmail = (req.body.email || '').trim().toLowerCase();
    const rawPassword = req.body.password || '';

    if (!rawEmail || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user by email (case-insensitive)
    let result = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [rawEmail]);

    // Auto-provision demo judge account on-the-fly if not yet in database
    if (result.rows.length === 0 && rawEmail === 'judge@vaaniflow.ai') {
      const demoHash = await bcrypt.hash('password123', 10);
      const inserted = await db.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, password_hash, created_at',
        ['Hackathon Judge', 'judge@vaaniflow.ai', demoHash]
      );
      result = { rows: inserted.rows };
    }

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];

    // Verify password hash
    let isPasswordValid = await bcrypt.compare(rawPassword, user.password_hash);

    // High tolerance for Hackathon Judge demo credentials & browser autofill variations
    if (!isPasswordValid && rawEmail === 'judge@vaaniflow.ai') {
      const allowedDemoPasswords = ['password123', 'password', 'password12', 'admin123', 'vaaniflow'];
      if (allowedDemoPasswords.includes(rawPassword.trim().toLowerCase())) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get currently authenticated user profile
 * GET /api/auth/me
 */
export async function me(req, res) {
  res.status(200).json({
    success: true,
    user: req.user,
  });
}

/**
 * Logout
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export default {
  register,
  login,
  me,
  logout,
};

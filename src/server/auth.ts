import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type { User, UserSession } from '../types/index.js';
import { db } from './db.js';

const SESSION_COOKIE_NAME = 'djed_session';
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Hash password with PBKDF2 (SHA-512, 100,000 iterations, 32-byte salt)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored hash using constant-time comparison
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Set HTTP-only secure cookie for session
 */
export function setSessionCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    path: '/',
  });
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionId?: string;
}

/**
 * Middleware: extracts and verifies session token from cookie or Authorization header
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const session = db.getSessionByToken(token);
  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }

  req.user = session.user;
  req.sessionId = session.id;
  next();
}

/**
 * Middleware: optional authentication (populates req.user if valid token exists)
 */
export function optionalAuthenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (token) {
    const session = db.getSessionByToken(token);
    if (session) {
      req.user = session.user;
      req.sessionId = session.id;
    }
  }
  next();
}

/**
 * Middleware: require admin or moderator role
 */
export function requireRole(allowedRoles: ('admin' | 'moderator')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!allowedRoles.includes(req.user.role as 'admin' | 'moderator')) {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
      return;
    }
    next();
  };
}

/**
 * Simple in-memory sliding window rate limiter
 */
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);
    if (!record || record.expiresAt < now) {
      rateLimitMap.set(key, { count: 1, expiresAt: now + windowMs });
      next();
      return;
    }

    if (record.count >= limit) {
      res.status(429).json({
        error: 'Too many requests. Please wait a moment before trying again.',
        retryAfterMs: record.expiresAt - now,
      });
      return;
    }

    record.count += 1;
    next();
  };
}

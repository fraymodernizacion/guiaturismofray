import type { Request, Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';
import { isPostgresConfigured } from '../db/index.ts';
import { getOrCreateUser } from '../db/users.ts';

export const AUTHORIZED_ADMIN_EMAILS = new Set([
  'prensafray@gmail.com',
  'turismofray@gmail.com',
  'prensafraymarmerto@gmail.com',
  'turismo@fraymarmertoesquiu.gob.ar',
  'admin@fraymarmertoesquiu.gob.ar',
]);

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  adminEmail?: string;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.slice(7).trim();
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    if (decodedToken.email && isPostgresConfigured()) {
      const role = AUTHORIZED_ADMIN_EMAILS.has(decodedToken.email.toLowerCase())
        ? 'superadmin'
        : 'viewer';
      try {
        await getOrCreateUser(
          decodedToken.uid,
          decodedToken.email,
          decodedToken.name || null,
          role
        );
      } catch (dbErr) {
        console.warn('[AUTH] Failed to sync user to Cloud SQL:', dbErr);
      }
    }

    return next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export function createRequireAdminAuth(
  verifyLegacySessionToken: (req: Request) => { email: string } | null
) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acceso restringido a administradores.' });
    }

    const token = authHeader.slice(7).trim();

    // 1. Primary path: Verify Firebase Auth ID Token
    if (token.split('.').length === 3) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const email = (decodedToken.email || '').trim().toLowerCase();
        if (!email || !AUTHORIZED_ADMIN_EMAILS.has(email)) {
          return res.status(403).json({ error: 'Tu cuenta no tiene permisos de administración.' });
        }
        req.user = decodedToken;
        req.adminEmail = email;

        if (isPostgresConfigured()) {
          try {
            await getOrCreateUser(
              decodedToken.uid,
              email,
              decodedToken.name || null,
              'superadmin'
            );
          } catch (dbErr) {
            console.warn('[AUTH] Failed to sync admin user to Cloud SQL:', dbErr);
          }
        }
        return next();
      } catch (firebaseErr) {
        console.error('Error verifying Firebase ID token:', firebaseErr);
        return res.status(401).json({ error: 'Sesión expirada o inválida. Volvé a iniciar sesión.' });
      }
    }

    // 2. Fallback path: Verify server-signed HMAC municipal session token
    const sessionAdmin = verifyLegacySessionToken(req);
    if (sessionAdmin) {
      req.adminEmail = sessionAdmin.email;
      return next();
    }

    return res.status(401).json({ error: 'Acceso restringido a administradores.' });
  };
}

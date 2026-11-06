
import jwt from 'jsonwebtoken';
import { prisma } from './db.js';

const ADMIN_COOKIE = 'becc_admin_token';
const STUDENT_COOKIE = 'becc_student_token';
const ISSUER = 'becc-api';

const isProduction = process.env.NODE_ENV === 'production';

const adminCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
  maxAge: 8 * 60 * 60 * 1000
});

const studentCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000
});

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters.');
  }

  return secret;
}

export function createAdminSession(res, admin) {
  const token = jwt.sign(
    { sub: admin.id, role: 'ADMIN' },
    getSecret(),
    {
      expiresIn: '8h',
      issuer: ISSUER,
      audience: 'becc-admin',
      algorithm: 'HS256'
    }
  );

  res.cookie(ADMIN_COOKIE, token, adminCookieOptions());
}

export function createStudentSession(res, student) {
  const token = jwt.sign(
    { sub: student.id, role: 'STUDENT' },
    getSecret(),
    {
      expiresIn: '30d',
      issuer: ISSUER,
      audience: 'becc-student',
      algorithm: 'HS256'
    }
  );

  res.cookie(STUDENT_COOKIE, token, studentCookieOptions());
}

const clearCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/'
});

export function clearAdminSession(res) {
  res.clearCookie(ADMIN_COOKIE, clearCookieOptions());
}

export function clearStudentSession(res) {
  res.clearCookie(STUDENT_COOKIE, clearCookieOptions());
}

function verifyCookie(req, cookieName, audience, role) {
  const token = req.cookies?.[cookieName];

  if (!token) return null;

  const payload = jwt.verify(token, getSecret(), {
    issuer: ISSUER,
    audience,
    algorithms: ['HS256']
  });

  if (
    payload.role !== role ||
    typeof payload.sub !== 'string'
  ) {
    return null;
  }

  return payload;
}

export async function requireAdmin(req, res, next) {
  try {
    if (req.get('X-BECC-Request') !== '1') {
      return res.status(403).json({
        error: 'Request validation failed.'
      });
    }

    const payload = verifyCookie(
      req,
      ADMIN_COOKIE,
      'becc-admin',
      'ADMIN'
    );

    if (!payload) {
      return res.status(401).json({
        error: 'Admin authentication required.'
      });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.sub }
    });

    if (!admin || !admin.active || admin.role !== 'ADMIN') {
      return res.status(401).json({
        error: 'Admin account is unavailable.'
      });
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    };

    return next();

  } catch {
    return res.status(401).json({
      error: 'Admin session expired. Please sign in again.'
    });
  }
}

export async function requireStudent(req, res, next) {
  try {
    if (req.get('X-BECC-Request') !== '1') {
      return res.status(403).json({
        error: 'Request validation failed.'
      });
    }

    const payload = verifyCookie(
      req,
      STUDENT_COOKIE,
      'becc-student',
      'STUDENT'
    );

    if (!payload) {
      return res.status(401).json({
        error: 'Student sign-in required.'
      });
    }

    const student = await prisma.studentUser.findUnique({
      where: { id: payload.sub }
    });

    if (!student || !student.active) {
      return res.status(401).json({
        error: 'Student account is unavailable.'
      });
    }

    req.student = {
      id: student.id,
      email: student.email,
      name: student.name,
      phone: student.phone
    };

    return next();

  } catch {
    return res.status(401).json({
      error: 'Student session expired. Please sign in again.'
    });
  }
}

export async function optionalStudent(req, _res, next) {
  try {
    const payload = verifyCookie(
      req,
      STUDENT_COOKIE,
      'becc-student',
      'STUDENT'
    );

    if (payload) {
      const student = await prisma.studentUser.findUnique({
        where: { id: payload.sub }
      });

      if (student?.active) {
        req.student = {
          id: student.id,
          email: student.email,
          name: student.name,
          phone: student.phone
        };
      }
    }

  } catch {
    // Anonymous practice is allowed.
  }

  next();
}

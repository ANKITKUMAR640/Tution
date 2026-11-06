import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { prisma } from './db.js';
import {
  createAdminSession, clearAdminSession, createStudentSession, clearStudentSession,
  requireAdmin, requireStudent, optionalStudent
} from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const uploadDir = path.join(rootDir, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const PORT = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',').map(value => value.trim()).filter(Boolean);
const allowedKeys = new Set([
  'admissions', 'courses', 'notices', 'faculty', 'messages',
  'practice_questions', 'practice_sets', 'practice_attempts', 'content_home',
  'content_about', 'content_courses', 'content_faculty', 'content_results',
  'content_contact', 'content_testimonials', 'settings', 'results'
]);
const publicKeys = [
  'courses', 'notices', 'faculty', 'practice_questions',
  'practice_sets', 'content_home', 'content_about', 'content_courses',
  'content_faculty', 'content_results', 'content_contact',
  'content_testimonials', 'settings', 'results'
];

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET is missing or too short. Set a random secret of at least 32 characters in backend/.env.');
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('This website origin is not allowed to access the BECC API.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-BECC-Request']
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir, {
  maxAge: '7d',
  setHeaders(res) { res.setHeader('X-Content-Type-Options', 'nosniff'); }
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again after 15 minutes.' }
});
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' }
});

function cleanText(value, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
function validEmail(value) { return /^\S+@\S+\.\S+$/.test(value); }
function validPhone(value) { return /^\d{10}$/.test(value); }
function publicStudent(student) {
  return { id: student.id, name: student.name, email: student.email, phone: student.phone };
}
async function getBucket(key, fallback = []) {
  const row = await prisma.contentBucket.findUnique({ where: { key } });
  return row ? row.data : fallback;
}
async function saveBucket(key, data) {
  return prisma.contentBucket.upsert({ where: { key }, create: { key, data }, update: { data } });
}

app.get('/api/health', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: 'BECC API', database: 'connected' });
  } catch (error) { next(error); }
});

// Administrator authentication
app.post('/api/auth/login', loginLimiter, async (req, res, next) => {
  try {
    const email = cleanText(req.body?.email, 254).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!validEmail(email) || !password) return res.status(400).json({ error: 'Enter a valid admin email and password.' });
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.active || admin.role !== 'ADMIN' || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ error: 'Admin email or password is incorrect.' });
    }
    createAdminSession(res, admin);
    return res.json({ admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
  } catch (error) { next(error); }
});
app.get('/api/auth/me', requireAdmin, (req, res) => res.json({ admin: req.admin }));
app.post('/api/auth/logout', (_req, res) => { clearAdminSession(res); res.json({ ok: true }); });

// Student authentication and self-service
app.post('/api/auth/student/register', loginLimiter, async (req, res, next) => {
  try {
    const name = cleanText(req.body?.name, 100);
    const phone = cleanText(req.body?.phone, 10);
    const email = cleanText(req.body?.email, 254).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!name || !validPhone(phone) || !validEmail(email) || password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: 'Enter your name, valid 10-digit phone, valid email and a password of 8–128 characters.' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const student = await prisma.studentUser.create({ data: { name, phone, email, passwordHash } });
    createStudentSession(res, student);
    return res.status(201).json({ user: publicStudent(student) });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'An account with this email already exists.' });
    next(error);
  }
});
app.post('/api/auth/student/login', loginLimiter, async (req, res, next) => {
  try {
    const email = cleanText(req.body?.email, 254).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!validEmail(email) || !password) return res.status(400).json({ error: 'Enter your email and password.' });
    const student = await prisma.studentUser.findUnique({ where: { email } });
    if (!student || !student.active || !(await bcrypt.compare(password, student.passwordHash))) {
      return res.status(401).json({ error: 'Student email or password is incorrect.' });
    }
    createStudentSession(res, student);
    return res.json({ user: publicStudent(student) });
  } catch (error) { next(error); }
});
app.get('/api/auth/student/me', requireStudent, (req, res) => res.json({ user: req.student }));
app.get('/api/auth/student/attempts', requireStudent, async (req, res, next) => {
  try {
    const rows = await prisma.practiceAttempt.findMany({ where: { userId: req.student.id }, orderBy: { completedAt: 'desc' }, take: 200 });
    res.json({ attempts: rows.map(row => row.data) });
  } catch (error) { next(error); }
});
app.post('/api/auth/student/logout', (_req, res) => { clearStudentSession(res); res.json({ ok: true }); });

// Public website data
app.get('/api/public/bootstrap', async (_req, res, next) => {
  try {
    const rows = await prisma.contentBucket.findMany({ where: { key: { in: publicKeys } } });
    const data = Object.fromEntries(rows.map(row => [row.key, row.data]));
    for (const key of ['courses', 'notices', 'faculty', 'results', 'content_home', 'content_about', 'content_courses', 'content_faculty', 'content_results', 'content_contact', 'content_testimonials']) {
      if (Array.isArray(data[key])) data[key] = data[key].filter(item => item?.published !== false);
    }
    if (Array.isArray(data.practice_sets)) {
      data.practice_sets = data.practice_sets.filter(item => item?.published !== false);
      const ids = new Set(data.practice_sets.flatMap(item => item.questionIds || []));
      data.practice_questions = (data.practice_questions || []).filter(question => ids.has(question.id));
    }
    res.json({ data });
  } catch (error) { next(error); }
});
app.get('/api/public/practice', async (_req, res, next) => {
  try {
    const sets = (await getBucket('practice_sets')).filter(item => item?.published !== false);
    const ids = new Set(sets.flatMap(item => item.questionIds || []));
    const questions = (await getBucket('practice_questions')).filter(question => ids.has(question.id));
    res.json({ questions, sets });
  } catch (error) { next(error); }
});
app.get('/api/public/results', async (_req, res, next) => {
  try { res.json({ results: (await getBucket('results')).filter(item => item?.published !== false) }); }
  catch (error) { next(error); }
});

// Public forms
app.post('/api/public/admissions', formLimiter, async (req, res, next) => {
  try {
    const studentName = cleanText(req.body?.studentName, 100);
    const fatherName = cleanText(req.body?.fatherName, 100);
    const mobile = cleanText(String(req.body?.mobile || ''), 10);
    const className = cleanText(req.body?.className, 80);
    if (!studentName || !fatherName || !validPhone(mobile) || !className) {
      return res.status(400).json({ error: 'Please provide valid admission details.' });
    }
    const items = await getBucket('admissions');
    const item = { id: randomUUID(), studentName, fatherName, mobile, className, status: 'New', createdAt: new Date().toISOString() };
    await saveBucket('admissions', [item, ...items]);
    res.status(201).json({ item });
  } catch (error) { next(error); }
});
app.post('/api/public/messages', formLimiter, async (req, res, next) => {
  try {
    const name = cleanText(req.body?.name, 100);
    const mobile = cleanText(String(req.body?.mobile || ''), 10);
    const message = cleanText(req.body?.message, 3000);
    if (!name || !validPhone(mobile) || !message) {
      return res.status(400).json({ error: 'Please provide your name, valid mobile number and message.' });
    }
    const items = await getBucket('messages');
    const item = { id: randomUUID(), name, mobile, message, createdAt: new Date().toISOString() };
    await saveBucket('messages', [item, ...items]);
    res.status(201).json({ item });
  } catch (error) { next(error); }
});
app.post('/api/public/practice-attempts', optionalStudent, async (req, res, next) => {
  try {
    const data = req.body || {};
    const setTitle = cleanText(data.setTitle, 160);
    if (!data.id || !setTitle || !Number.isFinite(Number(data.accuracy)) || !Number.isFinite(Number(data.score))) {
      return res.status(400).json({ error: 'Practice attempt data is incomplete or invalid.' });
    }
    const attempt = {
      ...data,
      id: cleanText(String(data.id), 100),
      setTitle,
      user: req.student?.email || 'guest',
      completedAt: data.completedAt ? new Date(data.completedAt).toISOString() : new Date().toISOString()
    };
    await prisma.practiceAttempt.create({ data: {
      id: attempt.id,
      userId: req.student?.id || null,
      userEmail: req.student?.email || 'guest',
      setTitle,
      data: attempt,
      completedAt: new Date(attempt.completedAt)
    } });
    const current = await getBucket('practice_attempts');
    await saveBucket('practice_attempts', [attempt, ...current.filter(item => item.id !== attempt.id)]);
    res.status(201).json({ attempt });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'This practice attempt has already been submitted.' });
    next(error);
  }
});

// Protected admin workspace
app.get('/api/admin/bootstrap', requireAdmin, async (_req, res, next) => {
  try {
    const rows = await prisma.contentBucket.findMany({ where: { key: { in: [...allowedKeys] } } });
    res.json({ data: Object.fromEntries(rows.map(row => [row.key, row.data])) });
  } catch (error) { next(error); }
});
app.get('/api/admin/content/:key', requireAdmin, async (req, res, next) => {
  try {
    const key = req.params.key;
    if (!allowedKeys.has(key)) return res.status(404).json({ error: 'Unknown content section.' });
    res.json({ data: await getBucket(key) });
  } catch (error) { next(error); }
});
app.put('/api/admin/content/:key', requireAdmin, async (req, res, next) => {
  try {
    const key = req.params.key;
    const data = req.body?.data;
    if (!allowedKeys.has(key)) return res.status(404).json({ error: 'Unknown content section.' });
    if (!Array.isArray(data) && (data === null || typeof data !== 'object')) {
      return res.status(400).json({ error: 'Content data must be a JSON array or object.' });
    }
    await saveBucket(key, data);
    res.json({ data });
  } catch (error) { next(error); }
});
app.get('/api/admin/attempts', requireAdmin, async (_req, res, next) => {
  try {
    const rows = await prisma.practiceAttempt.findMany({ orderBy: { completedAt: 'desc' }, take: 500 });
    res.json({ attempts: rows.map(row => row.data) });
  } catch (error) { next(error); }
});

const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase().slice(0, 10);
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, allowedMime.has(file.mimetype))
});
app.post('/api/admin/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a JPG, PNG, WEBP, GIF or PDF file (maximum 8 MB).' });
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    name: path.basename(req.file.originalname),
    mimeType: req.file.mimetype,
    size: req.file.size
  });
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'File is too large. Maximum size is 8 MB.' : 'The uploaded file could not be processed.';
    return res.status(400).json({ error: message });
  }
  if (error.message?.includes('origin is not allowed')) return res.status(403).json({ error: 'This website origin is not allowed.' });
  if (error.code === 'P2002') return res.status(409).json({ error: 'A record with these details already exists.' });
  console.error('[BECC API]', error);
  const status = Number(error.status) >= 400 && Number(error.status) < 600 ? Number(error.status) : 500;
  res.status(status).json({ error: process.env.NODE_ENV === 'production' ? 'The server could not complete this request.' : (error.message || 'Server error.') });
});

const server = app.listen(PORT, () => console.log(`BECC API listening at http://localhost:${PORT}`));
async function shutdown(signal) {
  console.log(`${signal} received. Closing BECC API...`);
  server.close(async () => { await prisma.$disconnect(); process.exit(0); });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

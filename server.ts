import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_PORTFOLIO } from './src/data/defaultPortfolio.ts';
import type { ContactMessage, PortfolioData } from './src/types/portfolio.ts';
import { buildResumePdfBuffer } from './server/pdfGenerator.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const PORTFOLIO_FILE = path.resolve(DATA_DIR, 'portfolio.json');
const MESSAGES_FILE = path.resolve(DATA_DIR, 'messages.json');
const AUTH_FILE = path.resolve(DATA_DIR, 'auth.json');
const DEFAULT_RESUME_FILENAME = 'Ankur_Mishra_Professional_Resume.pdf';

const SESSION_COOKIE = 'am_admin_session';
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  crypto.createHash('sha256').update(path.resolve(__dirname)).digest('hex');

interface AuthRecord {
  salt: string;
  hash: string;
  updatedAt: string;
}

function ensureDirectoriesAndSeeds(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  if (!fs.existsSync(PORTFOLIO_FILE)) {
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(DEFAULT_PORTFOLIO, null, 2), 'utf8');
  }

  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2), 'utf8');
  }

  const defaultResumePath = path.resolve(UPLOADS_DIR, DEFAULT_RESUME_FILENAME);
  if (!fs.existsSync(defaultResumePath)) {
    const pdfBuf = buildResumePdfBuffer(DEFAULT_PORTFOLIO);
    fs.writeFileSync(defaultResumePath, pdfBuf);
  }

  if (!fs.existsSync(AUTH_FILE)) {
    const initialPassword = process.env.ADMIN_PASSWORD || 'IIMU2026@Ankur';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(initialPassword, salt, 64).toString('hex');
    const record: AuthRecord = {
      salt,
      hash,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(AUTH_FILE, JSON.stringify(record, null, 2), 'utf8');
  }
}

function readPortfolio(): PortfolioData {
  try {
    const raw = fs.readFileSync(PORTFOLIO_FILE, 'utf8');
    return JSON.parse(raw) as PortfolioData;
  } catch {
    return DEFAULT_PORTFOLIO;
  }
}

function writePortfolio(data: PortfolioData): void {
  const payload: PortfolioData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

function readMessages(): ContactMessage[] {
  try {
    const raw = fs.readFileSync(MESSAGES_FILE, 'utf8');
    return JSON.parse(raw) as ContactMessage[];
  } catch {
    return [];
  }
}

function writeMessages(messages: ContactMessage[]): void {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
}

function verifyPassword(password: string): boolean {
  try {
    const raw = fs.readFileSync(AUTH_FILE, 'utf8');
    const record = JSON.parse(raw) as AuthRecord;
    const derived = crypto.scryptSync(password, record.salt, 64);
    const stored = Buffer.from(record.hash, 'hex');
    if (derived.length !== stored.length) return false;
    return crypto.timingSafeEqual(derived, stored);
  } catch {
    return false;
  }
}

function updatePassword(newPassword: string): void {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(newPassword, salt, 64).toString('hex');
  const record: AuthRecord = {
    salt,
    hash,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(record, null, 2), 'utf8');
}

function createSessionToken(): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  }
  return out;
}

function isAuthenticatedRequest(req: express.Request): boolean {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: number;
    };
    return typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'Unauthorized. Please sign in to the Admin Dashboard.' });
    return;
  }
  next();
}

function sanitizeFilename(input: string): string {
  const base = path.basename(input).replace(/[^a-zA-Z0-9._-]/g, '_');
  return base || `file_${Date.now()}`;
}

async function startServer(): Promise<void> {
  ensureDirectoriesAndSeeds();

  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Public Portfolio API
  app.get('/api/portfolio', (_req, res) => {
    res.json(readPortfolio());
  });

  // Resume Download / Preview
  app.get('/api/resume/download', (req, res) => {
    const portfolio = readPortfolio();
    const candidateName = sanitizeFilename(
      portfolio.contact.resumeOriginalName || DEFAULT_RESUME_FILENAME
    );
    let targetPath = path.resolve(UPLOADS_DIR, candidateName);
    if (!fs.existsSync(targetPath)) {
      targetPath = path.resolve(UPLOADS_DIR, DEFAULT_RESUME_FILENAME);
    }
    if (!fs.existsSync(targetPath)) {
      fs.writeFileSync(targetPath, buildResumePdfBuffer(portfolio));
    }

    const downloadName = sanitizeFilename(
      portfolio.contact.resumeDownloadName || 'Ankur_Mishra_Resume.pdf'
    );
    const isPreview = req.query.preview === '1';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${isPreview ? 'inline' : 'attachment'}; filename="${downloadName}"`
    );
    res.sendFile(targetPath);
  });

  // Serve uploaded files (certificates, photos, custom resumes)
  app.get('/api/files/:filename', (req, res) => {
    const safeName = sanitizeFilename(req.params.filename);
    const filePath = path.resolve(UPLOADS_DIR, safeName);
    if (!filePath.startsWith(UPLOADS_DIR) || !fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    res.sendFile(filePath);
  });

  // Public Contact Form Submission
  app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body as Partial<ContactMessage>;
    if (
      !name?.trim() ||
      !email?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      res.status(400).json({
        error: 'Please fill in your name, a valid email address, subject, and message.',
      });
      return;
    }

    const messages = readMessages();
    const newEntry: ContactMessage = {
      id: `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      name: name.trim().slice(0, 120),
      email: email.trim().slice(0, 160),
      subject: subject.trim().slice(0, 200),
      message: message.trim().slice(0, 4000),
      createdAt: new Date().toISOString(),
    };
    messages.unshift(newEntry);
    writeMessages(messages);

    res.status(201).json({
      ok: true,
      id: newEntry.id,
      message: 'Thank you for reaching out. Your message has been delivered to Ankur Mishra.',
    });
  });

  // Admin Session & Auth Routes
  app.get('/api/admin/session', (req, res) => {
    res.json({ authenticated: isAuthenticatedRequest(req) });
  });

  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body as { password?: string };
    if (!password || !verifyPassword(password)) {
      res.status(401).json({ error: 'Invalid admin password. Please try again.' });
      return;
    }

    const token = createSessionToken();
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({ authenticated: true });
  });

  app.post('/api/admin/logout', (_req, res) => {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ ok: true });
  });

  app.post('/api/admin/change-password', requireAdmin, (req, res) => {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !verifyPassword(currentPassword)) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }
    if (!newPassword || newPassword.trim().length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }
    updatePassword(newPassword.trim());
    res.json({ ok: true, message: 'Admin password updated successfully.' });
  });

  // Admin Portfolio Publish Route
  app.put('/api/admin/portfolio', requireAdmin, (req, res) => {
    const incoming = req.body as PortfolioData;
    if (!incoming || !incoming.profile || !incoming.contact) {
      res.status(400).json({ error: 'Invalid portfolio payload.' });
      return;
    }
    writePortfolio(incoming);
    res.json({ ok: true, portfolio: readPortfolio() });
  });

  // Admin File Upload Route (Profile Photo, Resume PDF, Certificate PDF/Image)
  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    const { filename, mimeType, dataBase64, kind } = req.body as {
      filename?: string;
      mimeType?: string;
      dataBase64?: string;
      kind?: 'avatar' | 'resume' | 'certificate';
    };

    if (!filename || !dataBase64 || !kind) {
      res.status(400).json({ error: 'Missing file payload.' });
      return;
    }

    const allowedImage = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedPdf = ['application/pdf'];
    const isPdf = allowedPdf.includes(mimeType || '') || filename.toLowerCase().endsWith('.pdf');
    const isImg = allowedImage.includes(mimeType || '');

    if (kind === 'resume' && !isPdf) {
      res.status(400).json({ error: 'Resume must be a valid PDF file.' });
      return;
    }
    if (kind === 'avatar' && !isImg) {
      res.status(400).json({ error: 'Profile photograph must be a JPG, PNG, or WEBP image.' });
      return;
    }
    if (kind === 'certificate' && !isPdf && !isImg) {
      res.status(400).json({ error: 'Certificate must be a PDF, JPG, PNG, or WEBP file.' });
      return;
    }

    const rawBase64 = dataBase64.includes(',') ? dataBase64.split(',')[1] : dataBase64;
    const buffer = Buffer.from(rawBase64, 'base64');
    if (buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'File exceeds 10 MB maximum upload size.' });
      return;
    }

    const ext = path.extname(filename) || (isPdf ? '.pdf' : '.png');
    const cleanBase = sanitizeFilename(path.basename(filename, ext));
    const storedName = `${kind}_${cleanBase}_${Date.now()}${ext.toLowerCase()}`;
    const targetPath = path.resolve(UPLOADS_DIR, storedName);
    fs.writeFileSync(targetPath, buffer);

    if (kind === 'resume') {
      const current = readPortfolio();
      current.contact.resumeOriginalName = storedName;
      current.contact.resumeUpdatedAt = new Date().toISOString().slice(0, 10);
      writePortfolio(current);
      res.json({
        ok: true,
        fileUrl: '/api/resume/download',
        storedName,
        originalName: filename,
        mimeType: 'application/pdf',
      });
      return;
    }

    res.json({
      ok: true,
      fileUrl: `/api/files/${storedName}`,
      storedName,
      originalName: filename,
      mimeType: mimeType || (isPdf ? 'application/pdf' : 'image/png'),
    });
  });

  // Admin Contact Inbox
  app.get('/api/admin/messages', requireAdmin, (_req, res) => {
    res.json(readMessages());
  });

  app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
    const messages = readMessages().filter((m) => m.id !== req.params.id);
    writeMessages(messages);
    res.json({ ok: true });
  });

  // Vite / Static Frontend
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ankur Mishra Portfolio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

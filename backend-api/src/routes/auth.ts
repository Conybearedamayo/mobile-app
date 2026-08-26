import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { sendOtpEmail } from '../services/emailService';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jucoch_secret_key_2026';

// Helper function to generate 6-digit OTP
const generate6DigitCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/send-otp
router.post('/send-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }

    const trimmedEmail = email.trim();
    const otpCode = generate6DigitCode();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find existing user or create temporary pending user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: trimmedEmail }, { alias: trimmedEmail }],
      },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode, otpExpiresAt },
      });
      sendOtpEmail(user.email, otpCode, user.alias).catch((e) => console.error('OTP email error:', e));
    } else {
      // Send OTP for email verification during register
      sendOtpEmail(trimmedEmail, otpCode, trimmedEmail.split('@')[0] || 'User').catch((e) => console.error('OTP email error:', e));
    }

    res.json({
      message: 'Verification code sent to your email account.',
      email: trimmedEmail,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ error: 'Failed to send verification code.' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ error: 'Email and verification code are required.' });
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: trimmedEmail }, { alias: trimmedEmail }],
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    const isDbCodeValid = user.otpCode && user.otpCode === trimmedCode;

    if (!isDbCodeValid) {
      res.status(400).json({ error: 'Invalid verification code. Please check your email inbox.' });
      return;
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      return;
    }

    // Mark as verified and clear OTP
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: updatedUser.id, alias: updatedUser.alias, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Verification successful!',
      token,
      user: {
        id: updatedUser.id,
        alias: updatedUser.alias,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: 'Failed to verify code.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { alias, email, password, role } = req.body;

    if (!alias || !alias.trim() || !email || !email.trim() || !password || !password.trim()) {
      res.status(400).json({ error: 'Alias, email, and password are required and cannot be empty or contain only spaces.' });
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedAlias = alias.trim();

    // Check if email or alias exists
    const existingEmail = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existingEmail) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }

    const existingAlias = await prisma.user.findUnique({ where: { alias: trimmedAlias } });
    if (existingAlias) {
      res.status(400).json({ error: 'This alias is already taken. Please choose another.' });
      return;
    }

    // Hash password & generate initial OTP
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = generate6DigitCode();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Restrict Admin role creation via public registration
    let assignedRole = role || 'Individual';
    if (assignedRole === 'Admin') {
      assignedRole = 'Individual';
    }

    const newUser = await prisma.user.create({
      data: {
        alias: trimmedAlias,
        email: trimmedEmail,
        password: hashedPassword,
        role: assignedRole,
        otpCode,
        otpExpiresAt,
        isVerified: false,
      },
    });

    // Send verification code asynchronously in background
    sendOtpEmail(newUser.email, otpCode, newUser.alias).catch((e) => console.error('Registration email error:', e));

    res.status(201).json({
      message: 'Account created! A 6-digit verification code was sent to your email.',
      requiresOtp: true,
      email: newUser.email,
      alias: newUser.alias,
      userId: newUser.id,
      role: newUser.role,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, requireOtp } = req.body;

    if (!email || !email.trim() || !password || !password.trim()) {
      res.status(400).json({ error: 'Email and password are required and cannot be empty or contain only spaces.' });
      return;
    }

    const trimmedIdentifier = email.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: trimmedIdentifier }, { alias: trimmedIdentifier }],
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. User not found.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
      return;
    }

    // Role Mismatch Validation: ensure selected role matches registered account role
    if (role && typeof role === 'string' && role.trim() && user.role !== 'Admin') {
      const selectedRole = role.trim();
      if (selectedRole.toLowerCase() !== user.role.toLowerCase()) {
        res.status(400).json({
          error: `Account Role Mismatch: This account is registered as a "${user.role}". Please select "${user.role}" on the login screen.`
        });
        return;
      }
    }

    // Automatic Role Detection from Neon PostgreSQL Database
    const activeRole = user.role;

    // Send OTP email code on login
    const otpCode = generate6DigitCode();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt },
    });

    sendOtpEmail(user.email, otpCode, user.alias).catch((e) => console.error('Login email error:', e));

    res.json({
      message: 'Login successful! Verification code sent to your email.',
      requiresOtp: true,
      email: user.email,
      alias: user.alias,
      role: activeRole,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header missing or invalid.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Token missing.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        alias: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

// POST /api/auth/reset-password - Real database password update
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !newPassword || newPassword.trim().length < 4) {
      res.status(400).json({ error: 'Email and valid new password (at least 4 chars) are required.' });
      return;
    }

    const trimmedEmail = email.trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: trimmedEmail }, { alias: trimmedEmail }],
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Account not found for this email address.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    console.log(`====================================================`);
    console.log(`🔑 Password successfully updated for: ${user.email}`);
    console.log(`====================================================`);

    res.json({ message: 'Password successfully updated! You can now log in with your new password.' });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Failed to reset password in database.' });
  }
});

// GET /api/auth/smtp-status - Live Render diagnostic check
router.get('/smtp-status', async (req: Request, res: Response): Promise<void> => {
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!smtpUser || !smtpPass) {
    res.json({
      configured: false,
      message: 'SMTP credentials missing in Render Environment Variables. Please add SMTP_USER and SMTP_PASS.',
      hasUser: !!smtpUser,
      hasPass: !!smtpPass,
    });
    return;
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass.replace(/\s+/g, ''),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();
    res.json({
      configured: true,
      sender: smtpUser,
      status: 'AUTHENTICATED_OK',
      message: 'Gmail SMTP is fully configured and operational on Render!',
    });
  } catch (err: any) {
    res.json({
      configured: true,
      sender: smtpUser,
      status: 'AUTHENTICATION_FAILED',
      error: err?.message || err,
    });
  }
});

export default router;

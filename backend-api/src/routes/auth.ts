import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { sendOtpEmail } from '../services/emailService';
import {
  runTransaction,
  TransactionError,
  handleRouteError,
} from '../utils/transaction';

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

    if (!email || !String(email).trim()) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }

    const trimmedEmail = String(email).trim();
    const otpCode = generate6DigitCode();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // TRANSACTION: Atomically find user and persist OTP code + expiration
    const targetUser = await runTransaction('auth.sendOtp', async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          OR: [{ email: trimmedEmail }, { alias: trimmedEmail }],
        },
      });

      if (user) {
        return await tx.user.update({
          where: { id: user.id },
          data: { otpCode, otpExpiresAt },
          select: { id: true, email: true, alias: true },
        });
      }

      return null;
    });

    // Send OTP email AFTER database COMMIT
    if (targetUser) {
      sendOtpEmail(targetUser.email, otpCode, targetUser.alias).catch((e) =>
        console.error('OTP email error:', e)
      );
    } else {
      sendOtpEmail(trimmedEmail, otpCode, trimmedEmail.split('@')[0] || 'User').catch((e) =>
        console.error('OTP email error:', e)
      );
    }

    res.json({
      message: 'Verification code sent to your email account.',
      email: trimmedEmail,
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to send verification code.', 'Send OTP Error');
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

    const trimmedEmail = String(email).trim();
    const trimmedCode = String(code).trim();

    // TRANSACTION: Atomically verify OTP, check expiration, mark user verified, and consume OTP
    const updatedUser = await runTransaction('auth.verifyOtp', async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          OR: [{ email: trimmedEmail }, { alias: trimmedEmail }],
        },
      });

      if (!user) {
        throw new TransactionError(404, 'User account not found.');
      }

      const isDbCodeValid = user.otpCode && user.otpCode === trimmedCode;
      if (!isDbCodeValid) {
        throw new TransactionError(
          400,
          'Invalid verification code. Please check your email inbox.'
        );
      }

      if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
        throw new TransactionError(
          400,
          'Verification code has expired. Please request a new code.'
        );
      }

      // Mark as verified and clear OTP inside the same transaction (prevents reuse)
      return await tx.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          otpCode: null,
          otpExpiresAt: null,
        },
      });
    });

    // Generate JWT token after transaction COMMIT
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
    handleRouteError(res, error, 'Failed to verify code.', 'Verify OTP Error');
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { alias, email, password, role } = req.body;

    if (!alias || !alias.trim() || !email || !email.trim() || !password || !password.trim()) {
      res.status(400).json({
        error: 'Alias, email, and password are required and cannot be empty or contain only spaces.',
      });
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedAlias = alias.trim();

    // Restrict Admin role creation via public registration
    let assignedRole = role || 'Individual';
    if (assignedRole === 'Admin') {
      assignedRole = 'Individual';
    }

    // Perform CPU-heavy password hashing BEFORE opening DB transaction
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = generate6DigitCode();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // TRANSACTION: Atomically validate email/alias uniqueness and create or update pending account
    const { user: savedUser, isNew } = await runTransaction('auth.register', async (tx) => {
      const existingEmail = await tx.user.findUnique({ where: { email: trimmedEmail } });
      if (existingEmail && existingEmail.isVerified) {
        throw new TransactionError(
          400,
          'An account with this email already exists. Please log in.'
        );
      }

      const existingAlias = await tx.user.findUnique({ where: { alias: trimmedAlias } });
      if (existingAlias && existingAlias.id !== existingEmail?.id) {
        throw new TransactionError(
          400,
          'This alias is already taken. Please choose another.'
        );
      }

      if (existingEmail) {
        // Re-issue OTP and update pending unverified credentials atomically
        const updatedUser = await tx.user.update({
          where: { id: existingEmail.id },
          data: {
            alias: trimmedAlias,
            password: hashedPassword,
            role: assignedRole,
            otpCode,
            otpExpiresAt,
          },
        });
        return { user: updatedUser, isNew: false };
      }

      const newUser = await tx.user.create({
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
      return { user: newUser, isNew: true };
    });

    // Send verification email ONLY after transaction COMMIT
    sendOtpEmail(savedUser.email, otpCode, savedUser.alias).catch((e) =>
      console.error('Registration email error:', e)
    );

    res.status(isNew ? 201 : 200).json({
      message: isNew
        ? 'Account created! A 6-digit verification code was sent to your email.'
        : 'A 6-digit verification code was sent to your email.',
      requiresOtp: true,
      email: savedUser.email,
      alias: savedUser.alias,
      userId: savedUser.id,
      role: savedUser.role,
    });
  } catch (error: any) {
    handleRouteError(
      res,
      error,
      'Failed to create account. Please try again.',
      'Registration error'
    );
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim() || !password || !password.trim()) {
      res.status(400).json({
        error: 'Email and password are required and cannot be empty or contain only spaces.',
      });
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

    // STRICT SECURITY: Block unverified accounts from logging in
    if (!user.isVerified) {
      res.status(403).json({
        error:
          'This account is unverified. Please complete your email verification first before logging in.',
      });
      return;
    }

    const otpCode = generate6DigitCode();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // TRANSACTION: Atomically verify account is still active/verified and issue login OTP
    const updatedUser = await runTransaction('auth.loginIssueOtp', async (tx) => {
      const current = await tx.user.findUnique({ where: { id: user.id } });
      if (!current) {
        throw new TransactionError(401, 'Invalid credentials. User not found.');
      }
      if (!current.isVerified) {
        throw new TransactionError(
          403,
          'This account is unverified. Please complete your email verification first before logging in.'
        );
      }

      return await tx.user.update({
        where: { id: current.id },
        data: { otpCode, otpExpiresAt },
        select: { id: true, email: true, alias: true, role: true },
      });
    });

    sendOtpEmail(updatedUser.email, otpCode, updatedUser.alias).catch((e) =>
      console.error('Login email error:', e)
    );

    res.json({
      message: 'Login successful! Verification code sent to your email.',
      requiresOtp: true,
      email: updatedUser.email,
      alias: updatedUser.alias,
      role: updatedUser.role,
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Internal server error during login.', 'Login error');
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
        isAnonymous: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get Me Error:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

// PUT /api/auth/privacy - Toggle isAnonymous status (Requires Authenticated User)
router.put('/privacy', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication token required to update privacy settings.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      res.status(401).json({ error: 'Authentication token is missing or invalid.' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      res.status(401).json({ error: 'Invalid or expired authentication token.' });
      return;
    }

    if (!decoded?.userId) {
      res.status(401).json({ error: 'Invalid authentication token payload.' });
      return;
    }

    const userId = decoded.userId;
    const { isAnonymous } = req.body;

    // TRANSACTION: Verify user exists and update privacy setting atomically
    const updatedUser = await runTransaction('auth.updatePrivacy', async (tx) => {
      const existing = await tx.user.findUnique({ where: { id: userId } });
      if (!existing) {
        throw new TransactionError(404, 'User account not found.');
      }

      return await tx.user.update({
        where: { id: userId },
        data: { isAnonymous: Boolean(isAnonymous) },
        select: {
          id: true,
          alias: true,
          email: true,
          role: true,
          isAnonymous: true,
        },
      });
    });

    res.json({
      message: 'Privacy settings updated successfully.',
      user: updatedUser,
    });
  } catch (error: any) {
    handleRouteError(
      res,
      error,
      'Failed to update privacy settings.',
      'Update Privacy Error'
    );
  }
});

// PUT /api/auth/alias - Update user/admin own display alias in database
router.put('/alias', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication token required.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      res.status(401).json({ error: 'Authentication token is missing or invalid.' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      res.status(401).json({ error: 'Invalid or expired authentication token.' });
      return;
    }

    if (!decoded?.userId) {
      res.status(401).json({ error: 'Invalid authentication token.' });
      return;
    }

    const { alias } = req.body;
    if (!alias || !alias.trim()) {
      res.status(400).json({ error: 'Alias is required.' });
      return;
    }

    const trimmedAlias = alias.trim();
    if (trimmedAlias.length < 2) {
      res.status(400).json({ error: 'Alias must be at least 2 characters long.' });
      return;
    }

    // TRANSACTION: Atomically check alias uniqueness and update display alias (prevents race condition)
    const updatedUser = await runTransaction('auth.updateAlias', async (tx) => {
      const currentUser = await tx.user.findUnique({ where: { id: decoded.userId } });
      if (!currentUser) {
        throw new TransactionError(404, 'User account not found.');
      }

      const existing = await tx.user.findFirst({
        where: {
          alias: trimmedAlias,
          id: { not: decoded.userId },
        },
      });

      if (existing) {
        throw new TransactionError(400, 'This alias is already taken. Please choose another.');
      }

      return await tx.user.update({
        where: { id: decoded.userId },
        data: { alias: trimmedAlias },
        select: {
          id: true,
          alias: true,
          email: true,
          role: true,
          isAnonymous: true,
        },
      });
    });

    res.json({
      message: 'Display alias updated successfully.',
      user: updatedUser,
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to update display alias.', 'Update Alias Error');
  }
});

// POST /api/auth/reset-password - Real database password update
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    const trimmedPass = (newPassword || '').trim();
    if (!email || !trimmedPass || trimmedPass.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    const hasUpper = /[A-Z]/.test(trimmedPass);
    const hasLower = /[a-z]/.test(trimmedPass);
    const hasNumber = /[0-9]/.test(trimmedPass);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmedPass);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      res.status(400).json({
        error:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
      return;
    }

    const trimmedEmail = String(email).trim();
    const hashedPassword = await bcrypt.hash(trimmedPass, 10);

    // TRANSACTION: Atomically find user, update hashed password, and clear any residual OTP
    const updatedUser = await runTransaction('auth.resetPassword', async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          OR: [{ email: trimmedEmail }, { alias: trimmedEmail }],
        },
      });

      if (!user) {
        throw new TransactionError(404, 'Account not found for this email address.');
      }

      return await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          otpCode: null,
          otpExpiresAt: null,
        },
        select: { id: true, email: true },
      });
    });

    console.log(`====================================================`);
    console.log(`🔑 Password successfully updated for: ${updatedUser.email}`);
    console.log(`====================================================`);

    res.json({
      message: 'Password successfully updated! You can now log in with your new password.',
    });
  } catch (error: any) {
    handleRouteError(
      res,
      error,
      'Failed to reset password in database.',
      'Reset Password Error'
    );
  }
});

// GET /api/auth/smtp-status - Live Render diagnostic check
router.get('/smtp-status', async (req: Request, res: Response): Promise<void> => {
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!smtpUser || !smtpPass) {
    res.json({
      configured: false,
      message:
        'SMTP credentials missing in Render Environment Variables. Please add SMTP_USER and SMTP_PASS.',
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
    const maskedSender = smtpUser.replace(/^(..)(.*)(@.*)$/, (_, a, b, c) => `${a}***${c}`);
    res.json({
      configured: true,
      sender: maskedSender,
      status: 'AUTHENTICATED_OK',
      message: 'Gmail SMTP is fully configured and operational on Render!',
    });
  } catch (err: any) {
    const maskedSender = smtpUser
      ? smtpUser.replace(/^(..)(.*)(@.*)$/, (_, a, b, c) => `${a}***${c}`)
      : '***';
    res.json({
      configured: true,
      sender: maskedSender,
      status: 'AUTHENTICATION_FAILED',
      error: err?.message || err,
    });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { encryptSensitiveText, decryptSensitiveText } from '../services/cryptoService';
import {
  runTransaction,
  TransactionError,
  handleRouteError,
} from '../utils/transaction';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jucoch_secret_key_2026';

// Middleware to verify Admin authorization
const verifyAdmin = async (req: Request, res: Response, next: () => void): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. Authentication token required.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      res.status(401).json({ error: 'Access denied. Token is missing or invalid.' });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || decoded.role !== 'Admin') {
      res.status(403).json({
        error: 'Forbidden. Admin privileges required to access this resource.',
      });
      return;
    }
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({
      error: 'Invalid or expired authorization token. Please log in as Admin.',
    });
  }
};

// Helper function to mask journal text with asterisks (e.g. "Final Exam" -> "Fi***l Ex***m")
const maskJournalText = (text: string): string => {
  if (!text) return '*** (Protected)';
  const words = text.trim().split(/\s+/).slice(0, 6);
  const maskedWords = words.map((w) => {
    const cleanWord = w.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanWord.length <= 1) return `${cleanWord}*`;
    if (cleanWord.length <= 2) return `${cleanWord[0]}*`;
    if (cleanWord.length === 3) return `${cleanWord[0]}*${cleanWord[2]}`;
    return `${cleanWord.slice(0, 2)}***${cleanWord.slice(-1)}`;
  });
  return maskedWords.join(' ');
};

// Helper function to mask email for strict student privacy protection (e.g. j***z@gmail.com)
const maskUserEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '***@anonymous.protected';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  return `${localPart.slice(0, 2)}***${localPart.slice(-1)}@${domain}`;
};

// GET /api/admin/users - Get all registered non-admin users (emails masked for privacy)
router.get('/users', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { not: 'Admin' },
        isVerified: true,
      },
      select: {
        id: true,
        alias: true,
        email: true,
        role: true,
        isVerified: true,
        isAnonymous: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const privacyProtectedUsers = users.map((u) => ({
      ...u,
      alias: u.isAnonymous ? 'Anonymous User' : u.alias,
      email: maskUserEmail(u.email),
    }));

    res.json({ users: privacyProtectedUsers });
  } catch (error: any) {
    console.error('Fetch Admin Users Error:', error);
    res.status(500).json({ error: 'Failed to fetch registered users list.' });
  }
});

// GET /api/admin/activities - Consistent snapshot audit feed across all 4 wellness tables
router.get('/activities', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // READ TRANSACTION: Fetch all 4 tables in a single consistent database snapshot
    const [moodLogs, sleepLogs, activityLogs, journalEntries] = await prisma.$transaction([
      prisma.moodLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { alias: true, role: true, isAnonymous: true } } },
      }),
      prisma.sleepLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { alias: true, role: true, isAnonymous: true } } },
      }),
      prisma.activityLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { alias: true, role: true, isAnonymous: true } } },
      }),
      prisma.journalEntry.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { alias: true, role: true, isAnonymous: true } } },
      }),
    ]);

    // Format into a privacy-first real-time audit feed with masked text (***)
    const formattedFeed = [
      ...moodLogs.map((m) => ({
        id: `mood-${m.id}`,
        alias: m.user.isAnonymous ? 'Anonymous User' : m.user.alias || 'Encrypted User',
        role: m.user.role,
        action: 'Mood Check-in',
        detail: `${m.emoji} ${m.mood}${
          m.note ? ` • [🔒 ${maskJournalText(decryptSensitiveText(m.note))}]` : ''
        }`,
        createdAt: m.createdAt,
      })),
      ...sleepLogs.map((s) => ({
        id: `sleep-${s.id}`,
        alias: s.user.isAnonymous ? 'Anonymous User' : s.user.alias || 'Encrypted User',
        role: s.user.role,
        action: 'Sleep Recorded',
        detail: `${s.hours} hours (${s.quality} quality)`,
        createdAt: s.createdAt,
      })),
      ...activityLogs.map((a) => ({
        id: `act-${a.id}`,
        alias: a.user.isAnonymous ? 'Anonymous User' : a.user.alias || 'Encrypted User',
        role: a.user.role,
        action: 'Wellness Activity',
        detail: `${a.type} • ${a.duration} mins`,
        createdAt: a.createdAt,
      })),
      ...journalEntries.map((j) => {
        const rawText = decryptSensitiveText(j.content) || 'Personal Reflection';
        const masked = maskJournalText(rawText);
        return {
          id: `journal-${j.id}`,
          alias: j.user.isAnonymous ? 'Anonymous User' : j.user.alias || 'Encrypted User',
          role: j.user.role,
          action: 'Journal Reflection',
          detail: `🔒 ${masked} (Masked Journal Entry)`,
          createdAt: j.createdAt,
        };
      }),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ activities: formattedFeed.slice(0, 50) });
  } catch (error: any) {
    console.error('Fetch Admin Activities Error:', error);
    res.status(500).json({ error: 'Failed to fetch audit activities.' });
  }
});

// GET /api/admin/stats - System statistics counter (consistent read snapshot transaction)
router.get('/stats', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // READ TRANSACTION: Ensure all 6 counters reflect the exact same point in time
    const [
      totalUsers,
      individualUsers,
      studentUsers,
      totalMoodLogs,
      totalSleepLogs,
      totalJournalEntries,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'Individual' } }),
      prisma.user.count({ where: { role: 'Student' } }),
      prisma.moodLog.count(),
      prisma.sleepLog.count(),
      prisma.journalEntry.count(),
    ]);

    res.json({
      stats: {
        totalUsers,
        individualUsers,
        studentUsers,
        totalMoodLogs,
        totalSleepLogs,
        totalJournalEntries,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch system statistics.' });
  }
});

// DELETE /api/admin/activities/:id - Admin delete inappropriate activity log (Transactional)
router.delete('/activities/:id', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    // TRANSACTION: Atomically locate and delete target activity; ROLLBACK if not found
    await runTransaction('admin.deleteActivity', async (tx) => {
      let deletedCount = 0;

      if (id.startsWith('mood-')) {
        const realId = id.replace('mood-', '');
        deletedCount = (await tx.moodLog.deleteMany({ where: { id: realId } })).count;
      } else if (id.startsWith('sleep-')) {
        const realId = id.replace('sleep-', '');
        deletedCount = (await tx.sleepLog.deleteMany({ where: { id: realId } })).count;
      } else if (id.startsWith('act-')) {
        const realId = id.replace('act-', '');
        deletedCount = (await tx.activityLog.deleteMany({ where: { id: realId } })).count;
      } else if (id.startsWith('journal-')) {
        const realId = id.replace('journal-', '');
        deletedCount = (await tx.journalEntry.deleteMany({ where: { id: realId } })).count;
      } else {
        // Atomic sequential delete across all 4 wellness tables inside one transaction
        const m = await tx.moodLog.deleteMany({ where: { id } });
        const s = await tx.sleepLog.deleteMany({ where: { id } });
        const a = await tx.activityLog.deleteMany({ where: { id } });
        const j = await tx.journalEntry.deleteMany({ where: { id } });
        deletedCount = m.count + s.count + a.count + j.count;
      }

      if (deletedCount === 0) {
        throw new TransactionError(404, 'Activity entry not found.');
      }
    });

    res.json({ message: 'Activity entry moderated and deleted successfully by Admin.' });
  } catch (error: any) {
    handleRouteError(
      res,
      error,
      'Failed to delete activity entry.',
      'Admin Delete Activity Error'
    );
  }
});

// PUT /api/admin/activities/:id - Admin edit activity details (Transactional)
router.put('/activities/:id', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { detail } = req.body;

    if (!detail || !detail.trim()) {
      res.status(400).json({ error: 'Activity detail cannot be empty.' });
      return;
    }

    const trimmedDetail = detail.trim();

    // TRANSACTION: Verify target record exists and update atomically; ROLLBACK on missing/error
    await runTransaction('admin.editActivity', async (tx) => {
      let updatedCount = 0;

      if (id.startsWith('journal-')) {
        const realId = id.replace('journal-', '');
        updatedCount = (
          await tx.journalEntry.updateMany({
            where: { id: realId },
            data: { content: encryptSensitiveText(trimmedDetail) || '' },
          })
        ).count;
      } else if (id.startsWith('mood-')) {
        const realId = id.replace('mood-', '');
        updatedCount = (
          await tx.moodLog.updateMany({
            where: { id: realId },
            data: { note: encryptSensitiveText(trimmedDetail) },
          })
        ).count;
      } else if (id.startsWith('act-')) {
        const realId = id.replace('act-', '');
        updatedCount = (
          await tx.activityLog.updateMany({
            where: { id: realId },
            data: { type: trimmedDetail },
          })
        ).count;
      } else {
        throw new TransactionError(
          400,
          'Unsupported activity type for editing. Use journal-, mood-, or act- prefix.'
        );
      }

      if (updatedCount === 0) {
        throw new TransactionError(404, 'Activity entry not found.');
      }
    });

    res.json({ message: 'Activity details updated successfully by Admin.' });
  } catch (error: any) {
    handleRouteError(
      res,
      error,
      'Failed to update activity entry.',
      'Admin Edit Activity Error'
    );
  }
});

// DELETE /api/admin/users/:id - 5-Table Atomic Cascade Delete Transaction
router.delete('/users/:id', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    // MULTI-TABLE TRANSACTION (5 Tables):
    // Deletes MoodLog, SleepLog, ActivityLog, JournalEntry, and User atomically.
    // If ANY step fails (or target is an Admin), PostgreSQL executes ROLLBACK and restores all rows.
    const summary = await runTransaction('admin.deleteUserCascade', async (tx) => {
      const targetUser = await tx.user.findUnique({ where: { id } });
      if (!targetUser) {
        throw new TransactionError(404, 'User account not found.');
      }
      if (targetUser.role === 'Admin') {
        throw new TransactionError(403, 'Cannot delete an official Admin account.');
      }

      const deletedMoods = await tx.moodLog.deleteMany({ where: { userId: id } });
      const deletedSleeps = await tx.sleepLog.deleteMany({ where: { userId: id } });
      const deletedActivities = await tx.activityLog.deleteMany({ where: { userId: id } });
      const deletedJournals = await tx.journalEntry.deleteMany({ where: { userId: id } });

      await tx.user.delete({ where: { id } });

      return {
        alias: targetUser.alias,
        deletedCounts: {
          moodLogs: deletedMoods.count,
          sleepLogs: deletedSleeps.count,
          activityLogs: deletedActivities.count,
          journalEntries: deletedJournals.count,
        },
      };
    });

    res.json({
      message: `User "${summary.alias}" deleted successfully by Admin.`,
      deletedCounts: summary.deletedCounts,
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to delete user account.', 'Admin Delete User Error');
  }
});

// PUT /api/admin/users/:id - Admin edit user profile (alias or role) inside transaction
router.put('/users/:id', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { alias, role } = req.body;

    // TRANSACTION: Verify target user, protect Admin role, validate alias uniqueness, and update
    const updated = await runTransaction('admin.editUser', async (tx) => {
      const targetUser = await tx.user.findUnique({ where: { id } });
      if (!targetUser) {
        throw new TransactionError(404, 'User account not found.');
      }
      if (targetUser.role === 'Admin' && role && role !== 'Admin') {
        throw new TransactionError(
          403,
          'Cannot demote an official Admin account from this panel.'
        );
      }

      const trimmedAlias = alias ? String(alias).trim() : undefined;
      if (trimmedAlias) {
        const conflict = await tx.user.findFirst({
          where: {
            alias: trimmedAlias,
            id: { not: id },
          },
        });
        if (conflict) {
          throw new TransactionError(
            400,
            'This alias is already taken by another user. Please choose another.'
          );
        }
      }

      return await tx.user.update({
        where: { id },
        data: {
          ...(trimmedAlias ? { alias: trimmedAlias } : {}),
          ...(role && targetUser.role !== 'Admin' ? { role: String(role).trim() } : {}),
        },
      });
    });

    res.json({ message: 'User account updated successfully!', user: updated });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to update user account.', 'Admin Edit User Error');
  }
});

// GET /api/admin/admins - Get live list of creator admins with their latest database aliases
router.get('/admins', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'Admin' },
      select: {
        id: true,
        alias: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ admins });
  } catch (error: any) {
    console.error('Fetch Admins Error:', error);
    res.status(500).json({ error: 'Failed to fetch admin accounts.' });
  }
});

export default router;

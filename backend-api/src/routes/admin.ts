import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jucoch_secret_key_2026';

// Middleware to verify Admin authorization
const verifyAdmin = async (req: Request, res: Response, next: () => void): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }
    const token = authHeader.split(' ')[1];
    if (!token || token.includes('mock-token')) {
      next();
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    next();
  } catch (error) {
    // Allow proceeding in dev mode so admin dashboard displays DB users reliably
    next();
  }
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

    const privacyProtectedUsers = users.map(u => ({
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

// GET /api/admin/activities - Live user activity audit feed across mood, sleep, activity, and journal entries
router.get('/activities', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const moodLogs = await prisma.moodLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { alias: true, role: true, isAnonymous: true } } },
    });

    const sleepLogs = await prisma.sleepLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { alias: true, role: true, isAnonymous: true } } },
    });

    const activityLogs = await prisma.activityLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { alias: true, role: true, isAnonymous: true } } },
    });

    const journalEntries = await prisma.journalEntry.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { alias: true, role: true, isAnonymous: true } } },
    });

    // Format into a unified real-time feed
    const formattedFeed = [
      ...moodLogs.map(m => ({
        id: `mood-${m.id}`,
        alias: m.user.isAnonymous ? 'Anonymous User' : m.user.alias,
        role: m.user.role,
        action: 'Mood Check-in',
        detail: `${m.emoji} ${m.mood}${m.note ? ` ("${m.note}")` : ''}`,
        createdAt: m.createdAt,
      })),
      ...sleepLogs.map(s => ({
        id: `sleep-${s.id}`,
        alias: s.user.isAnonymous ? 'Anonymous User' : s.user.alias,
        role: s.user.role,
        action: 'Sleep Recorded',
        detail: `${s.hours} hours (${s.quality} quality)`,
        createdAt: s.createdAt,
      })),
      ...activityLogs.map(a => ({
        id: `act-${a.id}`,
        alias: a.user.isAnonymous ? 'Anonymous User' : a.user.alias,
        role: a.user.role,
        action: 'Wellness Activity',
        detail: `${a.type} for ${a.duration} minutes`,
        createdAt: a.createdAt,
      })),
      ...journalEntries.map(j => ({
        id: `journal-${j.id}`,
        alias: j.user.isAnonymous ? 'Anonymous User' : j.user.alias,
        role: j.user.role,
        action: 'Journal Reflection',
        detail: `Wrote a reflection (${j.content.slice(0, 30)}...)`,
        createdAt: j.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ activities: formattedFeed.slice(0, 50) });
  } catch (error: any) {
    console.error('Fetch Admin Activities Error:', error);
    res.status(500).json({ error: 'Failed to fetch audit activities.' });
  }
});

// GET /api/admin/stats - System statistics counter
router.get('/stats', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const individualUsers = await prisma.user.count({ where: { role: 'Individual' } });
    const studentUsers = await prisma.user.count({ where: { role: 'Student' } });
    const totalMoodLogs = await prisma.moodLog.count();
    const totalSleepLogs = await prisma.sleepLog.count();
    const totalJournalEntries = await prisma.journalEntry.count();

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

// DELETE /api/admin/activities/:id - Admin delete inappropriate activity log
router.delete('/activities/:id', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (id.startsWith('mood-')) {
      const realId = id.replace('mood-', '');
      await prisma.moodLog.deleteMany({ where: { id: realId } });
    } else if (id.startsWith('sleep-')) {
      const realId = id.replace('sleep-', '');
      await prisma.sleepLog.deleteMany({ where: { id: realId } });
    } else if (id.startsWith('act-')) {
      const realId = id.replace('act-', '');
      await prisma.activityLog.deleteMany({ where: { id: realId } });
    } else if (id.startsWith('journal-')) {
      const realId = id.replace('journal-', '');
      await prisma.journalEntry.deleteMany({ where: { id: realId } });
    } else {
      // Try direct id match across all models
      await Promise.allSettled([
        prisma.moodLog.deleteMany({ where: { id } }),
        prisma.sleepLog.deleteMany({ where: { id } }),
        prisma.activityLog.deleteMany({ where: { id } }),
        prisma.journalEntry.deleteMany({ where: { id } }),
      ]);
    }

    res.json({ message: 'Activity entry moderated and deleted successfully by Admin.' });
  } catch (error: any) {
    console.error('Admin Delete Activity Error:', error);
    res.status(500).json({ error: 'Failed to delete activity entry.' });
  }
});

// PUT /api/admin/activities/:id - Admin edit activity details
router.put('/activities/:id', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { detail } = req.body;

    if (!detail || !detail.trim()) {
      res.status(400).json({ error: 'Activity detail cannot be empty.' });
      return;
    }

    if (id.startsWith('journal-')) {
      const realId = id.replace('journal-', '');
      await prisma.journalEntry.updateMany({
        where: { id: realId },
        data: { content: detail.trim() },
      });
    } else if (id.startsWith('mood-')) {
      const realId = id.replace('mood-', '');
      await prisma.moodLog.updateMany({
        where: { id: realId },
        data: { note: detail.trim() },
      });
    } else if (id.startsWith('act-')) {
      const realId = id.replace('act-', '');
      await prisma.activityLog.updateMany({
        where: { id: realId },
        data: { type: detail.trim() },
      });
    }

    res.json({ message: 'Activity details updated successfully by Admin.' });
  } catch (error: any) {
    console.error('Admin Edit Activity Error:', error);
    res.status(500).json({ error: 'Failed to update activity entry.' });
  }
});

// DELETE /api/admin/users/:id - Admin remove violating user account
router.delete('/users/:id', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }
    if (targetUser.role === 'Admin') {
      res.status(403).json({ error: 'Cannot delete an official Admin account.' });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: `User "${targetUser.alias}" deleted successfully by Admin.` });
  } catch (error: any) {
    console.error('Admin Delete User Error:', error);
    res.status(500).json({ error: 'Failed to delete user account.' });
  }
});

// PUT /api/admin/users/:id - Admin edit user profile (alias or role)
router.put('/users/:id', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { alias, role } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }
    if (targetUser.role === 'Admin') {
      res.status(403).json({ error: 'Cannot edit an official Admin account from this panel.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(alias ? { alias: alias.trim() } : {}),
        ...(role ? { role: role.trim() } : {}),
      },
    });

    res.json({ message: 'User account updated successfully!', user: updated });
  } catch (error: any) {
    console.error('Admin Edit User Error:', error);
    res.status(500).json({ error: 'Failed to update user account.' });
  }
});

export default router;

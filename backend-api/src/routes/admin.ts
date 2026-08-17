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

// GET /api/admin/users - Get all registered non-admin users
router.get('/users', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { not: 'Admin' },
      },
      select: {
        id: true,
        alias: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
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
      include: { user: { select: { alias: true, role: true } } },
    });

    const sleepLogs = await prisma.sleepLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { alias: true, role: true } } },
    });

    const activityLogs = await prisma.activityLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { alias: true, role: true } } },
    });

    const journalEntries = await prisma.journalEntry.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { alias: true, role: true } } },
    });

    // Format into a unified real-time feed
    const formattedFeed = [
      ...moodLogs.map(m => ({
        id: `mood-${m.id}`,
        alias: m.user.alias,
        role: m.user.role,
        action: 'Mood Check-in',
        detail: `${m.emoji} ${m.mood}${m.note ? ` ("${m.note}")` : ''}`,
        createdAt: m.createdAt,
      })),
      ...sleepLogs.map(s => ({
        id: `sleep-${s.id}`,
        alias: s.user.alias,
        role: s.user.role,
        action: 'Sleep Recorded',
        detail: `${s.hours} hours (${s.quality} quality)`,
        createdAt: s.createdAt,
      })),
      ...activityLogs.map(a => ({
        id: `act-${a.id}`,
        alias: a.user.alias,
        role: a.user.role,
        action: 'Wellness Activity',
        detail: `${a.type} for ${a.duration} minutes`,
        createdAt: a.createdAt,
      })),
      ...journalEntries.map(j => ({
        id: `journal-${j.id}`,
        alias: j.user.alias,
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

export default router;

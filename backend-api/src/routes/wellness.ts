import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jucoch_secret_key_2026';

// Helper middleware to extract user from JWT Token (optional or authorization header)
const extractUserId = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId || null;
  } catch (error) {
    return null;
  }
};

// Helper to resolve user ID from token or fallback to latest student/individual user
const resolveUserId = async (req: Request): Promise<string | null> => {
  const tokenUserId = extractUserId(req);
  if (tokenUserId) return tokenUserId;

  if (req.body.userId) return req.body.userId;

  // Fallback to latest registered student or individual
  const lastUser = await prisma.user.findFirst({
    where: { role: { not: 'Admin' } },
    orderBy: { createdAt: 'desc' },
  });

  return lastUser ? lastUser.id : null;
};

// ==========================================
// 1. MOOD LOGS ENDPOINTS
// ==========================================

// POST /api/wellness/mood
router.post('/mood', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mood, emoji, note } = req.body;
    const userId = await resolveUserId(req);

    if (!mood || !emoji) {
      res.status(400).json({ error: 'Mood and emoji are required.' });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: 'User account required to log mood.' });
      return;
    }

    const newLog = await prisma.moodLog.create({
      data: {
        mood,
        emoji,
        note: note ? note.trim() : null,
        userId,
      },
    });

    res.status(201).json({
      message: 'Mood check-in recorded successfully!',
      moodLog: newLog,
    });
  } catch (error: any) {
    console.error('Mood Log Error:', error);
    res.status(500).json({ error: 'Failed to record mood log.' });
  }
});

// GET /api/wellness/mood
router.get('/mood', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await resolveUserId(req);

    if (!userId) {
      res.status(400).json({ error: 'User ID or Auth token is required.' });
      return;
    }

    const logs = await prisma.moodLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ moodLogs: logs });
  } catch (error: any) {
    console.error('Fetch Mood Logs Error:', error);
    res.status(500).json({ error: 'Failed to fetch mood logs.' });
  }
});

// ==========================================
// 2. SLEEP LOGS ENDPOINTS
// ==========================================

// POST /api/wellness/sleep
router.post('/sleep', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hours, quality } = req.body;
    const userId = await resolveUserId(req);

    if (hours === undefined || !quality) {
      res.status(400).json({ error: 'Sleep hours and quality rating are required.' });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: 'User account required to log sleep.' });
      return;
    }

    const newLog = await prisma.sleepLog.create({
      data: {
        hours: parseFloat(hours),
        quality,
        userId,
      },
    });

    res.status(201).json({
      message: 'Sleep record saved successfully!',
      sleepLog: newLog,
    });
  } catch (error: any) {
    console.error('Sleep Log Error:', error);
    res.status(500).json({ error: 'Failed to record sleep log.' });
  }
});

// GET /api/wellness/sleep
router.get('/sleep', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await resolveUserId(req);

    if (!userId) {
      res.status(400).json({ error: 'User ID or Auth token is required.' });
      return;
    }

    const logs = await prisma.sleepLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ sleepLogs: logs });
  } catch (error: any) {
    console.error('Fetch Sleep Logs Error:', error);
    res.status(500).json({ error: 'Failed to fetch sleep logs.' });
  }
});

// ==========================================
// 3. ACTIVITY LOGS ENDPOINTS
// ==========================================

// POST /api/wellness/activity
router.post('/activity', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, duration } = req.body;
    const userId = await resolveUserId(req);

    if (!type || !duration) {
      res.status(400).json({ error: 'Activity type and duration in minutes are required.' });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: 'User account required to log activity.' });
      return;
    }

    const newLog = await prisma.activityLog.create({
      data: {
        type,
        duration: parseInt(duration, 10),
        userId,
      },
    });

    res.status(201).json({
      message: 'Activity recorded successfully!',
      activityLog: newLog,
    });
  } catch (error: any) {
    console.error('Activity Log Error:', error);
    res.status(500).json({ error: 'Failed to record activity log.' });
  }
});

// GET /api/wellness/activity
router.get('/activity', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await resolveUserId(req);

    if (!userId) {
      res.status(400).json({ error: 'User ID or Auth token is required.' });
      return;
    }

    const logs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ activityLogs: logs });
  } catch (error: any) {
    console.error('Fetch Activity Logs Error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs.' });
  }
});

// ==========================================
// 4. JOURNAL ENTRIES ENDPOINTS
// ==========================================

// POST /api/wellness/journal
router.post('/journal', async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const userId = await resolveUserId(req);

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Journal content cannot be empty.' });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: 'User account required to save journal.' });
      return;
    }

    const newEntry = await prisma.journalEntry.create({
      data: {
        content: content.trim(),
        userId,
      },
    });

    res.status(201).json({
      message: 'Reflection journal saved successfully!',
      journalEntry: newEntry,
    });
  } catch (error: any) {
    console.error('Journal Entry Error:', error);
    res.status(500).json({ error: 'Failed to save journal entry.' });
  }
});

// GET /api/wellness/journal
router.get('/journal', async (req: Request, res: Response): Promise<void> => {
  try {
    const queryUserId = req.query.userId as string;
    const userId = extractUserId(req) || queryUserId;

    if (!userId) {
      res.status(400).json({ error: 'User ID or Auth token is required.' });
      return;
    }

    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ journalEntries: entries });
  } catch (error: any) {
    console.error('Fetch Journal Entries Error:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries.' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { encryptSensitiveText, decryptSensitiveText } from '../services/cryptoService';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jucoch_secret_key_2026';

// Middleware to strictly enforce Authentication for personal wellness data
const requireAuthUser = (req: Request, res: Response, next: () => void): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  if (!token || token === 'null' || token === 'undefined') {
    res.status(401).json({ error: 'Authentication token missing or invalid.' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded?.userId) {
      res.status(401).json({ error: 'Invalid token payload.' });
      return;
    }
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired authentication token. Please log in again.' });
  }
};

// ==========================================
// 1. MOOD LOGS ENDPOINTS
// ==========================================

// POST /api/wellness/mood
router.post('/mood', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { mood, emoji, note } = req.body;

    if (!mood || !emoji) {
      res.status(400).json({ error: 'Mood and emoji are required.' });
      return;
    }

    // Encrypt mood note with AES-256 for student privacy
    const encryptedNote = encryptSensitiveText(note ? note.trim() : null);

    const newLog = await prisma.moodLog.create({
      data: {
        mood,
        emoji,
        note: encryptedNote,
        userId,
      },
    });

    res.status(201).json({
      message: 'Mood check-in recorded successfully!',
      moodLog: {
        ...newLog,
        note: decryptSensitiveText(newLog.note),
      },
    });
  } catch (error: any) {
    console.error('Mood Log Error:', error);
    res.status(500).json({ error: 'Failed to record mood log.' });
  }
});

// GET /api/wellness/mood
router.get('/mood', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const logs = await prisma.moodLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Decrypt mood notes for the authenticated user
    const decryptedLogs = logs.map(l => ({
      ...l,
      note: decryptSensitiveText(l.note),
    }));

    res.json({ moodLogs: decryptedLogs });
  } catch (error: any) {
    console.error('Fetch Mood Logs Error:', error);
    res.status(500).json({ error: 'Failed to fetch mood logs.' });
  }
});

// ==========================================
// 2. SLEEP LOGS ENDPOINTS
// ==========================================

// POST /api/wellness/sleep
router.post('/sleep', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { hours, quality } = req.body;

    if (hours === undefined || !quality) {
      res.status(400).json({ error: 'Sleep hours and quality rating are required.' });
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
router.get('/sleep', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

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
router.post('/activity', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { type, duration } = req.body;

    if (!type || !duration) {
      res.status(400).json({ error: 'Activity type and duration in minutes are required.' });
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
router.get('/activity', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

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
// 4. JOURNAL ENTRIES ENDPOINTS (AES-256 ENCRYPTED)
// ==========================================

// POST /api/wellness/journal
router.post('/journal', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Journal content cannot be empty.' });
      return;
    }

    // Encrypt reflection content with AES-256 for student privacy
    const encryptedContent = encryptSensitiveText(content.trim()) || '';

    const newEntry = await prisma.journalEntry.create({
      data: {
        content: encryptedContent,
        userId,
      },
    });

    res.status(201).json({
      message: 'Reflection journal saved successfully!',
      journalEntry: {
        ...newEntry,
        content: decryptSensitiveText(newEntry.content),
      },
    });
  } catch (error: any) {
    console.error('Journal Entry Error:', error);
    res.status(500).json({ error: 'Failed to save journal entry.' });
  }
});

// GET /api/wellness/journal
router.get('/journal', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Decrypt reflections for the authenticated user
    const decryptedEntries = entries.map(e => ({
      ...e,
      content: decryptSensitiveText(e.content),
    }));

    res.json({ journalEntries: decryptedEntries });
  } catch (error: any) {
    console.error('Fetch Journal Entries Error:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries.' });
  }
});

// PUT /api/wellness/journal/:id
router.put('/journal/:id', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Journal content cannot be empty.' });
      return;
    }

    // Strictly ensure user owns this journal entry
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Journal entry not found or unauthorized.' });
      return;
    }

    const encryptedContent = encryptSensitiveText(content.trim()) || '';

    const updated = await prisma.journalEntry.update({
      where: { id },
      data: { content: encryptedContent },
    });

    res.json({
      message: 'Journal entry updated successfully!',
      journalEntry: {
        ...updated,
        content: decryptSensitiveText(updated.content),
      },
    });
  } catch (error: any) {
    console.error('Update Journal Entry Error:', error);
    res.status(500).json({ error: 'Failed to update journal entry.' });
  }
});

// DELETE /api/wellness/journal/:id
router.delete('/journal/:id', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    // Strictly ensure user owns this journal entry
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Journal entry not found or unauthorized.' });
      return;
    }

    await prisma.journalEntry.delete({
      where: { id },
    });

    res.json({
      message: 'Journal entry deleted successfully!',
    });
  } catch (error: any) {
    console.error('Delete Journal Entry Error:', error);
    res.status(500).json({ error: 'Failed to delete journal entry.' });
  }
});

// GET /api/wellness/all - Load all user wellness records on startup/login
router.get('/all', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const [moodLogs, sleepLogs, activityLogs, journalEntries] = await Promise.all([
      prisma.moodLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.sleepLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.activityLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    // Decrypt sensitive content for the authenticated user
    const decryptedMoodLogs = moodLogs.map(m => ({
      ...m,
      note: decryptSensitiveText(m.note),
    }));

    const decryptedJournalEntries = journalEntries.map(j => ({
      ...j,
      content: decryptSensitiveText(j.content),
    }));

    res.json({
      moodLogs: decryptedMoodLogs,
      sleepLogs,
      activityLogs,
      journalEntries: decryptedJournalEntries,
    });
  } catch (error: any) {
    console.error('Fetch All Wellness Data Error:', error);
    res.status(500).json({ error: 'Failed to sync user wellness records.' });
  }
});

export default router;

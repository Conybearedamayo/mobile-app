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
    res.status(401).json({
      error: 'Invalid or expired authentication token. Please log in again.',
    });
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

    const encryptedNote = encryptSensitiveText(note ? String(note).trim() : null);

    // TRANSACTION: Verify user exists and insert encrypted mood log atomically
    const newLog = await runTransaction('wellness.createMood', async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) {
        throw new TransactionError(404, 'User account not found.');
      }

      return await tx.moodLog.create({
        data: {
          mood: String(mood).trim(),
          emoji: String(emoji).trim(),
          note: encryptedNote,
          userId,
        },
      });
    });

    res.status(201).json({
      message: 'Mood check-in recorded successfully!',
      moodLog: {
        ...newLog,
        note: decryptSensitiveText(newLog.note),
      },
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to record mood log.', 'Mood Log Error');
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

    const decryptedLogs = logs.map((l) => ({
      ...l,
      note: decryptSensitiveText(l.note),
    }));

    res.json({ moodLogs: decryptedLogs });
  } catch (error: any) {
    console.error('Fetch Mood Logs Error:', error);
    res.status(500).json({ error: 'Failed to fetch mood logs.' });
  }
});

// PUT /api/wellness/mood/:id
router.put('/mood/:id', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const { mood, emoji, note } = req.body;

    if (!mood || !emoji) {
      res.status(400).json({ error: 'Mood and emoji are required.' });
      return;
    }

    const encryptedNote = encryptSensitiveText(note ? String(note).trim() : null);

    // TRANSACTION: Atomically verify ownership and update mood log
    const updated = await runTransaction('wellness.updateMood', async (tx) => {
      const existing = await tx.moodLog.findFirst({ where: { id, userId } });
      if (!existing) {
        throw new TransactionError(404, 'Mood log not found or unauthorized.');
      }

      return await tx.moodLog.update({
        where: { id },
        data: {
          mood: String(mood).trim(),
          emoji: String(emoji).trim(),
          note: encryptedNote,
        },
      });
    });

    res.json({
      message: 'Mood check-in updated successfully!',
      moodLog: {
        ...updated,
        note: decryptSensitiveText(updated.note),
      },
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to update mood log.', 'Update Mood Log Error');
  }
});

// DELETE /api/wellness/mood/:id
router.delete('/mood/:id', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    // TRANSACTION: Atomically verify ownership and delete mood log
    await runTransaction('wellness.deleteMood', async (tx) => {
      const existing = await tx.moodLog.findFirst({ where: { id, userId } });
      if (!existing) {
        throw new TransactionError(404, 'Mood log not found or unauthorized.');
      }

      await tx.moodLog.delete({ where: { id } });
    });

    res.json({ message: 'Mood log deleted successfully!' });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to delete mood log.', 'Delete Mood Log Error');
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

    const parsedHours = parseFloat(hours);

    // TRANSACTION: Validate sleep range, verify user, and save sleep log atomically
    const newLog = await runTransaction('wellness.createSleep', async (tx) => {
      if (isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 24) {
        throw new TransactionError(400, 'Sleep hours must be a valid number between 0 and 24.');
      }

      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) {
        throw new TransactionError(404, 'User account not found.');
      }

      return await tx.sleepLog.create({
        data: {
          hours: parsedHours,
          quality: String(quality).trim(),
          userId,
        },
      });
    });

    res.status(201).json({
      message: 'Sleep record saved successfully!',
      sleepLog: newLog,
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to record sleep log.', 'Sleep Log Error');
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

// PUT /api/wellness/sleep/:id
router.put('/sleep/:id', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const { hours, quality } = req.body;

    if (hours === undefined || !quality) {
      res.status(400).json({ error: 'Sleep hours and quality rating are required.' });
      return;
    }

    const parsedHours = parseFloat(hours);

    // TRANSACTION: Validate sleep range, verify ownership, and update atomically
    const updated = await runTransaction('wellness.updateSleep', async (tx) => {
      if (isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 24) {
        throw new TransactionError(400, 'Sleep hours must be a valid number between 0 and 24.');
      }

      const existing = await tx.sleepLog.findFirst({ where: { id, userId } });
      if (!existing) {
        throw new TransactionError(404, 'Sleep record not found or unauthorized.');
      }

      return await tx.sleepLog.update({
        where: { id },
        data: {
          hours: parsedHours,
          quality: String(quality).trim(),
        },
      });
    });

    res.json({
      message: 'Sleep record updated successfully!',
      sleepLog: updated,
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to update sleep record.', 'Update Sleep Log Error');
  }
});

// DELETE /api/wellness/sleep/:id
router.delete('/sleep/:id', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    // TRANSACTION: Atomically verify ownership and delete sleep log
    await runTransaction('wellness.deleteSleep', async (tx) => {
      const existing = await tx.sleepLog.findFirst({ where: { id, userId } });
      if (!existing) {
        throw new TransactionError(404, 'Sleep record not found or unauthorized.');
      }

      await tx.sleepLog.delete({ where: { id } });
    });

    res.json({ message: 'Sleep record deleted successfully!' });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to delete sleep record.', 'Delete Sleep Log Error');
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

    if (!type || duration === undefined) {
      res.status(400).json({ error: 'Activity type and duration in minutes are required.' });
      return;
    }

    const parsedDuration = parseInt(duration, 10);

    // TRANSACTION: Validate duration, verify user, and insert activity log atomically
    const newLog = await runTransaction('wellness.createActivity', async (tx) => {
      if (isNaN(parsedDuration) || parsedDuration <= 0) {
        throw new TransactionError(400, 'Activity duration must be a positive number of minutes.');
      }

      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) {
        throw new TransactionError(404, 'User account not found.');
      }

      return await tx.activityLog.create({
        data: {
          type: String(type).trim(),
          duration: parsedDuration,
          userId,
        },
      });
    });

    res.status(201).json({
      message: 'Activity recorded successfully!',
      activityLog: newLog,
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to record activity log.', 'Activity Log Error');
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

// PUT /api/wellness/activity/:id
router.put('/activity/:id', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const { type, duration } = req.body;

    if (!type || duration === undefined) {
      res.status(400).json({ error: 'Activity type and duration in minutes are required.' });
      return;
    }

    const parsedDuration = parseInt(duration, 10);

    // TRANSACTION: Validate duration, verify ownership, and update activity log atomically
    const updated = await runTransaction('wellness.updateActivity', async (tx) => {
      if (isNaN(parsedDuration) || parsedDuration <= 0) {
        throw new TransactionError(400, 'Activity duration must be a positive number of minutes.');
      }

      const existing = await tx.activityLog.findFirst({ where: { id, userId } });
      if (!existing) {
        throw new TransactionError(404, 'Activity log not found or unauthorized.');
      }

      return await tx.activityLog.update({
        where: { id },
        data: {
          type: String(type).trim(),
          duration: parsedDuration,
        },
      });
    });

    res.json({
      message: 'Activity log updated successfully!',
      activityLog: updated,
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to update activity log.', 'Update Activity Log Error');
  }
});

// DELETE /api/wellness/activity/:id
router.delete('/activity/:id', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    // TRANSACTION: Atomically verify ownership and delete activity log
    await runTransaction('wellness.deleteActivity', async (tx) => {
      const existing = await tx.activityLog.findFirst({ where: { id, userId } });
      if (!existing) {
        throw new TransactionError(404, 'Activity log not found or unauthorized.');
      }

      await tx.activityLog.delete({ where: { id } });
    });

    res.json({ message: 'Activity log deleted successfully!' });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to delete activity log.', 'Delete Activity Log Error');
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

    if (!content || !String(content).trim()) {
      res.status(400).json({ error: 'Journal content cannot be empty.' });
      return;
    }

    const encryptedContent = encryptSensitiveText(String(content).trim()) || '';

    // TRANSACTION: Verify user exists and save encrypted journal entry atomically
    const newEntry = await runTransaction('wellness.createJournal', async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) {
        throw new TransactionError(404, 'User account not found.');
      }

      return await tx.journalEntry.create({
        data: {
          content: encryptedContent,
          userId,
        },
      });
    });

    res.status(201).json({
      message: 'Reflection journal saved successfully!',
      journalEntry: {
        ...newEntry,
        content: decryptSensitiveText(newEntry.content),
      },
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to save journal entry.', 'Journal Entry Error');
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

    const decryptedEntries = entries.map((e) => ({
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

    if (!content || !String(content).trim()) {
      res.status(400).json({ error: 'Journal content cannot be empty.' });
      return;
    }

    const encryptedContent = encryptSensitiveText(String(content).trim()) || '';

    // TRANSACTION: Atomically verify ownership and update encrypted journal entry
    const updated = await runTransaction('wellness.updateJournal', async (tx) => {
      const existing = await tx.journalEntry.findFirst({ where: { id, userId } });
      if (!existing) {
        throw new TransactionError(404, 'Journal entry not found or unauthorized.');
      }

      return await tx.journalEntry.update({
        where: { id },
        data: { content: encryptedContent },
      });
    });

    res.json({
      message: 'Journal entry updated successfully!',
      journalEntry: {
        ...updated,
        content: decryptSensitiveText(updated.content),
      },
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to update journal entry.', 'Update Journal Entry Error');
  }
});

// DELETE /api/wellness/journal/:id
router.delete('/journal/:id', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    // TRANSACTION: Atomically verify ownership and delete journal entry
    await runTransaction('wellness.deleteJournal', async (tx) => {
      const existing = await tx.journalEntry.findFirst({ where: { id, userId } });
      if (!existing) {
        throw new TransactionError(404, 'Journal entry not found or unauthorized.');
      }

      await tx.journalEntry.delete({ where: { id } });
    });

    res.json({
      message: 'Journal entry deleted successfully!',
    });
  } catch (error: any) {
    handleRouteError(res, error, 'Failed to delete journal entry.', 'Delete Journal Entry Error');
  }
});

// ==========================================
// 5. ATOMIC MULTI-TABLE DAILY WELLNESS CHECK-IN
// ==========================================

// POST /api/wellness/daily-checkin
// Saves Mood + Sleep + Activity + Journal across up to 4 tables in ONE atomic transaction.
// If ANY section fails validation or DB insert, PostgreSQL executes ROLLBACK so 0 partial records are saved.
router.post('/daily-checkin', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { mood, sleep, activity, journal } = req.body;

    if (!mood && !sleep && !activity && !journal) {
      res.status(400).json({
        error: 'Provide at least one wellness entry (mood, sleep, activity, or journal).',
      });
      return;
    }

    const result = await runTransaction('wellness.dailyCheckin', async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) {
        throw new TransactionError(404, 'User account not found.');
      }

      let createdMood = null;
      let createdSleep = null;
      let createdActivity = null;
      let createdJournal = null;

      // Step 1: MoodLog
      if (mood) {
        if (!mood.mood || !mood.emoji) {
          throw new TransactionError(
            400,
            'Mood section requires both mood and emoji. Rolling back daily check-in.'
          );
        }
        createdMood = await tx.moodLog.create({
          data: {
            mood: String(mood.mood).trim(),
            emoji: String(mood.emoji).trim(),
            note: encryptSensitiveText(mood.note ? String(mood.note).trim() : null),
            userId,
          },
        });
      }

      // Step 2: SleepLog
      if (sleep) {
        const parsedHours = parseFloat(sleep.hours);
        if (isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 24 || !sleep.quality) {
          throw new TransactionError(
            400,
            'Sleep section requires valid hours (0-24) and quality. Rolling back daily check-in.'
          );
        }
        createdSleep = await tx.sleepLog.create({
          data: {
            hours: parsedHours,
            quality: String(sleep.quality).trim(),
            userId,
          },
        });
      }

      // Step 3: ActivityLog
      if (activity) {
        const parsedDuration = parseInt(activity.duration, 10);
        if (!activity.type || isNaN(parsedDuration) || parsedDuration <= 0) {
          throw new TransactionError(
            400,
            'Activity section requires type and positive duration. Rolling back daily check-in.'
          );
        }
        createdActivity = await tx.activityLog.create({
          data: {
            type: String(activity.type).trim(),
            duration: parsedDuration,
            userId,
          },
        });
      }

      // Step 4: JournalEntry
      if (journal) {
        if (!journal.content || !String(journal.content).trim()) {
          throw new TransactionError(
            400,
            'Journal section cannot be empty. Rolling back daily check-in.'
          );
        }
        createdJournal = await tx.journalEntry.create({
          data: {
            content: encryptSensitiveText(String(journal.content).trim()) || '',
            userId,
          },
        });
      }

      return { createdMood, createdSleep, createdActivity, createdJournal };
    });

    res.status(201).json({
      message: 'Daily wellness check-in committed atomically!',
      moodLog: result.createdMood
        ? { ...result.createdMood, note: decryptSensitiveText(result.createdMood.note) }
        : null,
      sleepLog: result.createdSleep,
      activityLog: result.createdActivity,
      journalEntry: result.createdJournal
        ? { ...result.createdJournal, content: decryptSensitiveText(result.createdJournal.content) }
        : null,
    });
  } catch (error: any) {
    handleRouteError(
      res,
      error,
      'Failed to save daily check-in. All changes were rolled back.',
      'Daily Check-In Error'
    );
  }
});

// GET /api/wellness/all - Load all user wellness records in a single consistent read transaction
router.get('/all', requireAuthUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    // READ TRANSACTION: Consistent point-in-time snapshot across all 4 wellness tables
    const [moodLogs, sleepLogs, activityLogs, journalEntries] = await prisma.$transaction([
      prisma.moodLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.sleepLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.activityLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const decryptedMoodLogs = moodLogs.map((m) => ({
      ...m,
      note: decryptSensitiveText(m.note),
    }));

    const decryptedJournalEntries = journalEntries.map((j) => ({
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

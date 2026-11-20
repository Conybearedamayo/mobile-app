import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import { prisma } from './prisma';
import { runTransaction, TransactionError } from './utils/transaction';
import { encryptSensitiveText } from './services/cryptoService';

/**
 * Automated PostgreSQL ACID Transaction Proof & Exam Demo Script
 * Run with:
 *   npm run test:tx
 * Or with raw PostgreSQL BEGIN / COMMIT / ROLLBACK SQL printed:
 *   $env:LOG_SQL_TRANSACTIONS="true"; npm run test:tx
 */
async function runDemoTests() {
  console.log('\n============================================================');
  console.log('  JUCOCH CAPSTONE — COMMIT & ROLLBACK TRANSACTION PROOF');
  console.log('============================================================\n');

  const initialUserCount = await prisma.user.count();
  console.log(`Initial User Count in Neon PostgreSQL: ${initialUserCount}\n`);

  const suffix = Date.now();
  const tempEmail = `tx_demo_${suffix}@jucoch.test`;
  const tempAlias = `TX_Demo_${suffix}`;
  const hashedPassword = await bcrypt.hash('DemoPass123!', 10);

  let createdUserId: string | null = null;

  try {
    // ------------------------------------------------------------
    // TEST 1: MULTI-TABLE ATOMIC COMMIT (5 TABLES)
    // ------------------------------------------------------------
    console.log('--- TEST 1: Multi-Table COMMIT (User + Mood + Sleep + Activity + Journal) ---');
    const commitResult = await runTransaction('demo.multiTableCommit', async (tx) => {
      const user = await tx.user.create({
        data: {
          alias: tempAlias,
          email: tempEmail,
          password: hashedPassword,
          role: 'Student',
          isVerified: true,
        },
      });

      const mood = await tx.moodLog.create({
        data: {
          mood: 'Great',
          emoji: '😊',
          note: encryptSensitiveText('Committed inside 5-table ACID transaction!'),
          userId: user.id,
        },
      });

      const sleep = await tx.sleepLog.create({
        data: {
          hours: 8,
          quality: 'Excellent',
          userId: user.id,
        },
      });

      const activity = await tx.activityLog.create({
        data: {
          type: 'Meditation',
          duration: 20,
          userId: user.id,
        },
      });

      const journal = await tx.journalEntry.create({
        data: {
          content: encryptSensitiveText('Grateful for passing our DBMS final exam!') || '',
          userId: user.id,
        },
      });

      return { user, mood, sleep, activity, journal };
    });

    createdUserId = commitResult.user.id;

    // Verify outside the transaction that ALL 5 tables were committed
    const [uCheck, mCount1, sCount1, aCount1, jCount1] = await prisma.$transaction([
      prisma.user.findUnique({ where: { id: createdUserId } }),
      prisma.moodLog.count({ where: { userId: createdUserId } }),
      prisma.sleepLog.count({ where: { userId: createdUserId } }),
      prisma.activityLog.count({ where: { userId: createdUserId } }),
      prisma.journalEntry.count({ where: { userId: createdUserId } }),
    ]);

    if (!uCheck || mCount1 !== 1 || sCount1 !== 1 || aCount1 !== 1 || jCount1 !== 1) {
      throw new Error('TEST 1 FAILED: Expected 1 row in each of the 5 tables after COMMIT.');
    }
    console.log(
      `✅ TEST 1 PASSED: COMMIT persisted all 5 tables (User=1, Mood=${mCount1}, Sleep=${sCount1}, Activity=${aCount1}, Journal=${jCount1}).\n`
    );

    // ------------------------------------------------------------
    // TEST 2: FORCED FAILURE ROLLBACK (PROVES 0 PARTIAL SAVES)
    // ------------------------------------------------------------
    console.log('--- TEST 2: Forced-Failure ROLLBACK (Partial Writes Must Be Undone) ---');
    let rollbackTriggered = false;

    try {
      await runTransaction('demo.forcedFailureRollback', async (tx) => {
        // Step 1: Insert a valid MoodLog (would persist if there were NO transaction!)
        await tx.moodLog.create({
          data: {
            mood: 'Amazing',
            emoji: '🤩',
            note: encryptSensitiveText('This row MUST be rolled back!'),
            userId: createdUserId!,
          },
        });

        // Step 2: Insert a valid SleepLog (would also persist if there were NO transaction!)
        await tx.sleepLog.create({
          data: {
            hours: 7.5,
            quality: 'Good',
            userId: createdUserId!,
          },
        });

        // Step 3: Simulate validation / DB failure mid-transaction -> triggers PostgreSQL ROLLBACK
        throw new TransactionError(
          400,
          'Simulated validation failure on Step 3 (invalid activity duration) — forcing ROLLBACK!'
        );
      });
    } catch (err: any) {
      if (err instanceof TransactionError) {
        rollbackTriggered = true;
      } else {
        throw err;
      }
    }

    // Verify outside the transaction that counts did NOT increase (still 1, not 2!)
    const [mCount2, sCount2] = await prisma.$transaction([
      prisma.moodLog.count({ where: { userId: createdUserId } }),
      prisma.sleepLog.count({ where: { userId: createdUserId } }),
    ]);

    if (!rollbackTriggered || mCount2 !== 1 || sCount2 !== 1) {
      throw new Error(
        `TEST 2 FAILED: Expected rollback to keep counts at (1, 1), got Mood=${mCount2}, Sleep=${sCount2}.`
      );
    }
    console.log(
      `✅ TEST 2 PASSED: ROLLBACK completely undid both Step 1 (MoodLog) and Step 2 (SleepLog)! Counts stayed Mood=${mCount2}, Sleep=${sCount2}.\n`
    );

    // ------------------------------------------------------------
    // TEST 3: ADMIN PROTECTION ROLLBACK & 5-TABLE CASCADE COMMIT
    // ------------------------------------------------------------
    console.log('--- TEST 3: Protected Admin ROLLBACK + 5-Table Cascade Delete COMMIT ---');

    // 3A: Prove attempting to delete an official Admin rolls back cleanly
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'Admin' } });
    if (existingAdmin) {
      let adminProtected = false;
      try {
        await runTransaction('demo.adminDeleteProtection', async (tx) => {
          const target = await tx.user.findUnique({ where: { id: existingAdmin.id } });
          if (target?.role === 'Admin') {
            throw new TransactionError(403, 'Cannot delete an official Admin account.');
          }
          await tx.user.delete({ where: { id: existingAdmin.id } });
        });
      } catch (err: any) {
        if (err instanceof TransactionError && err.statusCode === 403) {
          adminProtected = true;
        } else {
          throw err;
        }
      }

      const stillExists = await prisma.user.findUnique({ where: { id: existingAdmin.id } });
      if (!adminProtected || !stillExists) {
        throw new Error('TEST 3A FAILED: Admin account was not protected by ROLLBACK!');
      }
      console.log(
        `✅ TEST 3A PASSED: Protected Admin delete triggered ROLLBACK; Admin "${existingAdmin.alias}" remains intact.`
      );
    }

    // 3B: Run the 5-table atomic cascade delete transaction on our temporary test user
    await runTransaction('demo.fiveTableCascadeDelete', async (tx) => {
      await tx.moodLog.deleteMany({ where: { userId: createdUserId! } });
      await tx.sleepLog.deleteMany({ where: { userId: createdUserId! } });
      await tx.activityLog.deleteMany({ where: { userId: createdUserId! } });
      await tx.journalEntry.deleteMany({ where: { userId: createdUserId! } });
      await tx.user.delete({ where: { id: createdUserId! } });
    });

    const deletedUserCheck = await prisma.user.findUnique({ where: { id: createdUserId } });
    const finalUserCount = await prisma.user.count();

    if (deletedUserCheck !== null || finalUserCount !== initialUserCount) {
      throw new Error(
        `TEST 3B FAILED: Expected user removed and userCount=${initialUserCount}, got ${finalUserCount}.`
      );
    }

    createdUserId = null;
    console.log(
      `✅ TEST 3B PASSED: 5-table cascade delete COMMIT succeeded. Neon DB restored cleanly to ${finalUserCount} users.\n`
    );

    console.log('============================================================');
    console.log('  ALL TRANSACTION TESTS PASSED (COMMIT & ROLLBACK VERIFIED)');
    console.log('============================================================\n');
  } finally {
    // Safety cleanup if a test threw unexpectedly mid-run
    if (createdUserId) {
      await prisma.user.deleteMany({ where: { id: createdUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runDemoTests().catch((err) => {
  console.error('\n❌ Transaction verification failed:', err);
  process.exit(1);
});

import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import { prisma } from './prisma';
import { runTransaction } from './utils/transaction';

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminAccounts = [
    { email: 'conybeared69@gmail.com', alias: 'Admin_Conybeare', role: 'Admin' },
    { email: 'christiancarlmacan@gmail.com', alias: 'Admin_Christian', role: 'Admin' },
    { email: 'djuciper143@gmail.com', alias: 'Admin_Juspher', role: 'Admin' },
  ];

  // ATOMIC SEED TRANSACTION: Either ALL 3 Official Admin Accounts are seeded/updated, or NONE (ROLLBACK)
  await runTransaction('seed.adminAccounts', async (tx) => {
    for (const admin of adminAccounts) {
      const existing = await tx.user.findFirst({
        where: {
          OR: [{ email: admin.email }, { alias: admin.alias }],
        },
      });

      if (!existing) {
        await tx.user.create({
          data: {
            alias: admin.alias,
            email: admin.email,
            password: hashedPassword,
            role: admin.role,
            isVerified: true,
          },
        });
        console.log(`Created Official Admin Account: ${admin.email} (${admin.alias})`);
      } else {
        await tx.user.update({
          where: { id: existing.id },
          data: { role: 'Admin', isVerified: true },
        });
        console.log(`Updated Admin Account Role: ${admin.email}`);
      }
    }
  });
}

main()
  .catch((e) => {
    console.error('Seed transaction rolled back due to error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import bcrypt from 'bcrypt';
import { prisma } from './prisma';

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminAccounts = [
    { email: 'conybeared69@gmail.com', alias: 'Admin_Conybeare', role: 'Admin' },
    { email: 'christiancarlmacan@gmail.com', alias: 'Admin_Christian', role: 'Admin' },
  ];

  for (const admin of adminAccounts) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: admin.email }, { alias: admin.alias }],
      },
    });

    if (!existing) {
      await prisma.user.create({
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
      // Update existing user role to Admin
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: 'Admin', isVerified: true },
      });
      console.log(`Updated Admin Account Role: ${admin.email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

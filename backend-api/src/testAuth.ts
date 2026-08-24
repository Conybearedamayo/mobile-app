import dotenv from 'dotenv';
dotenv.config();
import { prisma } from './prisma';

async function auditSystem() {
  console.log('--- System Health Check ---');
  try {
    const count = await prisma.user.count();
    console.log('✅ Neon Database Connected. Users in DB:', count);
  } catch (e: any) {
    console.error('Test Error:', e.message);
  }
}

auditSystem();

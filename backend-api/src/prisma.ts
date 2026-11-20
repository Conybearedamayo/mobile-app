import { PrismaClient } from '@prisma/client';

const logSql = process.env.LOG_SQL_TRANSACTIONS === 'true';

export const prisma = new PrismaClient({
  log: logSql ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

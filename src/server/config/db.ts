import { PrismaClient } from '@prisma/client';

if (process.env.VERCEL && (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('/tmp/'))) {
  process.env.DATABASE_URL = 'file:/tmp/dev.db';
}

export const prisma = new PrismaClient();

export default prisma;

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
        try {
            const candidates = [
                path.join(process.cwd(), 'prisma/dev.db'),
                path.join(process.cwd(), 'dev.db'),
                path.join(process.cwd(), '../prisma/dev.db')
            ];
            for (const srcPath of candidates) {
                if (fs.existsSync(srcPath)) {
                    fs.copyFileSync(srcPath, tmpDbPath);
                    break;
                }
            }
        }
        catch (err) {
            console.error('Failed to copy bundled dev.db on Vercel:', err);
        }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
}
export const prisma = new PrismaClient();
export default prisma;

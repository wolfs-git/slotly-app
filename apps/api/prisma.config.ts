import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// В CI переменные приходят из окружения, файла .env там нет
if (existsSync('../../.env')) process.loadEnvFile('../../.env');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? '' },
});

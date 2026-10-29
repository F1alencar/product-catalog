import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const {
  POSTGRES_USER = 'postgres',
  POSTGRES_PASSWORD = 'postgres',
  POSTGRES_HOST = 'localhost',
  POSTGRES_PORT = '5432',
  POSTGRES_DB = 'product_catalog',
} = process.env;

// Monta a DATABASE_URL a partir das variáveis POSTGRES_* e a exporta
// para o Prisma CLI (schema.prisma referencia env("DATABASE_URL")).
// Assim a URL nunca precisa ser declarada (e duplicada) no .env.
process.env.DATABASE_URL ??= `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});

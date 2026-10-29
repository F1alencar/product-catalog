import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  POSTGRES_USER: z.string().min(1, 'POSTGRES_USER é obrigatória'),
  POSTGRES_PASSWORD: z.string().min(1, 'POSTGRES_PASSWORD é obrigatória'),
  POSTGRES_DB: z.string().min(1, 'POSTGRES_DB é obrigatória'),
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  PORT: z.coerce.number().int().positive().default(3000),
});

export function buildDatabaseUrl(env: {
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
}): string {
  return `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}?schema=public`;
}

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas ou ausentes:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error('Verifique o arquivo .env (use o .env.example como referência).');
  process.exit(1);
}

const env = parsed.data;

export const config = {
  port: env.PORT,
  database: {
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    name: env.POSTGRES_DB,
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    url: buildDatabaseUrl(env),
  },
} as const;

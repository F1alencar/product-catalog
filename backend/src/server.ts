import { PrismaClient } from '@prisma/client';
import { createApp } from './app';
import { config } from './config/env';

const prisma = new PrismaClient({
  datasources: { db: { url: config.database.url } },
});
const app = createApp(prisma);

app.listen(config.port, () => {
  console.log(`Servidor rodando em http://localhost:${config.port}`);
  console.log(`Documentação Swagger em http://localhost:${config.port}/api-docs`);
});

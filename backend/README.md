# Backend — Product Catalog API

API REST para gerenciamento do catálogo de produtos. Documentação geral do projeto no [README da raiz](../README.md).

## Stack

- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** via **Prisma** (migrations versionadas em [prisma/migrations/](prisma/migrations))
- **zod** — validação de body, params e query em middleware
- **Swagger UI** — documentação interativa em `/api-docs`
- **Vitest** + **supertest** — testes unitários e de integração

## Comandos

```bash
npm run dev              # API com hot reload em http://localhost:3000
npm run build            # Compila para dist/
npm start                # Roda a versão compilada
npm test                 # Testes
npm run test:coverage    # Testes com cobertura
npm run prisma:migrate   # Cria/aplica migrations
npm run prisma:seed      # Popula o banco com produtos de exemplo
```

## Variáveis de ambiente

Copie `.env.example` para `.env` (o `npm run setup` da raiz faz isso automaticamente). A `DATABASE_URL` do Prisma é montada automaticamente a partir das variáveis `POSTGRES_*` — ver [prisma.config.ts](prisma.config.ts) e [src/config/env.ts](src/config/env.ts).

## Arquitetura

```
routes → middlewares (validação zod) → controllers → services → repositories → Prisma
```

- **Injeção de dependência manual** em [src/app.ts](src/app.ts) (`createApp(prisma)`), permitindo testes de integração com Prisma mockado
- **Erros de domínio** (`NotFoundError`, `ConflictError`) mapeados para status HTTP no [errorHandler](src/middlewares/errorHandler.ts)
- **Paginação** em `GET /products` (`page`/`limit`, máx. 100) e **índice** na coluna `category`

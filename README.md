# Product Catalog — Gerenciamento de Catálogo de Produtos

Aplicação fullstack para gerenciamento de catálogo de produtos, com API REST (Node.js + Express + PostgreSQL/Prisma) e interface em React.

> O enunciado do desafio está preservado em [DESAFIO.md](./DESAFIO.md).

## Sumário

- [Guia de Execução](#guia-de-execução)
- [Decisões Técnicas](#decisões-técnicas)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Documentação da API](#documentação-da-api)
- [Testes](#testes)
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## Guia de Execução

### Pré-requisitos

- **Node.js** 20+ (verificado automaticamente pelo setup; há um `.nvmrc` na raiz para quem usa nvm/fnm)
- **Docker** rodando (para o PostgreSQL — também verificado pelo setup)

O `npm run setup` faz uma verificação de pré-requisitos antes de começar e falha com mensagem clara se o Node for antigo ou o Docker não estiver disponível — em vez de quebrar no meio com um erro obscuro.

#### Instalando os pré-requisitos

**Node.js 20+**

| Método | Comando / Link |
| :----- | :------------- |
| Download oficial | https://nodejs.org (versão LTS) |
| nvm (macOS/Linux) | `nvm install` — lê o `.nvmrc` da raiz automaticamente |
| fnm | `fnm use` — idem |
| Homebrew (macOS) | `brew install node@20` |
| Windows | https://nodejs.org ou `winget install OpenJS.NodeJS.LTS` |

**Docker**

| Plataforma | Comando / Link |
| :--------- | :------------- |
| macOS / Windows | [Docker Desktop](https://docs.docker.com/get-docker/) |
| Ubuntu/Debian | `sudo apt install docker.io docker-compose-v2` ou [guia oficial](https://docs.docker.com/engine/install/) |
| Homebrew (macOS) | `brew install --cask docker` |

Após instalar o Docker, certifique-se de que o daemon está rodando (`docker info` deve responder sem erro).

### Setup completo (um comando)

Na raiz do repositório:

```bash
npm run setup
```

Esse comando instala as dependências de backend e frontend, cria os arquivos `.env` a partir dos `.env.example`, sobe o PostgreSQL via Docker, aplica as migrations e popula o banco com produtos de exemplo (seed).

### Rodando a aplicação

```bash
npm run dev
```

Sobe backend e frontend juntos, aguardando cada um ficar disponível:

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **Swagger (documentação interativa)**: http://localhost:3000/api-docs

Ao encerrar com `Ctrl+C`, o script pergunta se você também quer parar o banco de dados.

### Parando o banco

```bash
npm run stop
```

### Comandos individuais

```bash
# Backend (pasta backend/)
npm run dev              # API com hot reload (tsx watch)
npm run build            # Compila para dist/
npm start                # Roda a versão compilada
npm test                 # Testes unitários e de integração
npm run test:coverage    # Testes com relatório de cobertura
npm run prisma:migrate   # Cria/aplica migrations
npm run prisma:seed      # Popula o banco com exemplos

# Frontend (pasta frontend/)
npm run dev              # Vite dev server
npm run build            # Build de produção (tsc + vite)
npm run lint             # Oxlint
npx vitest run           # Testes
```

---

## Decisões Técnicas

### Backend — Express + Prisma + PostgreSQL

**Por que Express (e não Fastify ou NestJS)?** O desafio permite as três opções. O NestJS foi descartado por adicionar complexidade (decorators, módulos, DI container) desproporcional ao tamanho do domínio — um único agregado (`Product`). O Fastify tem performance superior, mas o gargalo desta aplicação é o banco, não o framework HTTP; o Express venceu pela familiaridade do ecossistema e pela simplicidade de testar com supertest. A mesma lógica de "complexidade proporcional ao domínio" guiou outras escolhas abaixo.

- **Arquitetura em camadas** com responsabilidades separadas:
  - `routes/` → definição das rotas e aplicação dos middlewares de validação
  - `controllers/` → recebem a requisição, chamam o service e formatam a resposta HTTP
  - `services/` → regras de negócio (unicidade de id, normalização de categoria, erros de domínio)
  - `repositories/` → acesso ao banco via Prisma, traduzindo erros do ORM (ex.: `P2025` → `null`)
  
  A separação permite testar as regras de negócio sem subir HTTP (testes unitários do service) e testar o HTTP sem banco (integração com repository mockado). O trade-off aceito: para um CRUD simples, algumas camadas são "pass-through" finas — mas o custo se paga na primeira regra de negócio não trivial (ex.: normalização de categoria, conflito de id).

- **Injeção de dependência manual** em [app.ts](backend/src/app.ts): `createApp(prisma)` recebe o client e monta a cadeia Repository → Service → Controller. Optou-se por *não* usar um container de DI (tsyringe, Inversify): com três colaboradores, a composição explícita na factory é mais legível e já entrega o benefício essencial — testes de integração com Prisma mockado, sem banco real.

- **Validação com zod em middleware** ([validate.ts](backend/src/middlewares/validate.ts)): body, params e query são validados **antes** de chegar ao controller, retornando `400` com lista de erros por campo. A validação fica declarada na rota (ao lado do path), não escondida dentro do handler — e o controller só recebe dados já válidos.

- **Erros de domínio tipados** ([AppError.ts](backend/src/errors/AppError.ts)): `NotFoundError` (404) e `ConflictError` (409) sobem pelo `next(error)` até o [errorHandler](backend/src/middlewares/errorHandler.ts), que também trata JSON malformado (400) e erros inesperados (500, sem vazar stack trace ao cliente). O service não conhece HTTP — quem mapeia erro de domínio para status code é o middleware, mantendo a camada de negócio reutilizável (ex.: em um futuro worker ou CLI).

- **Paginação obrigatória** em `GET /products` via `page`/`limit` (padrão 10, máx. 100), com `skip`/`take` + `count` executados em paralelo (`Promise.all`) no Prisma. Decisão consciente de **quebrar o contrato original** (array puro → envelope `{ data, total, page, limit, totalPages }`): uma listagem sem limite é um problema latente que só aparece em produção, quando o catálogo cresce. O teto de 100 no `limit` protege contra clientes pedindo páginas gigantes.

- **Índice em `category`** ([migrations](backend/prisma/migrations/)): existe um endpoint inteiro de busca por categoria (`GET /products/category/:category`), então a coluna foi indexada via migration dedicada. Sem índice, essa consulta degrada para *full table scan* conforme o volume cresce.

- **`DATABASE_URL` derivada, nunca duplicada**: o [prisma.config.ts](backend/prisma.config.ts) monta a URL de conexão a partir das variáveis `POSTGRES_*`. Declarar a URL pronta no `.env` criaria duas fontes da verdade — mudar a senha em um lugar e esquecer no outro é uma falha clássica. A validação das envs no boot ([env.ts](backend/src/config/env.ts), com zod) faz a aplicação **falhar rápido** com mensagem clara, em vez de quebrar com erro obscuro do Prisma na primeira query.

- **Swagger como documento OpenAPI 3** em [swagger.ts](backend/src/docs/swagger.ts), servido em `/api-docs`. Trade-off conhecido: o documento é escrito à mão e pode divergir dos schemas zod. A alternativa avaliada foi gerar o OpenAPI a partir dos schemas (`zod-to-openapi`); foi descartada para não adicionar uma dependência de geração neste escopo, mas é a evolução natural se a API crescer.

### Frontend — React 19 + Vite + Tailwind CSS v4

**Por que Tailwind (e não styled-components, CSS Modules ou outra)?** O projeto nasceu com styled-components e foi **migrado para Tailwind CSS v4** durante o desenvolvimento. Os motivos da migração:

- **Zero runtime**: styled-components gera CSS em JavaScript no browser; o Tailwind extrai CSS estático em build (o bundle final tem ~14 kB de CSS com apenas as classes usadas).
- **Design tokens centralizados sem provider**: o bloco `@theme` em [index.css](frontend/src/index.css) define cores e raios como variáveis CSS (`--color-primary`, `--radius-md`), eliminando o `ThemeProvider` e o `createGlobalStyle` — menos código, mesmo resultado.
- **Migração sem quebra de API**: os componentes compartilhados mantiveram as mesmas props (`$variant`, `$hasError`), então nenhum consumidor precisou mudar.

- **Componentes compartilhados** em [src/components/](frontend/src/components) (`Button`, `Input`, `Card`, `Modal`) com variantes, reutilizados em todas as telas — o **mesmo formulário atende criação e edição** (o `ProductForm` recebe `product?` opcional e ajusta valores iniciais, rótulos e o campo `id` desabilitado em edição).

- **Formulários com react-hook-form + zod**: a validação client-side replica as regras do backend (mesmos limites e mensagens), dando feedback imediato sem round-trip. `react-hook-form` foi escolhido por ser *uncontrolled* por padrão (menos re-renders que controlar cada campo com `useState`) e pela integração direta com zod via `@hookform/resolvers`. Campos de preço e estoque usam máscaras de input ([masks.ts](frontend/src/utils/masks.ts)): o usuário digita dígitos e vê `3.499,90`; o schema converte para número antes de validar.

- **Estado de dados centralizado** no hook [useProducts](frontend/src/features/products/hooks/useProducts.ts): carregamento paginado, mutações e refresh. Duas decisões importantes:
  - **Erros de listagem e de mutação são independentes**: uma falha ao salvar no modal é retornada ao formulário (`{ success: false, error }`) e exibida **apenas dentro do modal**; o estado `error` global é exclusivo de falhas ao carregar a lista. Sem essa separação, o mesmo erro aparecia duplicado nos dois lugares.
  - **Refetch após mutação** em vez de atualização otimista: com paginação, inserir/remover um item localmente poderia deixar a página inconsistente (ex.: excluir o último item da página 2). O refetch garante consistência ao custo de uma requisição extra — trade-off aceito pela simplicidade. Se o volume de interações crescer, a evolução natural é TanStack Query (cache, invalidação e estados por mutação).

- **Camada HTTP centralizada** em [api/](frontend/src/features/products/api): uma única instância axios ([client.ts](frontend/src/features/products/api/client.ts)) com `baseURL` via env e interceptor que converte erros da API em `Error` com a mensagem amigável do backend — incluindo o caso de **servidor fora do ar** ("Não foi possível conectar ao servidor..."), que o axios reporta sem `response`. Os componentes nunca veem `AxiosError`.

### Convenções

- **Código em inglês, mensagens em português**: identificadores, funções e classes seguem o padrão da indústria; mensagens de validação e erro usam PT-BR porque são exibidas ao usuário final — o backend é a fonte das mensagens de erro de domínio, e o interceptor do frontend as repassa sem traduzir.
- **Monorepo simples** com scripts orquestradores na raiz ([scripts/](scripts/)): `npm run setup` é idempotente (instala deps, cria `.env` se ausente, sobe o banco, aplica migrations e seed) e `npm run dev` sobe os dois lados aguardando a saúde de cada um. Optou-se por **não** usar ferramentas de workspace (Turborepo, npm workspaces): com dois pacotes sem código compartilhado, scripts Node puros são mais transparentes e não exigem configuração extra de ferramentas (Vite, Prisma CLI e docker-compose esperam `.env` no diretório de cada pacote).
- **`.env` por pacote, não centralizado**: o Vite só lê `.env` do diretório do frontend, e um arquivo único na raiz criaria risco de vazamento de segredos para o bundle (tudo com prefixo `VITE_` é embutido no JavaScript público). A separação física é uma barreira de segurança por convenção.

### Limitações conhecidas e próximos passos

Decisões adiadas conscientemente, com o caminho de evolução mapeado:

- **Race condition no `create`**: a verificação de id duplicado é *check-then-act*; sob concorrência, o banco protege (PK única), mas o erro seria 500 genérico. Evolução: capturar o `P2002` do Prisma no repository e mapear para `ConflictError`.
- **Sem autenticação/autorização**: fora do escopo do desafio; a camada de middlewares já é o ponto de extensão natural.
- **Sem cache de queries no frontend**: o `useProducts` atende ao volume atual; TanStack Query é a evolução planejada.
- **Observabilidade mínima**: erros inesperados vão para `console.error`; em produção, logging estruturado (pino) e health check (`GET /health` consultando o banco) seriam os próximos passos.

---

## Variáveis de Ambiente

Cada pacote tem seu próprio `.env`, criado automaticamente pelo `npm run setup` a partir do `.env.example`.

### Backend — [backend/.env.example](backend/.env.example)

| Variável            | Descrição                              | Padrão            |
| :------------------ | :------------------------------------- | :---------------- |
| `POSTGRES_USER`     | Usuário do PostgreSQL                  | `postgres`        |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL (apenas dev local) | `postgres`        |
| `POSTGRES_DB`       | Nome do banco                          | `product_catalog` |
| `POSTGRES_HOST`     | Host do banco                          | `localhost`       |
| `POSTGRES_PORT`     | Porta do banco                         | `5432`            |
| `PORT`              | Porta da API                           | `3000`            |

> A `DATABASE_URL` do Prisma **não** precisa ser declarada: ela é montada a partir das variáveis acima (ver [prisma.config.ts](backend/prisma.config.ts) e [env.ts](backend/src/config/env.ts)). Se alterar credenciais, recrie o container: `docker compose up -d --force-recreate`.

### Frontend — [frontend/.env.example](frontend/.env.example)

| Variável       | Descrição       | Padrão                 |
| :------------- | :-------------- | :--------------------- |
| `VITE_API_URL` | URL base da API | `http://localhost:3000` |

---

## Documentação da API

Documentação interativa (Swagger UI) disponível em **http://localhost:3000/api-docs** com a API rodando.

Base URL: `http://localhost:3000`

| Método   | Rota                           | Descrição                       | Sucesso | Erros        |
| :------- | :----------------------------- | :------------------------------ | :------ | :----------- |
| `GET`    | `/products`                    | Lista produtos com paginação    | `200`   | `400`        |
| `GET`    | `/products/:id`                | Retorna um produto por ID       | `200`   | `400`, `404` |
| `GET`    | `/products/category/:category` | Lista produtos de uma categoria | `200`   | `400`, `404` |
| `POST`   | `/products`                    | Cria um novo produto            | `201`   | `400`, `409` |
| `PUT`    | `/products/:id`                | Atualiza um produto (parcial)   | `200`   | `400`, `404` |
| `DELETE` | `/products/:id`                | Remove um produto               | `204`   | `400`, `404` |

### Paginação (`GET /products`)

| Query param | Tipo    | Padrão | Regra             |
| :---------- | :------ | :----- | :---------------- |
| `page`      | inteiro | `1`    | mínimo `1`        |
| `limit`     | inteiro | `10`   | entre `1` e `100` |

**Resposta `200`:**

```json
{
  "data": [
    {
      "id": "prod-001",
      "name": "Notebook Dell Inspiron 15",
      "description": "Notebook com processador Intel Core i5, 8GB RAM e SSD 256GB",
      "price": "3499.9",
      "stock": 10,
      "category": "ELETRÔNICOS",
      "createdAt": "2026-10-29T01:59:19.546Z",
      "updatedAt": "2026-10-29T01:59:19.546Z"
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### Regras de negócio

| Campo         | Regra                                                       |
| :------------ | :---------------------------------------------------------- |
| `id`          | Obrigatório, não vazio e **único** (conflito retorna `409`) |
| `name`        | Obrigatório, entre 3 e 120 caracteres                       |
| `price`       | Número positivo maior que 0                                 |
| `stock`       | Inteiro maior ou igual a 0                                  |
| `category`    | Obrigatório, não vazio (normalizado para maiúsculas)        |
| `description` | Opcional                                                    |

### Exemplos

```bash
# Criar produto
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"id":"prod-006","name":"Webcam Logitech C920","price":449.9,"stock":20,"category":"Periféricos"}'

# Listar com paginação
curl "http://localhost:3000/products?page=1&limit=10"

# Atualizar (parcial)
curl -X PUT http://localhost:3000/products/prod-006 \
  -H "Content-Type: application/json" \
  -d '{"price":399.9}'

# Remover
curl -X DELETE http://localhost:3000/products/prod-006
```

### Formato de erro

```json
// 400 — validação
{ "message": "Erro de validação", "errors": [{ "field": "price", "message": "O preço deve ser maior que 0" }] }

// 404 / 409 — domínio
{ "message": "Produto com id 'prod-999' não encontrado" }
{ "message": "Já existe um produto com o id 'prod-001'" }
```

---

## Testes

```bash
# Backend — unitários (service, schemas) e integração (rotas com Prisma mockado)
cd backend && npm test
cd backend && npm run test:coverage   # com relatório de cobertura

# Frontend — componentes (Testing Library) e hook useProducts
cd frontend && npx vitest run
```

- **Backend**: 58 testes cobrindo service (regras de negócio), schemas de validação e todas as rotas via supertest com Prisma mockado.
- **Frontend**: 21 testes cobrindo o formulário (validações, máscaras, submit) e o hook de dados (paginação, mutações, erros).

---

## Estrutura do Projeto

```
├── package.json            # Scripts orquestradores (setup, dev, stop)
├── scripts/                # Automação de setup/dev/stop (Node.js)
├── backend/
│   ├── prisma/             # Schema, migrations e seed
│   ├── src/
│   │   ├── config/         # Validação de variáveis de ambiente (zod)
│   │   ├── routes/         # Definição das rotas
│   │   ├── controllers/    # Camada HTTP
│   │   ├── services/       # Regras de negócio
│   │   ├── repositories/   # Acesso ao banco (Prisma)
│   │   ├── schemas/        # Schemas de validação (zod)
│   │   ├── middlewares/    # Validação e tratamento de erros
│   │   ├── errors/         # Erros de domínio (AppError)
│   │   └── docs/           # Documento OpenAPI (Swagger)
│   └── tests/              # Testes unitários e de integração
└── frontend/
    └── src/
        ├── components/     # Componentes compartilhados (Button, Input, Card, Modal)
        ├── features/products/
        │   ├── api/        # Cliente HTTP (axios) e endpoints
        │   ├── components/ # ProductForm, ProductList, ConfirmDialog, etc.
        │   ├── hooks/      # useProducts (estado e mutações)
        │   ├── schemas/    # Schema do formulário (zod)
        │   └── types/      # Tipos do domínio
        ├── pages/          # ProductsPage
        └── utils/          # Máscaras e formatadores
```

# Frontend — Product Catalog

Interface React para gerenciamento do catálogo de produtos. Documentação geral do projeto no [README da raiz](../README.md).

## Stack

- **React 19** + **TypeScript**
- **Vite** (dev server e build)
- **Tailwind CSS v4** (`@tailwindcss/vite`) — tokens de design no bloco `@theme` de [src/index.css](src/index.css)
- **react-hook-form** + **zod** — formulários e validação client-side
- **axios** — camada HTTP centralizada em [src/features/products/api/](src/features/products/api)
- **Vitest** + **Testing Library** — testes

## Comandos

```bash
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
npm run lint     # oxlint
npx vitest run   # testes
```

## Variáveis de ambiente

Copie `.env.example` para `.env` (o `npm run setup` da raiz faz isso automaticamente):

| Variável       | Descrição       | Padrão                 |
| :------------- | :-------------- | :--------------------- |
| `VITE_API_URL` | URL base da API | `http://localhost:3000` |

## Organização

- `src/components/` — componentes compartilhados (`Button`, `Input`, `Card`, `Modal`) com variantes
- `src/features/products/` — feature de produtos (api, components, hooks, schemas, types)
- `src/pages/` — páginas da aplicação
- `src/utils/` — máscaras de input e formatadores

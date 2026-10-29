# Desafio Técnico: Gerenciamento de Catálogo de Produtos

Bem-vindo ao desafio técnico para a seleção de desenvolvedores! O objetivo deste teste é avaliar sua capacidade de construir uma aplicação fullstack funcional, organizada e escalável.

---

## 1. O Desafio

Você deve construir uma aplicação de **Gerenciamento de Catálogo de Produtos**. O foco é demonstrar como você organiza o código, separa responsabilidades e lida com a integração entre as camadas de uma aplicação.

A solução é composta por:

- **Frontend**: Interface para o vendedor gerenciar o catálogo.
- **Backend**: API REST para operações de CRUD.
- **Banco de Dados**: Persistência real dos dados.
- **Testes Unitários**: Faça testes unitários para ter a maior parte da cobertura possível

---

## 2. Requisitos Técnicos

### 2.1 Backend (Node.js)

Escolha entre **Express**, **Fastify** ou **NestJS**. Faça a documentação dos endpoint com **Swagger**

#### Endpoints Obrigatórios:

| Método   | Rota            | Descrição                     |
| :------- | :-------------- | :---------------------------- |
| `GET`    | `/products`     | Lista todos os produtos       |
| `GET`    | `/products/:id` | Retorna um produto por ID     |
| `POST`   | `/products`     | Cria um novo produto          |
| `PUT`    | `/products/:id` | Atualiza um produto existente |
| `DELETE` | `/products/:id` | Remove um produto             |

#### Regras de Negócio:

- `name`: Obrigatório, entre 3 e 120 caracteres.
- `price`: Número positivo maior que 0.
- `stock`: Inteiro maior ou igual a 0.
- `category`: Obrigatório e não vazio.
- **Banco de Dados**: PostgreSQL (via Prisma) ou MongoDB (via Mongoose).

### 2.2 Frontend (React.js)

#### Funcionalidades:

- Listagem de produtos consumindo a API.
- Formulário para criação e edição (Nome, Descrição, Preço, Estoque, Categoria).
- Exclusão de produto com confirmação prévia.
- Feedback visual de **Loading** e **Erro** para operações assíncronas.

---

## 3. Critérios de Avaliação

1. **Organização e Clean Code**: Estrutura de pastas, nomenclatura semântica e separação de responsabilidades (Rotas, Controllers, Logic).
2. **Consumo de API e Estado**: Centralização de chamadas HTTP, tratamento de erros com `try/catch` e sincronização do estado da UI.
3. **Validação**: Feedback claro tanto no Backend (status HTTP corretos) quanto no Frontend (mensagens úteis ao usuário).
4. **Reutilização**: Uso inteligente de componentes (ex: mesmo formulário para Create/Edit).

---

## 4. O Que Entregar

O projeto deve ser enviado via repositório público (GitHub, GitLab ou Bitbucket) contendo um `README.md` com:

1. **Guia de Execução**: Passo a passo para rodar o projeto localmente.
2. **Decisões Técnicas**: Breve explicação das escolhas de arquitetura e ferramentas.
3. **Variáveis de Ambiente**: Arquivo `.env.example` com as chaves necessárias.
4. **Documentação da API**: Lista dos endpoints disponíveis.

---

**Boa sorte! estamos ansiosos para ver sua solução.**

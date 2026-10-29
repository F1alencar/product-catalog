export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Product Catalog API',
    description: 'API REST para gerenciamento de catálogo de produtos',
    version: '1.0.0',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
  tags: [{ name: 'Products', description: 'Operações do catálogo de produtos' }],
  paths: {
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Lista os produtos com paginação',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Número da página (começa em 1)',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Quantidade de itens por página (máx. 100)',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          200: {
            description: 'Página de produtos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedProducts' },
              },
            },
          },
          400: {
            description: 'Parâmetros de paginação inválidos',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Cria um novo produto',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProduct' },
            },
          },
        },
        responses: {
          201: {
            description: 'Produto criado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Product' } },
            },
          },
          400: {
            description: 'Erro de validação',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } },
            },
          },
          409: {
            description: 'Já existe um produto com o id informado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
    '/products/category/{category}': {
      get: {
        tags: ['Products'],
        summary: 'Lista produtos por categoria',
        description: 'A busca é case-insensitive: a categoria é normalizada para UPPERCASE.',
        parameters: [
          {
            name: 'category',
            in: 'path',
            required: true,
            description: 'Categoria dos produtos',
            schema: { type: 'string' },
            example: 'ELETRÔNICOS',
          },
        ],
        responses: {
          200: {
            description: 'Lista de produtos da categoria',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
              },
            },
          },
          404: {
            description: 'Categoria não encontrada',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Retorna um produto por ID',
        parameters: [{ $ref: '#/components/parameters/ProductId' }],
        responses: {
          200: {
            description: 'Produto encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Product' } },
            },
          },
          404: {
            description: 'Produto não encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Atualiza um produto existente',
        parameters: [{ $ref: '#/components/parameters/ProductId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProduct' },
            },
          },
        },
        responses: {
          200: {
            description: 'Produto atualizado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Product' } },
            },
          },
          400: {
            description: 'Erro de validação',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } },
            },
          },
          404: {
            description: 'Produto não encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Remove um produto',
        parameters: [{ $ref: '#/components/parameters/ProductId' }],
        responses: {
          204: { description: 'Produto removido' },
          404: {
            description: 'Produto não encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
  },
  components: {
    parameters: {
      ProductId: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'ID do produto',
        schema: { type: 'string' },
      },
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prod-001' },
          name: { type: 'string', minLength: 3, maxLength: 120, example: 'Notebook Dell Inspiron 15' },
          description: { type: 'string', nullable: true, example: 'Notebook com Intel Core i5' },
          price: { type: 'number', exclusiveMinimum: 0, example: 3499.9 },
          stock: { type: 'integer', minimum: 0, example: 10 },
          category: { type: 'string', example: 'Eletrônicos' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'price', 'stock', 'category'],
      },
      PaginatedProducts: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
          total: { type: 'integer', example: 42 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 5 },
        },
        required: ['data', 'total', 'page', 'limit', 'totalPages'],
      },
      CreateProduct: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prod-006' },
          name: { type: 'string', minLength: 3, maxLength: 120, example: 'Webcam Logitech C920' },
          description: { type: 'string', example: 'Webcam Full HD 1080p' },
          price: { type: 'number', exclusiveMinimum: 0, example: 449.9 },
          stock: { type: 'integer', minimum: 0, example: 20 },
          category: { type: 'string', example: 'Periféricos' },
        },
        required: ['id', 'name', 'price', 'stock', 'category'],
      },
      UpdateProduct: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 120 },
          description: { type: 'string' },
          price: { type: 'number', exclusiveMinimum: 0 },
          stock: { type: 'integer', minimum: 0 },
          category: { type: 'string' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Produto não encontrado' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Erro de validação' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'price' },
                message: { type: 'string', example: 'O preço deve ser maior que 0' },
              },
            },
          },
        },
      },
    },
  },
};

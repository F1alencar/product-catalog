import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { PrismaClient, Prisma } from '@prisma/client';

const makeProduct = (overrides: Record<string, unknown> = {}) => ({
  id: 'prod-001',
  name: 'Notebook Dell Inspiron 15',
  description: 'Notebook com Intel Core i5',
  price: new Prisma.Decimal(3499.9),
  stock: 10,
  category: 'ELETRÔNICOS',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

const prismaMock = {
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

const app = createApp(prismaMock as unknown as PrismaClient);

describe('API /products (integração)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /products', () => {
    it('deve retornar 200 com a página de produtos', async () => {
      prismaMock.product.findMany.mockResolvedValue([makeProduct()]);
      prismaMock.product.count.mockResolvedValue(1);

      const response = await request(app).get('/products');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('prod-001');
      expect(response.body).toMatchObject({ total: 1, page: 1, limit: 10, totalPages: 1 });
    });

    it('deve retornar 200 com lista vazia quando não há produtos', async () => {
      prismaMock.product.findMany.mockResolvedValue([]);
      prismaMock.product.count.mockResolvedValue(0);

      const response = await request(app).get('/products');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    });

    it('deve aplicar paginação com skip e take', async () => {
      prismaMock.product.findMany.mockResolvedValue([makeProduct()]);
      prismaMock.product.count.mockResolvedValue(25);

      const response = await request(app).get('/products?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(response.body).toMatchObject({ total: 25, page: 2, limit: 10, totalPages: 3 });
    });

    it('deve retornar 400 quando os parâmetros de paginação são inválidos', async () => {
      const response = await request(app).get('/products?page=0');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Erro de validação');
    });
  });

  describe('GET /products/:id', () => {
    it('deve retornar 200 com o produto encontrado', async () => {
      prismaMock.product.findUnique.mockResolvedValue(makeProduct());

      const response = await request(app).get('/products/prod-001');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('prod-001');
    });

    it('deve retornar 404 quando o produto não existe', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/products/inexistente');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('inexistente');
    });
  });

  describe('GET /products/category/:category', () => {
    it('deve retornar 200 com os produtos da categoria', async () => {
      prismaMock.product.findMany.mockResolvedValue([makeProduct()]);

      const response = await request(app).get('/products/category/ELETRÔNICOS');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { category: 'ELETRÔNICOS' } }),
      );
    });

    it('deve normalizar a categoria para UPPERCASE na busca', async () => {
      prismaMock.product.findMany.mockResolvedValue([makeProduct()]);

      const response = await request(app).get('/products/category/eletrônicos');

      expect(response.status).toBe(200);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { category: 'ELETRÔNICOS' } }),
      );
    });

    it('deve retornar 404 quando a categoria não existe', async () => {
      prismaMock.product.findMany.mockResolvedValue([]);

      const response = await request(app).get('/products/category/INEXISTENTE');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('INEXISTENTE');
    });
  });

  describe('POST /products', () => {
    const validBody = {
      id: 'prod-006',
      name: 'Webcam Logitech C920',
      price: 449.9,
      stock: 20,
      category: 'periféricos',
    };

    it('deve retornar 201 e normalizar a categoria para UPPERCASE', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);
      prismaMock.product.create.mockImplementation(({ data }) =>
        Promise.resolve(makeProduct(data)),
      );

      const response = await request(app).post('/products').send(validBody);

      expect(response.status).toBe(201);
      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ category: 'PERIFÉRICOS' }),
      });
    });

    it('deve retornar 409 quando o id já existe', async () => {
      prismaMock.product.findUnique.mockResolvedValue(makeProduct());

      const response = await request(app).post('/products').send(validBody);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('prod-006');
      expect(prismaMock.product.create).not.toHaveBeenCalled();
    });

    it('deve retornar 400 com erros por campo quando o body é inválido', async () => {
      const response = await request(app).post('/products').send({
        id: '',
        name: 'ab',
        price: -5,
        stock: 1.5,
        category: '',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Erro de validação');
      const fields = response.body.errors.map((e: { field: string }) => e.field);
      expect(fields).toEqual(
        expect.arrayContaining(['id', 'name', 'price', 'stock', 'category']),
      );
    });

    it('deve retornar 400 quando campos obrigatórios estão ausentes', async () => {
      const response = await request(app).post('/products').send({});

      expect(response.status).toBe(400);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /products/:id', () => {
    it('deve retornar 200 com o produto atualizado', async () => {
      prismaMock.product.update.mockResolvedValue(makeProduct({ price: new Prisma.Decimal(2999) }));

      const response = await request(app).put('/products/prod-001').send({ price: 2999 });

      expect(response.status).toBe(200);
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-001' },
        data: { price: 2999 },
      });
    });

    it('deve normalizar a categoria para UPPERCASE na atualização', async () => {
      prismaMock.product.update.mockResolvedValue(makeProduct());

      const response = await request(app)
        .put('/products/prod-001')
        .send({ category: 'móveis' });

      expect(response.status).toBe(200);
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-001' },
        data: { category: 'MÓVEIS' },
      });
    });

    it('deve retornar 404 quando o produto não existe', async () => {
      prismaMock.product.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '6.0.0',
        }),
      );

      const response = await request(app).put('/products/inexistente').send({ price: 100 });

      expect(response.status).toBe(404);
    });

    it('deve retornar 400 quando o body é inválido', async () => {
      const response = await request(app).put('/products/prod-001').send({ price: -10 });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].field).toBe('price');
    });
  });

  describe('DELETE /products/:id', () => {
    it('deve retornar 204 quando o produto é removido', async () => {
      prismaMock.product.delete.mockResolvedValue(makeProduct());

      const response = await request(app).delete('/products/prod-001');

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('deve retornar 404 quando o produto não existe', async () => {
      prismaMock.product.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '6.0.0',
        }),
      );

      const response = await request(app).delete('/products/inexistente');

      expect(response.status).toBe(404);
    });
  });

  describe('tratamento de casos extremos', () => {
    it('deve retornar 400 para JSON malformado', async () => {
      const response = await request(app)
        .post('/products')
        .set('Content-Type', 'application/json')
        .send('{invalid json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('JSON inválido no corpo da requisição');
    });

    it('deve retornar 404 em JSON para rota inexistente', async () => {
      const response = await request(app).get('/rota-inexistente');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Rota não encontrada');
    });

    it('deve rejeitar campos de texto com apenas espaços', async () => {
      const response = await request(app).post('/products').send({
        id: 'prod-x',
        name: '   ',
        price: 10,
        stock: 1,
        category: 'ELETRÔNICOS',
      });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].field).toBe('name');
    });

    it('deve retornar 400 para PUT com body vazio', async () => {
      const response = await request(app).put('/products/prod-001').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Erro de validação');
    });
  });

  describe('tratamento de erros inesperados', () => {
    it('deve retornar 500 com mensagem genérica para erros não tratados', async () => {
      prismaMock.product.findMany.mockRejectedValue(new Error('falha de conexão'));

      const response = await request(app).get('/products');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Erro interno do servidor');
    });
  });
});

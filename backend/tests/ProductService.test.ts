import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '../src/services/ProductService';
import { ProductRepository } from '../src/repositories/ProductRepository';
import { NotFoundError, ConflictError } from '../src/errors/AppError';
import { Product } from '@prisma/client';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-001',
  name: 'Notebook Dell',
  description: 'Notebook i5',
  price: 3499.9 as unknown as Product['price'],
  stock: 10,
  category: 'Eletrônicos',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ProductService', () => {
  let repository: {
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByCategory: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let service: ProductService;

  beforeEach(() => {
    repository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByCategory: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    service = new ProductService(repository as unknown as ProductRepository);
  });

  describe('listAll', () => {
    it('deve retornar a página de produtos', async () => {
      const paginated = {
        data: [makeProduct(), makeProduct({ id: 'prod-002' })],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      repository.findAll.mockResolvedValue(paginated);

      const result = await service.listAll({ page: 1, limit: 10 });

      expect(result).toEqual(paginated);
      expect(repository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('findById', () => {
    it('deve retornar o produto quando encontrado', async () => {
      const product = makeProduct();
      repository.findById.mockResolvedValue(product);

      const result = await service.findById('prod-001');

      expect(result).toEqual(product);
    });

    it('deve lançar NotFoundError quando o produto não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('inexistente')).rejects.toThrow(NotFoundError);
      await expect(service.findById('inexistente')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('findByCategory', () => {
    it('deve retornar os produtos da categoria', async () => {
      const products = [makeProduct(), makeProduct({ id: 'prod-004' })];
      repository.findByCategory.mockResolvedValue(products);

      const result = await service.findByCategory('ELETRÔNICOS');

      expect(result).toEqual(products);
      expect(repository.findByCategory).toHaveBeenCalledWith('ELETRÔNICOS');
    });

    it('deve normalizar a categoria para UPPERCASE antes de buscar', async () => {
      repository.findByCategory.mockResolvedValue([makeProduct()]);

      await service.findByCategory('eletrônicos');

      expect(repository.findByCategory).toHaveBeenCalledWith('ELETRÔNICOS');
    });

    it('deve lançar NotFoundError quando a categoria não existe', async () => {
      repository.findByCategory.mockResolvedValue([]);

      await expect(service.findByCategory('INEXISTENTE')).rejects.toThrow(NotFoundError);
      await expect(service.findByCategory('INEXISTENTE')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('create', () => {
    const data = {
      id: 'prod-001',
      name: 'Notebook Dell',
      description: 'Notebook i5',
      price: 3499.9,
      stock: 10,
      category: 'Eletrônicos',
    };

    it('deve criar o produto quando o id é único', async () => {
      repository.findById.mockResolvedValue(null);
      repository.create.mockResolvedValue(makeProduct());

      const result = await service.create(data);

      expect(repository.create).toHaveBeenCalledWith(data);
      expect(result.id).toBe('prod-001');
    });

    it('deve lançar ConflictError quando o id já existe', async () => {
      repository.findById.mockResolvedValue(makeProduct());

      await expect(service.create(data)).rejects.toThrow(ConflictError);
      await expect(service.create(data)).rejects.toMatchObject({ statusCode: 409 });
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar o produto quando ele existe', async () => {
      const updated = makeProduct({ name: 'Notebook Atualizado' });
      repository.update.mockResolvedValue(updated);

      const result = await service.update('prod-001', { name: 'Notebook Atualizado' });

      expect(result.name).toBe('Notebook Atualizado');
      expect(repository.update).toHaveBeenCalledWith('prod-001', { name: 'Notebook Atualizado' });
    });

    it('deve lançar NotFoundError quando o produto não existe', async () => {
      repository.update.mockResolvedValue(null);

      await expect(service.update('inexistente', { name: 'X' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('deve remover o produto quando ele existe', async () => {
      repository.delete.mockResolvedValue(true);

      await expect(service.delete('prod-001')).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith('prod-001');
    });

    it('deve lançar NotFoundError quando o produto não existe', async () => {
      repository.delete.mockResolvedValue(false);

      await expect(service.delete('inexistente')).rejects.toThrow(NotFoundError);
    });
  });
});

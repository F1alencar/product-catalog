import { Product } from '@prisma/client';
import {
  ProductRepository,
  CreateProductData,
  UpdateProductData,
  PaginationParams,
} from '../repositories/ProductRepository';
import { NotFoundError, ConflictError } from '../errors/AppError';
import type { PaginatedResult } from '../schemas/productSchema';

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async listAll(params: PaginationParams): Promise<PaginatedResult<Product>> {
    return this.repository.findAll(params);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundError(`Produto com id '${id}' não encontrado`);
    }
    return product;
  }

  async findByCategory(category: string): Promise<Product[]> {
    const products = await this.repository.findByCategory(category.toUpperCase());
    if (products.length === 0) {
      throw new NotFoundError(`Nenhum produto encontrado para a categoria '${category.toUpperCase()}'`);
    }
    return products;
  }

  async create(data: CreateProductData): Promise<Product> {
    const existing = await this.repository.findById(data.id);
    if (existing) {
      throw new ConflictError(`Já existe um produto com o id '${data.id}'`);
    }
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new NotFoundError(`Produto com id '${id}' não encontrado`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Produto com id '${id}' não encontrado`);
    }
  }
}

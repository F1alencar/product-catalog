import { PrismaClient, Product, Prisma } from '@prisma/client';
import type { PaginatedResult } from '../schemas/productSchema';

export interface CreateProductData {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
}

export type UpdateProductData = Partial<Omit<CreateProductData, 'id'>>;

export interface PaginationParams {
  page: number;
  limit: number;
}

export class ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll({ page, limit }: PaginationParams): Promise<PaginatedResult<Product>> {
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateProductData): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: UpdateProductData): Promise<Product | null> {
    try {
      return await this.prisma.product.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.product.delete({ where: { id } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}

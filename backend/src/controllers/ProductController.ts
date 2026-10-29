import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService';
import { paginationQuerySchema } from '../schemas/productSchema';

export class ProductController {
  constructor(private readonly service: ProductService) {}

  listAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await this.service.listAll({ page, limit });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.findById(req.params.id);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  };

  findByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.service.findByCategory(req.params.category);
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.update(req.params.id, req.body);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

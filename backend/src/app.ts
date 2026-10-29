import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient } from '@prisma/client';
import { ProductRepository } from './repositories/ProductRepository';
import { ProductService } from './services/ProductService';
import { ProductController } from './controllers/ProductController';
import { createProductRoutes } from './routes/productRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { swaggerDocument } from './docs/swagger';

export function createApp(prisma: PrismaClient) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const repository = new ProductRepository(prisma);
  const service = new ProductService(repository);
  const controller = new ProductController(service);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use(createProductRoutes(controller));

  app.use((_req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
  });

  app.use(errorHandler);

  return app;
}

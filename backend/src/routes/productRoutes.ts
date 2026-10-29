import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { validate } from '../middlewares/validate';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  categoryParamSchema,
  paginationQuerySchema,
} from '../schemas/productSchema';

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();

  router.get(
    '/products',
    validate({ query: paginationQuerySchema }),
    controller.listAll,
  );

  router.get(
    '/products/category/:category',
    validate({ params: categoryParamSchema }),
    controller.findByCategory,
  );

  router.get(
    '/products/:id',
    validate({ params: productIdParamSchema }),
    controller.findById,
  );

  router.post(
    '/products',
    validate({ body: createProductSchema }),
    controller.create,
  );

  router.put(
    '/products/:id',
    validate({ params: productIdParamSchema, body: updateProductSchema }),
    controller.update,
  );

  router.delete(
    '/products/:id',
    validate({ params: productIdParamSchema }),
    controller.delete,
  );

  return router;
}

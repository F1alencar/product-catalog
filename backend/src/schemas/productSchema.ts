import { z } from 'zod';

export const createProductSchema = z.object({
  id: z
    .string({ required_error: 'O campo id é obrigatório' })
    .trim()
    .min(1, 'O campo id não pode ser vazio'),
  name: z
    .string({ required_error: 'O campo name é obrigatório' })
    .trim()
    .min(3, 'O nome deve ter no mínimo 3 caracteres')
    .max(120, 'O nome deve ter no máximo 120 caracteres'),
  description: z.string().optional(),
  price: z
    .number({ required_error: 'O campo price é obrigatório', invalid_type_error: 'O preço deve ser um número' })
    .positive('O preço deve ser maior que 0'),
  stock: z
    .number({ required_error: 'O campo stock é obrigatório', invalid_type_error: 'O estoque deve ser um número' })
    .int('O estoque deve ser um número inteiro')
    .min(0, 'O estoque deve ser maior ou igual a 0'),
  category: z
    .string({ required_error: 'O campo category é obrigatório' })
    .trim()
    .min(1, 'O campo category não pode ser vazio')
    .transform((value) => value.toUpperCase()),
});

export const updateProductSchema = createProductSchema
  .omit({ id: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualização',
  });

export const productIdParamSchema = z.object({
  id: z.string().min(1, 'O parâmetro id é obrigatório'),
});

export const categoryParamSchema = z.object({
  category: z.string().min(1, 'O parâmetro category é obrigatório'),
});

export const paginationQuerySchema = z.object({
  page: z.coerce
    .number({ invalid_type_error: 'O parâmetro page deve ser um número' })
    .int('O parâmetro page deve ser um número inteiro')
    .min(1, 'O parâmetro page deve ser maior ou igual a 1')
    .default(1),
  limit: z.coerce
    .number({ invalid_type_error: 'O parâmetro limit deve ser um número' })
    .int('O parâmetro limit deve ser um número inteiro')
    .min(1, 'O parâmetro limit deve ser maior ou igual a 1')
    .max(100, 'O parâmetro limit deve ser no máximo 100')
    .default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

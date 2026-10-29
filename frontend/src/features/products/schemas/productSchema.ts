import { z } from 'zod';
import { unmaskCurrency } from '../../../utils/masks';

export const productFormSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, 'O campo ID é obrigatório'),
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve ter no mínimo 3 caracteres')
    .max(120, 'O nome deve ter no máximo 120 caracteres'),
  description: z.string().optional(),
  price: z
    .string()
    .min(1, 'O campo preço é obrigatório')
    .transform((value) => unmaskCurrency(value))
    .pipe(
      z
        .number({ error: 'O preço deve ser um número' })
        .positive('O preço deve ser maior que 0'),
    ),
  stock: z
    .string({ error: 'O campo estoque é obrigatório' })
    .min(1, 'O campo estoque é obrigatório')
    .transform((value) => Number(value))
    .pipe(
      z
        .number({ error: 'O estoque deve ser um número' })
        .int('O estoque deve ser um número inteiro')
        .min(0, 'O estoque deve ser maior ou igual a 0'),
    ),
  category: z
    .string()
    .trim()
    .min(1, 'O campo categoria é obrigatório'),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;
export type ProductFormInput = z.input<typeof productFormSchema>;

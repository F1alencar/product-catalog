import { describe, it, expect } from 'vitest';
import { createProductSchema, updateProductSchema } from '../src/schemas/productSchema';

const validProduct = {
  id: 'prod-001',
  name: 'Notebook Dell',
  price: 3499.9,
  stock: 10,
  category: 'Eletrônicos',
};

describe('createProductSchema', () => {
  it('deve aceitar um produto válido', () => {
    const result = createProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('deve aceitar produto sem descrição (campo opcional)', () => {
    const result = createProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  describe('id', () => {
    it('deve rejeitar quando ausente', () => {
      const { id, ...rest } = validProduct;
      expect(createProductSchema.safeParse(rest).success).toBe(false);
    });

    it('deve rejeitar quando vazio', () => {
      expect(createProductSchema.safeParse({ ...validProduct, id: '' }).success).toBe(false);
    });
  });

  describe('name', () => {
    it('deve rejeitar nome com menos de 3 caracteres', () => {
      expect(createProductSchema.safeParse({ ...validProduct, name: 'ab' }).success).toBe(false);
    });

    it('deve rejeitar nome com mais de 120 caracteres', () => {
      expect(
        createProductSchema.safeParse({ ...validProduct, name: 'a'.repeat(121) }).success,
      ).toBe(false);
    });

    it('deve aceitar nome com exatamente 3 e 120 caracteres', () => {
      expect(createProductSchema.safeParse({ ...validProduct, name: 'abc' }).success).toBe(true);
      expect(
        createProductSchema.safeParse({ ...validProduct, name: 'a'.repeat(120) }).success,
      ).toBe(true);
    });
  });

  describe('price', () => {
    it('deve rejeitar preço zero', () => {
      expect(createProductSchema.safeParse({ ...validProduct, price: 0 }).success).toBe(false);
    });

    it('deve rejeitar preço negativo', () => {
      expect(createProductSchema.safeParse({ ...validProduct, price: -10 }).success).toBe(false);
    });

    it('deve rejeitar preço não numérico', () => {
      expect(createProductSchema.safeParse({ ...validProduct, price: 'abc' }).success).toBe(false);
    });
  });

  describe('stock', () => {
    it('deve rejeitar estoque negativo', () => {
      expect(createProductSchema.safeParse({ ...validProduct, stock: -1 }).success).toBe(false);
    });

    it('deve rejeitar estoque não inteiro', () => {
      expect(createProductSchema.safeParse({ ...validProduct, stock: 1.5 }).success).toBe(false);
    });

    it('deve aceitar estoque zero', () => {
      expect(createProductSchema.safeParse({ ...validProduct, stock: 0 }).success).toBe(true);
    });
  });

  describe('category', () => {
    it('deve rejeitar categoria ausente', () => {
      const { category, ...rest } = validProduct;
      expect(createProductSchema.safeParse(rest).success).toBe(false);
    });

    it('deve rejeitar categoria vazia', () => {
      expect(createProductSchema.safeParse({ ...validProduct, category: '' }).success).toBe(false);
    });

    it('deve normalizar a categoria para UPPERCASE', () => {
      const result = createProductSchema.safeParse({ ...validProduct, category: 'Eletrônicos' });
      expect(result.success).toBe(true);
      expect((result as { data: { category: string } }).data.category).toBe('ELETRÔNICOS');
    });

    it('deve manter a categoria já em UPPERCASE', () => {
      const result = createProductSchema.safeParse({ ...validProduct, category: 'PERIFÉRICOS' });
      expect(result.success).toBe(true);
      expect((result as { data: { category: string } }).data.category).toBe('PERIFÉRICOS');
    });
  });
});

describe('updateProductSchema', () => {
  it('deve aceitar atualização parcial', () => {
    expect(updateProductSchema.safeParse({ name: 'Novo Nome' }).success).toBe(true);
  });

  it('deve rejeitar objeto vazio (nenhum campo para atualizar)', () => {
    expect(updateProductSchema.safeParse({}).success).toBe(false);
  });

  it('não deve permitir alterar o id', () => {
    const result = updateProductSchema.safeParse({ id: 'outro-id', name: 'Novo Nome' });
    expect(result.success).toBe(true);
    expect((result as { data: Record<string, unknown> }).data.id).toBeUndefined();
  });

  it('deve validar os campos enviados', () => {
    expect(updateProductSchema.safeParse({ price: -5 }).success).toBe(false);
    expect(updateProductSchema.safeParse({ stock: 2.5 }).success).toBe(false);
  });

  it('deve normalizar a categoria para UPPERCASE na atualização', () => {
    const result = updateProductSchema.safeParse({ category: 'móveis' });
    expect(result.success).toBe(true);
    expect((result as { data: { category: string } }).data.category).toBe('MÓVEIS');
  });
});

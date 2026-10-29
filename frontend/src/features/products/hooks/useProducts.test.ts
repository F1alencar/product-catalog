import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProducts } from './useProducts';
import * as productApi from '../api/productApi';
import type { Product } from '../types/product';

vi.mock('../api/productApi');


const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Notebook Dell',
    description: 'Notebook i5',
    price: 3499.9,
    stock: 10,
    category: 'ELETRÔNICOS',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const mockPage = {
  data: mockProducts,
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar os produtos na montagem', async () => {
    vi.mocked(productApi.getProducts).mockResolvedValue(mockPage);

    const { result } = renderHook(() => useProducts());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBeNull();
    expect(result.current.page).toBe(1);
    expect(result.current.total).toBe(1);
    expect(result.current.totalPages).toBe(1);
  });

  it('deve buscar a página solicitada ao mudar de página', async () => {
    vi.mocked(productApi.getProducts).mockResolvedValue(mockPage);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(productApi.getProducts).toHaveBeenCalledWith(1, 10);

    await act(async () => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(productApi.getProducts).toHaveBeenCalledWith(2, 10);
    });
  });

  it('deve definir erro quando a listagem falha', async () => {
    vi.mocked(productApi.getProducts).mockRejectedValue(new Error('Erro de conexão'));

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erro de conexão');
    expect(result.current.products).toEqual([]);
  });

  it('deve criar produto e recarregar a lista', async () => {
    vi.mocked(productApi.getProducts).mockResolvedValue(mockPage);
    vi.mocked(productApi.createProduct).mockResolvedValue(mockProducts[0]);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const newProduct = {
      id: 'prod-002',
      name: 'Mouse Logitech',
      price: 549.9,
      stock: 25,
      category: 'PERIFÉRICOS',
    };

    let mutationResult: Awaited<ReturnType<typeof result.current.createProduct>>;
    await act(async () => {
      mutationResult = await result.current.createProduct(newProduct);
    });

    expect(mutationResult!.success).toBe(true);
    expect(productApi.createProduct).toHaveBeenCalledWith(newProduct);
    expect(productApi.getProducts).toHaveBeenCalledTimes(2);
  });

  it('deve retornar erro quando a criação falha', async () => {
    vi.mocked(productApi.getProducts).mockResolvedValue(mockPage);
    vi.mocked(productApi.createProduct).mockRejectedValue(
      new Error("Já existe um produto com o id 'prod-001'"),
    );

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let mutationResult: Awaited<ReturnType<typeof result.current.createProduct>>;
    await act(async () => {
      mutationResult = await result.current.createProduct({
        id: 'prod-001',
        name: 'Duplicado',
        price: 10,
        stock: 1,
        category: 'X',
      });
    });

    expect(mutationResult!.success).toBe(false);
    expect(mutationResult!.error).toContain('Já existe');
    expect(result.current.error).toBeNull();
  });

  it('deve deletar produto e recarregar a lista', async () => {
    vi.mocked(productApi.getProducts).mockResolvedValue(mockPage);
    vi.mocked(productApi.deleteProduct).mockResolvedValue(undefined);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let mutationResult: Awaited<ReturnType<typeof result.current.deleteProduct>>;
    await act(async () => {
      mutationResult = await result.current.deleteProduct('prod-001');
    });

    expect(mutationResult!.success).toBe(true);
    expect(productApi.deleteProduct).toHaveBeenCalledWith('prod-001');
    expect(productApi.getProducts).toHaveBeenCalledTimes(2);
  });
});

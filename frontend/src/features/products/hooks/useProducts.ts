import { useState, useEffect, useCallback } from 'react';
import type { Product, ProductFormData, UpdateProductData } from '../types/product';
import * as productApi from '../api/productApi';


interface MutationResult {
  success: boolean;
  error?: string;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  createProduct: (data: ProductFormData) => Promise<MutationResult>;
  updateProduct: (id: string, data: UpdateProductData) => Promise<MutationResult>;
  deleteProduct: (id: string) => Promise<MutationResult>;
  refresh: () => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productApi.getProducts(page, limit);
      setProducts(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createProduct = useCallback(
    async (data: ProductFormData): Promise<MutationResult> => {
      try {
        await productApi.createProduct(data);
        await refresh();
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao criar produto';
        return { success: false, error: message };
      }
    },
    [refresh],
  );

  const updateProduct = useCallback(
    async (id: string, data: UpdateProductData): Promise<MutationResult> => {
      try {
        await productApi.updateProduct(id, data);
        await refresh();
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao atualizar produto';
        return { success: false, error: message };
      }
    },
    [refresh],
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<MutationResult> => {
      try {
        await productApi.deleteProduct(id);
        await refresh();
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao excluir produto';
        return { success: false, error: message };
      }
    },
    [refresh],
  );

  return {
    products,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    setPage,
    createProduct,
    updateProduct,
    deleteProduct,
    refresh,
  };
}

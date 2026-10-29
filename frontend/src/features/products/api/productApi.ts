import { apiClient } from './client';
import type { Product, ProductFormData, UpdateProductData, PaginatedProducts } from '../types/product';


export async function getProducts(page = 1, limit = 10): Promise<PaginatedProducts> {
  const { data } = await apiClient.get<PaginatedProducts>('/products', {
    params: { page, limit },
  });
  return data;
}

export async function getProductById(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>(`/products/category/${category}`);
  return data;
}

export async function createProduct(product: ProductFormData): Promise<Product> {
  const { data } = await apiClient.post<Product>('/products', product);
  return data;
}

export async function updateProduct(id: string, product: UpdateProductData): Promise<Product> {
  const { data } = await apiClient.put<Product>(`/products/${id}`, product);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

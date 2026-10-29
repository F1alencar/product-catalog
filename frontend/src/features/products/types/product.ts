export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
}

export type UpdateProductData = Partial<Omit<ProductFormData, 'id'>>;

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

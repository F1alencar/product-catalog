import { useState } from 'react';
import { useProducts } from '../features/products/hooks/useProducts';
import { ProductList } from '../features/products/components/ProductList';
import { ProductForm } from '../features/products/components/ProductForm';
import { ConfirmDialog } from '../features/products/components/ConfirmDialog';
import { Loading } from '../features/products/components/Loading';
import { ErrorMessage } from '../features/products/components/ErrorMessage';
import { Card, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { ModalOverlay, ModalContent, ModalTitle } from '../components/Modal';
import type { Product } from '../features/products/types/product';
import type { ProductFormSchema } from '../features/products/schemas/productSchema';

type FormState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; product: Product };

export function ProductsPage() {
  const {
    products,
    loading,
    error,
    page,
    total,
    totalPages,
    setPage,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();
  const [formState, setFormState] = useState<FormState>({ mode: 'closed' });
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const closeForm = () => setFormState({ mode: 'closed' });

  const handleSubmit = async (data: ProductFormSchema) => {
    if (formState.mode === 'edit') {
      const { id: _, ...updateData } = data;
      return updateProduct(formState.product.id, updateData);
    }
    return createProduct(data);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <main className="mx-auto max-w-[960px] p-6">
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Produtos</CardTitle>
          <Button onClick={() => setFormState({ mode: 'create' })}>Novo Produto</Button>
        </CardHeader>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <Loading />
        ) : (
          <ProductList
            products={products}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            onEdit={(product) => setFormState({ mode: 'edit', product })}
            onDelete={setProductToDelete}
          />
        )}
      </Card>

      {formState.mode !== 'closed' && (
        <ModalOverlay onClick={closeForm}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>
              {formState.mode === 'edit' ? 'Editar Produto' : 'Novo Produto'}
            </ModalTitle>
            <ProductForm
              key={formState.mode === 'edit' ? formState.product.id : 'create'}
              product={formState.mode === 'edit' ? formState.product : undefined}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </ModalContent>
        </ModalOverlay>
      )}

      {productToDelete && (
        <ConfirmDialog
          title="Excluir Produto"
          message={`Tem certeza que deseja excluir "${productToDelete.name}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setProductToDelete(null)}
        />
      )}
    </main>
  );
}

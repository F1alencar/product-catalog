import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, type ProductFormSchema, type ProductFormInput } from '../schemas/productSchema';
import { maskCurrency, maskInteger } from '../../../utils/masks';
import type { Product } from '../types/product';
import { Input, TextArea, Label, FieldError, FormGroup } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { ErrorMessage } from './ErrorMessage';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormSchema) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const isEditing = Boolean(product);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          id: product.id,
          name: product.name,
          description: product.description ?? '',
          price: Number(product.price).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          stock: String(product.stock),
          category: product.category,
        }
      : {
          id: '',
          name: '',
          description: '',
          price: '',
          stock: '',
          category: '',
        },
  });

  const handleFormSubmit = async (data: ProductFormSchema) => {
    setApiError(null);
    const result = await onSubmit(data);
    if (result.success) {
      onCancel();
    } else if (result.error) {
      setApiError(result.error);
    }
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
      {apiError && <ErrorMessage message={apiError} />}

      <FormGroup>
        <Label htmlFor="id">ID</Label>
        <Input
          id="id"
          placeholder="ex: prod-006"
          disabled={isEditing}
          $hasError={Boolean(errors.id)}
          {...register('id')}
        />
        {errors.id && <FieldError>{errors.id.message}</FieldError>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          placeholder="Nome do produto"
          $hasError={Boolean(errors.name)}
          {...register('name')}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="description">Descrição</Label>
        <TextArea
          id="description"
          placeholder="Descrição do produto (opcional)"
          {...register('description')}
        />
      </FormGroup>

      <div className="grid grid-cols-1 gap-4 min-[481px]:grid-cols-2">
        <FormGroup>
          <Label htmlFor="price">Preço</Label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                $hasError={Boolean(errors.price)}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(maskCurrency(e.target.value))}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          {errors.price && <FieldError>{errors.price.message}</FieldError>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="stock">Estoque</Label>
          <Controller
            name="stock"
            control={control}
            render={({ field }) => (
              <Input
                id="stock"
                type="text"
                inputMode="numeric"
                placeholder="0"
                $hasError={Boolean(errors.stock)}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(maskInteger(e.target.value))}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          {errors.stock && <FieldError>{errors.stock.message}</FieldError>}
        </FormGroup>
      </div>

      <FormGroup>
        <Label htmlFor="category">Categoria</Label>
        <Input
          id="category"
          placeholder="ex: ELETRÔNICOS"
          $hasError={Boolean(errors.category)}
          {...register('category')}
        />
        {errors.category && <FieldError>{errors.category.message}</FieldError>}
      </FormGroup>

      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" $variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  );
}

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductForm } from './ProductForm';
import type { Product } from '../types/product';

const mockProduct: Product = {
  id: 'prod-001',
  name: 'Notebook Dell Inspiron 15',
  description: 'Notebook com Intel Core i5',
  price: 3499.9,
  stock: 10,
  category: 'ELETRÔNICOS',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ProductForm', () => {
  describe('modo criação', () => {
    it('deve renderizar o formulário vazio com botão "Criar Produto"', () => {
      render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      expect(screen.getByLabelText('ID')).toHaveValue('');
      expect(screen.getByLabelText('Nome')).toHaveValue('');
      expect(screen.getByRole('button', { name: 'Criar Produto' })).toBeInTheDocument();
    });

    it('deve habilitar o campo ID na criação', () => {
      render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      expect(screen.getByLabelText('ID')).not.toBeDisabled();
    });

    it('deve chamar onSubmit com os dados do formulário', async () => {
      const onSubmit = vi.fn().mockResolvedValue({ success: true });
      const user = userEvent.setup();

      render(<ProductForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      await user.type(screen.getByLabelText('ID'), 'prod-010');
      await user.type(screen.getByLabelText('Nome'), 'Headset HyperX');
      await user.type(screen.getByLabelText('Preço'), '599.90');
      await user.type(screen.getByLabelText('Estoque'), '15');
      await user.type(screen.getByLabelText('Categoria'), 'PERIFÉRICOS');
      await user.click(screen.getByRole('button', { name: 'Criar Produto' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'prod-010',
            name: 'Headset HyperX',
            price: 599.9,
            stock: 15,
            category: 'PERIFÉRICOS',
          }),
        );
      });
    });
  });

  describe('modo edição', () => {
    it('deve preencher o formulário com os dados do produto', () => {
      render(
        <ProductForm product={mockProduct} onSubmit={vi.fn()} onCancel={vi.fn()} />,
      );

      expect(screen.getByLabelText('ID')).toHaveValue('prod-001');
      expect(screen.getByLabelText('Nome')).toHaveValue('Notebook Dell Inspiron 15');
      expect(screen.getByLabelText('Preço')).toHaveValue('3.499,90');
      expect(screen.getByLabelText('Estoque')).toHaveValue('10');
      expect(screen.getByLabelText('Categoria')).toHaveValue('ELETRÔNICOS');
    });

    it('deve desabilitar o campo ID na edição', () => {
      render(
        <ProductForm product={mockProduct} onSubmit={vi.fn()} onCancel={vi.fn()} />,
      );

      expect(screen.getByLabelText('ID')).toBeDisabled();
    });

    it('deve exibir o botão "Atualizar" na edição', () => {
      render(
        <ProductForm product={mockProduct} onSubmit={vi.fn()} onCancel={vi.fn()} />,
      );

      expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
    });
  });

  describe('validação', () => {
    it('deve exibir erro quando o nome tem menos de 3 caracteres', async () => {
      const user = userEvent.setup();
      render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      await user.type(screen.getByLabelText('Nome'), 'ab');
      await user.click(screen.getByRole('button', { name: 'Criar Produto' }));

      await waitFor(() => {
        expect(
          screen.getByText('O nome deve ter no mínimo 3 caracteres'),
        ).toBeInTheDocument();
      });
    });

    it('deve exibir erro quando o preço é zero', async () => {
      const user = userEvent.setup();
      render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      await user.type(screen.getByLabelText('Preço'), '0');
      await user.click(screen.getByRole('button', { name: 'Criar Produto' }));

      await waitFor(() => {
        expect(screen.getByText('O preço deve ser maior que 0')).toBeInTheDocument();
      });
    });

    it('deve exibir erro quando o estoque está vazio', async () => {
      const user = userEvent.setup();
      render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: 'Criar Produto' }));

      await waitFor(() => {
        expect(screen.getByText('O campo estoque é obrigatório')).toBeInTheDocument();
      });
    });

    it('deve exibir erro quando campos obrigatórios estão vazios', async () => {
      const user = userEvent.setup();
      render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: 'Criar Produto' }));

      await waitFor(() => {
        expect(screen.getByText('O campo ID é obrigatório')).toBeInTheDocument();
        expect(screen.getByText('O campo categoria é obrigatório')).toBeInTheDocument();
      });
    });

    it('não deve chamar onSubmit quando há erros de validação', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ProductForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: 'Criar Produto' }));

      await waitFor(() => {
        expect(screen.getByText('O campo ID é obrigatório')).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('interações', () => {
    it('deve chamar onCancel ao clicar em Cancelar', async () => {
      const onCancel = vi.fn();
      const user = userEvent.setup();
      render(<ProductForm onSubmit={vi.fn()} onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(onCancel).toHaveBeenCalledOnce();
    });

    it('deve chamar onCancel após submit bem-sucedido', async () => {
      const onSubmit = vi.fn().mockResolvedValue({ success: true });
      const onCancel = vi.fn();
      const user = userEvent.setup();

      render(<ProductForm onSubmit={onSubmit} onCancel={onCancel} />);

      await user.type(screen.getByLabelText('ID'), 'prod-010');
      await user.type(screen.getByLabelText('Nome'), 'Headset HyperX');
      await user.type(screen.getByLabelText('Preço'), '599.90');
      await user.type(screen.getByLabelText('Estoque'), '15');
      await user.type(screen.getByLabelText('Categoria'), 'PERIFÉRICOS');
      await user.click(screen.getByRole('button', { name: 'Criar Produto' }));

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled();
      });
    });

    it('deve exibir erro da API dentro do formulário quando o submit falha', async () => {
      const onSubmit = vi.fn().mockResolvedValue({
        success: false,
        error: "Já existe um produto com o id 'prod-010'",
      });
      const user = userEvent.setup();

      render(<ProductForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      await user.type(screen.getByLabelText('ID'), 'prod-010');
      await user.type(screen.getByLabelText('Nome'), 'Headset HyperX');
      await user.type(screen.getByLabelText('Preço'), '599.90');
      await user.type(screen.getByLabelText('Estoque'), '15');
      await user.type(screen.getByLabelText('Categoria'), 'PERIFÉRICOS');
      await user.click(screen.getByRole('button', { name: 'Criar Produto' }));

      await waitFor(() => {
        expect(
          screen.getByText("Já existe um produto com o id 'prod-010'"),
        ).toBeInTheDocument();
      });
    });

    it('não deve fechar o formulário quando o submit falha', async () => {
      const onSubmit = vi.fn().mockResolvedValue({ success: false, error: 'Erro' });
      const onCancel = vi.fn();
      const user = userEvent.setup();

      render(<ProductForm onSubmit={onSubmit} onCancel={onCancel} />);

      await user.type(screen.getByLabelText('ID'), 'prod-010');
      await user.type(screen.getByLabelText('Nome'), 'Headset HyperX');
      await user.type(screen.getByLabelText('Preço'), '599.90');
      await user.type(screen.getByLabelText('Estoque'), '15');
      await user.type(screen.getByLabelText('Categoria'), 'PERIFÉRICOS');
      await user.click(screen.getByRole('button', { name: 'Criar Produto' }));

      await waitFor(() => {
        expect(screen.getByText('Erro')).toBeInTheDocument();
      });
      expect(onCancel).not.toHaveBeenCalled();
    });
  });
});

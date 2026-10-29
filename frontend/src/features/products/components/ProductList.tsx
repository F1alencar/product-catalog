import type { Product } from '../types/product';
import { formatPrice } from '../../../utils/formatters';
import { Button } from '../../../components/Button';

const thClass =
  'border-b-2 border-border p-2 text-left text-sm font-semibold text-muted-foreground';
const tdClass = 'border-b border-border p-2 text-sm text-foreground';

interface ProductListProps {
  products: Product[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductList({
  products,
  page,
  totalPages,
  total,
  onPageChange,
  onEdit,
  onDelete,
}: ProductListProps) {
  if (products.length === 0) {
    return <p className="p-8 text-center text-muted-foreground">Nenhum produto cadastrado.</p>;
  }

  return (
    <div>
      <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className={thClass}>ID</th>
          <th className={thClass}>Nome</th>
          <th className={thClass}>Categoria</th>
          <th className={thClass}>Preço</th>
          <th className={thClass}>Estoque</th>
          <th className={thClass}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="hover:bg-background">
            <td className={tdClass}>{product.id}</td>
            <td className={tdClass}>{product.name}</td>
            <td className={tdClass}>
              <span className="inline-block rounded-sm bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
                {product.category}
              </span>
            </td>
            <td className={tdClass}>{formatPrice(product.price)}</td>
            <td className={tdClass}>{product.stock}</td>
            <td className={tdClass}>
              <div className="flex gap-1">
                <Button $variant="ghost" onClick={() => onEdit(product)}>
                  Editar
                </Button>
                <Button $variant="danger" onClick={() => onDelete(product)}>
                  Excluir
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'produto' : 'produtos'} · Página {page} de {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            $variant="ghost"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <Button
            type="button"
            $variant="ghost"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}

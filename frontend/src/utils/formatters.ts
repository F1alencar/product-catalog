export function formatPrice(price: number | string): string {
  const value = Number(price);
  if (Number.isNaN(value)) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

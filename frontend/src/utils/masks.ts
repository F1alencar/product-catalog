/**
 * Máscara de moeda brasileira (BRL).
 * O usuário digita apenas dígitos; o valor é formatado como "3.499,90".
 * Retorna a string formatada para exibição.
 */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  const cents = parseInt(digits, 10);
  const reais = cents / 100;

  return reais.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte a string formatada ("3.499,90") de volta para número (3499.90).
 */
export function unmaskCurrency(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

/**
 * Máscara de inteiro — remove tudo que não é dígito.
 */
export function maskInteger(value: string): string {
  return value.replace(/\D/g, '');
}

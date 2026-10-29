import { PrismaClient } from '@prisma/client';
import { config } from '../src/config/env';

const prisma = new PrismaClient({
  datasources: { db: { url: config.database.url } },
});

const products = [
  {
    id: 'prod-001',
    name: 'Notebook Dell Inspiron 15',
    description: 'Notebook com processador Intel Core i5, 8GB RAM e SSD 256GB',
    price: 3499.9,
    stock: 10,
    category: 'ELETRÔNICOS',
  },
  {
    id: 'prod-002',
    name: 'Mouse Logitech MX Master 3',
    description: 'Mouse sem fio ergonômico com alta precisão',
    price: 549.9,
    stock: 25,
    category: 'PERIFÉRICOS',
  },
  {
    id: 'prod-003',
    name: 'Teclado Mecânico Keychron K2',
    description: 'Teclado mecânico sem fio com switches Gateron Brown',
    price: 699.0,
    stock: 15,
    category: 'PERIFÉRICOS',
  },
  {
    id: 'prod-004',
    name: 'Monitor LG UltraWide 29"',
    description: 'Monitor ultrawide Full HD 29 polegadas IPS',
    price: 1299.0,
    stock: 8,
    category: 'ELETRÔNICOS',
  },
  {
    id: 'prod-005',
    name: 'Cadeira Gamer ThunderX3',
    description: 'Cadeira gamer ergonômica com apoio lombar ajustável',
    price: 1599.0,
    stock: 5,
    category: 'MÓVEIS',
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }
  console.log(`Seed concluído: ${products.length} produtos inseridos.`);
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

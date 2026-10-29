#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "📦 [1/5] Verificando dependências..."
if [ ! -d node_modules ]; then
  npm install
else
  echo "   node_modules já existe, pulando npm install"
fi

echo "⚙️  [2/5] Verificando arquivo .env..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "   .env criado a partir do .env.example"
else
  echo "   .env já existe"
fi

echo "🐳 [3/5] Subindo PostgreSQL (Docker)..."
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker não está rodando. Inicie o Docker Desktop e tente novamente."
  exit 1
fi
docker compose up -d

echo "⏳ [4/5] Aguardando o banco ficar pronto..."
until docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-product_catalog}" > /dev/null 2>&1; do
  sleep 1
done
echo "   Banco pronto!"

echo "🗄️  [5/5] Rodando migrations e seed..."
npx prisma migrate deploy
npm run prisma:seed

echo ""
echo "✅ Setup concluído! Iniciando o servidor..."
echo ""
npm run dev

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = resolve(root, 'backend');

async function main() {
  console.log('🛑 Parando o banco de dados (Docker)...');
  await run('docker', ['compose', 'stop'], { cwd: backendDir });
  console.log('✅ Banco de dados parado.');
  console.log('');
  console.log('Para subir tudo novamente: npm run dev');
}

main().catch((error) => {
  console.error(`\n❌ Falha ao parar: ${error.message}`);
  process.exit(1);
});

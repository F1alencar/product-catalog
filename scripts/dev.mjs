import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnService, waitForUrl, setupGracefulShutdown, killTree, askYesNo, run } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = resolve(root, 'backend');
const frontendDir = resolve(root, 'frontend');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const BACKEND_URL = 'http://localhost:3000/products';
const FRONTEND_URL = 'http://localhost:5173';

async function main() {
  console.log('🚀 Iniciando backend...');
  const backend = spawnService('backend', npm, ['run', 'dev'], { cwd: backendDir });

  console.log('⏳ Aguardando o backend responder...');
  await waitForUrl(BACKEND_URL);
  console.log('✅ Backend no ar em http://localhost:3000');
  console.log('   Swagger: http://localhost:3000/api-docs');

  console.log('🚀 Iniciando frontend...');
  const frontend = spawnService('frontend', npm, ['run', 'dev'], { cwd: frontendDir });

  await waitForUrl(FRONTEND_URL);
  console.log('✅ Frontend no ar em http://localhost:5173');
  console.log('');
  console.log('Pressione Ctrl+C para encerrar ambos.');

  setupGracefulShutdown([backend, frontend], {
    onShutdown: async () => {
      const shouldStopDb = await askYesNo('Deseja parar o banco de dados (Docker) também?');
      if (shouldStopDb) {
        console.log('🐳 Parando o PostgreSQL...');
        await run('docker', ['compose', 'stop'], { cwd: backendDir });
        console.log('   Banco parado.');
      } else {
        console.log('🐳 Banco de dados continua rodando (use `npm run stop` para parar depois).');
      }
    },
  });

  backend.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Backend encerrou inesperadamente (código ${code})`);
      killTree(frontend);
      process.exit(code ?? 1);
    }
  });

  frontend.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Frontend encerrou inesperadamente (código ${code})`);
      killTree(backend);
      process.exit(code ?? 1);
    }
  });
}

main().catch((error) => {
  console.error(`\n❌ Falha ao iniciar: ${error.message}`);
  process.exit(1);
});

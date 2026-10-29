import { existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = resolve(root, 'backend');
const frontendDir = resolve(root, 'frontend');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const MIN_NODE_MAJOR = 20;

async function checkPrerequisites() {
  console.log('🔍 [0/4] Verificando pré-requisitos...');

  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor < MIN_NODE_MAJOR) {
    throw new Error(
      `Node.js ${MIN_NODE_MAJOR}+ é obrigatório (versão atual: ${process.versions.node}). ` +
        'Atualize em https://nodejs.org ou use nvm/fnm.',
    );
  }
  console.log(`   Node.js ${process.versions.node} ✓`);

  try {
    await run('docker', ['info'], { stdio: 'pipe' });
    console.log('   Docker rodando ✓');
  } catch {
    throw new Error(
      'Docker não está rodando ou não está instalado. ' +
        'Inicie o Docker Desktop (ou instale em https://docs.docker.com/get-docker/) e tente novamente.',
    );
  }
}

async function main() {
  await checkPrerequisites();

  console.log('📦 [1/4] Instalando dependências do backend...');
  await run(npm, ['install'], { cwd: backendDir });

  console.log('📦 [2/4] Instalando dependências do frontend...');
  await run(npm, ['install'], { cwd: frontendDir });

  console.log('⚙️  [3/4] Verificando arquivos .env...');
  for (const dir of [backendDir, frontendDir]) {
    const envPath = resolve(dir, '.env');
    const examplePath = resolve(dir, '.env.example');
    if (!existsSync(envPath) && existsSync(examplePath)) {
      copyFileSync(examplePath, envPath);
      console.log(`   .env criado em ${dir}`);
    } else {
      console.log(`   .env já existe em ${dir}`);
    }
  }

  console.log('🐳 [4/4] Subindo banco de dados e rodando migrations...');
  await run('docker', ['compose', 'up', '-d'], { cwd: backendDir });
  await waitForDatabase(backendDir);
  await run('npx', ['prisma', 'migrate', 'deploy'], { cwd: backendDir });
  await run(npm, ['run', 'prisma:seed'], { cwd: backendDir });

  console.log('');
  console.log('✅ Setup concluído! Rode `npm run dev` para iniciar a aplicação.');
}

async function waitForDatabase(backendDir) {
  process.stdout.write('   Aguardando o banco ficar pronto...');
  const maxAttempts = 30;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await run('docker', ['compose', 'exec', '-T', 'postgres', 'pg_isready', '-U', 'postgres'], {
        cwd: backendDir,
        stdio: 'pipe',
      });
      console.log(' pronto!');
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Timeout: o banco de dados não ficou pronto em 30s');
}

main().catch((error) => {
  console.error(`\n❌ Setup falhou: ${error.message}`);
  process.exit(1);
});

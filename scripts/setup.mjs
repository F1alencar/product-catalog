import { existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = resolve(root, 'backend');
const frontendDir = resolve(root, 'frontend');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

async function main() {
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

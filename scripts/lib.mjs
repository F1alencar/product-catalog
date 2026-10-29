import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

export const COLORS = {
  backend: '\x1b[36m',   // ciano
  frontend: '\x1b[35m',  // magenta
  setup: '\x1b[33m',     // amarelo
  reset: '\x1b[0m',
};

/**
 * Executa um comando herdando stdio (visível no terminal).
 * Retorna uma Promise que resolve no exit code 0 e rejeita caso contrário.
 */
export function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options,
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} falhou com código ${code}`));
    });
    child.on('error', reject);
  });
}

/**
 * Inicia um processo de longa duração com prefixo colorido no output.
 * Retorna o ChildProcess para gerenciamento externo.
 */
export function spawnService(name, command, args, options = {}) {
  const color = COLORS[name] || COLORS.reset;
  const prefix = `${color}[${name}]${COLORS.reset}`;

  const child = spawn(command, args, {
    shell: false,
    detached: process.platform !== 'win32',
    ...options,
  });

  child.stdout.on('data', (data) => {
    for (const line of data.toString().split('\n')) {
      if (line.trim()) process.stdout.write(`${prefix} ${line}\n`);
    }
  });

  child.stderr.on('data', (data) => {
    for (const line of data.toString().split('\n')) {
      if (line.trim()) process.stderr.write(`${prefix} ${line}\n`);
    }
  });

  return child;
}

/**
 * Aguarda uma URL responder com status 200 (health check).
 * Faz retry a cada 500ms até o timeout.
 */
export async function waitForUrl(url, { timeoutMs = 60_000, intervalMs = 500 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // serviço ainda não está no ar — tenta novamente
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Timeout aguardando ${url} responder (${timeoutMs / 1000}s)`);
}

/**
 * Encerra um processo e toda a sua árvore de filhos.
 * Necessário porque npm/vite/tsx criam subprocessos que sobreviveriam
 * a um kill simples no processo pai.
 */
export function killTree(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      // Mata o grupo de processos (negative pid)
      process.kill(-child.pid, 'SIGTERM');
    }
  } catch {
    child.kill('SIGTERM');
  }
}

/**
 * Pergunta interativa no terminal (sim/não).
 */
export function askYesNo(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} (s/N) `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 's' || answer.trim().toLowerCase() === 'sim');
    });
  });
}

/**
 * Registra encerramento gracioso: Ctrl+C mata todos os processos filhos.
 * Aceita um callback onShutdown para ações extras (ex: parar o Docker).
 */
export function setupGracefulShutdown(children, { onShutdown } = {}) {
  let shuttingDown = false;

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log('\n\n🛑 Encerrando aplicação...');
    for (const child of children) {
      killTree(child);
    }

    if (onShutdown) {
      await onShutdown();
    }

    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

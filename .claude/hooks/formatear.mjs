// PostToolUse (Edit|Write): formatea con Prettier el archivo recién modificado.
// Nunca bloquea: si Prettier falla o el archivo no es soportado, solo avisa.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const raiz = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

let entrada = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (trozo) => (entrada += trozo));
process.stdin.on('end', () => {
  let archivo;
  try {
    archivo = JSON.parse(entrada)?.tool_input?.file_path;
  } catch {
    process.exit(0);
  }
  if (!archivo || !existsSync(archivo)) process.exit(0);

  const prettier = path.join(raiz, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
  if (!existsSync(prettier)) {
    console.error('Prettier no está instalado: ejecuta "npm install" en la raíz.');
    process.exit(0);
  }

  // --ignore-unknown: no falla con extensiones que Prettier no conoce.
  // .prettierignore excluye node_modules, dist, package-lock.json y .env*.
  const resultado = spawnSync(
    process.execPath,
    [prettier, '--write', '--ignore-unknown', '--log-level', 'warn', archivo],
    { cwd: raiz, encoding: 'utf8' },
  );
  if (resultado.status !== 0) {
    console.error(`Prettier no pudo formatear ${archivo}:\n${resultado.stderr}`);
  }
  process.exit(0);
});

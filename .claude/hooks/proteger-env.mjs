// PreToolUse: bloquea leer o editar archivos .env (excepto .env.example).
// Código de salida 2 = bloqueo; el mensaje de stderr se le muestra al agente.
import path from 'node:path';

// .env, .env.local, .env.production... pero no .env.example
const esEnvProtegido = (ruta) => {
  const nombre = path.basename(String(ruta).replace(/["']/g, ''));
  return /^\.env(\..+)?$/i.test(nombre) && nombre.toLowerCase() !== '.env.example';
};

// En comandos de shell busca cualquier mención a un .env que no sea .env.example.
const comandoTocaEnv = (comando) =>
  /(^|[\s"'=/\\<>|;&(])\.env(?!\.example\b)(\.[\w.-]+)?(?=$|[\s"'/\\<>|;&)])/i.test(comando);

const bloquear = (detalle) => {
  console.error(
    `BLOQUEADO por .claude/hooks/proteger-env.mjs: ${detalle}\n` +
      'Regla de AGENTS.md: nunca leer ni modificar .env. ' +
      'Usa .env.example (sin credenciales) o pide a la estudiante el dato que necesitas.',
  );
  process.exit(2);
};

let entrada = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (trozo) => (entrada += trozo));
process.stdin.on('end', () => {
  let datos;
  try {
    datos = JSON.parse(entrada);
  } catch {
    process.exit(0);
  }
  const { tool_name: herramienta, tool_input: params = {} } = datos ?? {};

  if (herramienta === 'Bash' || herramienta === 'PowerShell') {
    if (comandoTocaEnv(params.command ?? '')) {
      bloquear(`el comando menciona un archivo .env → ${params.command}`);
    }
    process.exit(0);
  }

  const rutas = [params.file_path, params.notebook_path, params.path].filter(Boolean);
  const protegida = rutas.find(esEnvProtegido);
  if (protegida) bloquear(`${herramienta} sobre ${protegida}`);

  // Grep/Glob con un patrón que apunte directamente a .env
  const patron = params.glob ?? (herramienta === 'Glob' ? params.pattern : undefined);
  if (patron && esEnvProtegido(patron)) bloquear(`${herramienta} con patrón ${patron}`);

  process.exit(0);
});

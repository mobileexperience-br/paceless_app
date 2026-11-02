import { registerHooks } from 'node:module';
import { statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function isFile(file) {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith('@/')) return nextResolve(specifier, context);
    const base = path.join(root, specifier.slice(2));
    const file = [`${base}.ts`, `${base}.tsx`, base, path.join(base, 'index.ts')].find(isFile);
    return nextResolve(file ? pathToFileURL(file).href : specifier, context);
  },
});

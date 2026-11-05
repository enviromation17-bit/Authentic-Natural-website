import { cpSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

// Explicit allowlist. Never publish hostbreak/, crm/, .github/, scripts/, or secrets.
const root = process.cwd();
const out = resolve(root, 'dist');
const assets = [
  'index.html',
  'styles.css',
  'enhance.css',
  'hero-scrub.css',
  'app.js',
  'scrub.js',
  'product360.js',
  'polish.js',
  'hero-scrub.js',
  'lead-popup.js',
  'lead-capture.js'
];
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const name of assets) {
  const file = resolve(root, name);
  if (!existsSync(file) || !statSync(file).isFile()) {
    throw new Error('Missing required storefront file: ' + name);
  }
  cpSync(file, join(out, name));
}
if (!existsSync(join(root, 'public', 'assets', 'process-01.png'))) {
  throw new Error('Hero image missing; stopping deployment.');
}
cpSync(join(root, 'public'), join(out, 'public'), { recursive: true });
const prohibited = ['hostbreak', 'crm', '.github', 'scripts', 'authentic-naturals-config.php'];
for (const name of prohibited) {
  if (existsSync(join(out, name))) throw new Error('Unsafe deployment file: ' + name);
}
console.log('Cloudflare storefront built in dist/: ' + assets.length + ' app files + public assets.');
console.log('Private PHP backend and configuration excluded. Backend remains inactive on Workers.');

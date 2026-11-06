import { cpSync, existsSync, mkdirSync, rmSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, basename, extname } from 'node:path';
import sharp from 'sharp';

// Only publish approved storefront files, never backend PHP source or secrets.
const root = process.cwd();
const out = resolve(root, 'dist');
const assets = [
  'index.html', 'styles.css', 'enhance.css', 'hero-scrub.css', 'mobile-fix.css',
  'app.js', 'scrub.js', 'product360.js', 'polish.js',
  'hero-scrub.js', 'ritual-player.js', 'lead-popup.js', 'lead-capture.js', 'stock-ui.js'
];
const heroImages = [
  'process-01.png','process-02.png','process-03.png','process-04.png',
  'process-05.png','process-06.png','process-08.png',
  'botanicals.png','ritual.png','product.png'
];
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const name of assets) {
  const input = resolve(root, name);
  if (!existsSync(input) || !statSync(input).isFile()) throw new Error('Missing storefront file: ' + name);
  cpSync(input, join(out, name));
}
const publicDir = join(root, 'public');
if (!existsSync(join(publicDir, 'assets', 'process-01.png'))) throw new Error('First hero image missing');
cpSync(publicDir, join(out, 'public'), { recursive: true });

const appJS = readFileSync(join(root, 'app.js'), 'utf8');
const ingredientBlock = appJS.match(/const ingredientPhotos = \{([\s\S]*?)\n\};/);
if (!ingredientBlock) throw new Error('Ingredient image mapping not found');
const ingredientImages = [...ingredientBlock[1].matchAll(/A \+ '([^']+)'/g)].map(m => m[1]);
const allImages = [...new Set([...heroImages, ...ingredientImages])];
const optimizedDir = join(out, 'public', 'assets', 'optimized');
mkdirSync(optimizedDir, { recursive: true });
const replacements = new Map();
let originalBytes = 0, optimizedBytes = 0;

async function optimize(name) {
  const input = join(publicDir, 'assets', name);
  if (!existsSync(input)) throw new Error('Missing photographed asset: ' + name);
  const outputName = basename(name, extname(name)) + '.webp';
  const output = join(optimizedDir, outputName);
  const isHero = heroImages.includes(name);
  const inputBytes = statSync(input).size;
  const maxWidth = isHero ? 1200 : 680;
  await sharp(input, { failOn: 'error', limitInputPixels: 50000000 })
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: isHero ? 79 : 75, effort: 4 })
    .toFile(output);
  originalBytes += inputBytes;
  optimizedBytes += statSync(output).size;
  replacements.set(name, 'optimized/' + outputName);
}
for (let i = 0; i < allImages.length; i += 3) {
  await Promise.all(allImages.slice(i, i + 3).map(optimize));
}

for (const file of assets) {
  if (!/\.(?:js|html|css)$/.test(file)) continue;
  let text = readFileSync(join(out, file), 'utf8');
  for (const [original, optimized] of replacements) {
    text = text.replaceAll("'" + original + "'", "'" + optimized + "'");
    text = text.replaceAll('public/assets/' + original, 'public/assets/' + optimized);
  }
  writeFileSync(join(out, file), text);
}
const prohibited = ['hostbreak','crm','.github','scripts','authentic-naturals-config.php'];
for (const name of prohibited) {
  if (existsSync(join(out, name))) throw new Error('Unsafe deploy artifact: ' + name);
}
const percent = originalBytes ? Math.round((1 - optimizedBytes/originalBytes)*100) : 0;
console.log('Cloudflare safe build complete: ' + assets.length + ' files, '
  + allImages.length + ' converted photos.');
console.log('Photos: ' + Math.round(originalBytes/1024) + ' KiB originals → '
  + Math.round(optimizedBytes/1024) + ' KiB WebP (' + percent + '% savings).');
console.log('Private HostBreak backend excluded. Cloudflare CRM still requires Workers/D1.');

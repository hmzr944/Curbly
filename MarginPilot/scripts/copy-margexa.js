/**
 * copy-margexa.js — Syncs resources/js/Margexa/ → public/js/margexa/
 * Run: node scripts/copy-margexa.js
 * Called automatically by: npm run build
 */
import { cpSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root   = join(__dirname, '..');
const src    = join(root, 'resources', 'js', 'Margexa');
const dest   = join(root, 'public', 'js', 'margexa');

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true, force: true });

console.log('✓ Margexa SPA synced: resources/js/Margexa/ → public/js/margexa/');

/**
 * Assemble Firebase deployment directory
 * This script copies built micro frontends into the correct structure for Firebase Hosting
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const firebaseDir = path.join(rootDir, 'dist', 'firebase');

// Clean and create Firebase directory
if (fs.existsSync(firebaseDir)) {
  fs.rmSync(firebaseDir, { recursive: true });
}
fs.mkdirSync(firebaseDir, { recursive: true });

// Copy function to recursively copy directories
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Warning: Source directory does not exist: ${src}`);
    return;
  }

  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Assembling Firebase deployment directory...\n');

// 1. Copy shell (host) as the root
const shellDist = path.join(rootDir, 'packages', 'shell', 'dist');
console.log(`Copying shell to ${firebaseDir}`);
copyDir(shellDist, firebaseDir);

// 2. Copy city-search MF to /city-search
const citySearchDist = path.join(rootDir, 'packages', 'city-search', 'dist');
const citySearchDest = path.join(firebaseDir, 'city-search');
console.log(`Copying city-search to ${citySearchDest}`);
copyDir(citySearchDist, citySearchDest);

// 3. Copy weather-display MF to /weather-display
const weatherDisplayDist = path.join(rootDir, 'packages', 'weather-display', 'dist');
const weatherDisplayDest = path.join(firebaseDir, 'weather-display');
console.log(`Copying weather-display to ${weatherDisplayDest}`);
copyDir(weatherDisplayDist, weatherDisplayDest);

console.log('\nFirebase deployment directory assembled successfully!');
console.log(`Output: ${firebaseDir}`);

// List the structure
function listDir(dir, indent = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    console.log(`${indent}${entry.isDirectory() ? '📁' : '📄'} ${entry.name}`);
    if (entry.isDirectory() && indent.length < 4) {
      listDir(path.join(dir, entry.name), indent + '  ');
    }
  }
}

console.log('\nDirectory structure:');
listDir(firebaseDir);

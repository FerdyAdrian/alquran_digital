const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const laravelPublicDir = path.join(projectRoot, 'laravel-api', 'public');

if (!fs.existsSync(distDir)) {
  throw new Error('Folder dist belum ada. Jalankan npm run build:web terlebih dahulu.');
}

fs.cpSync(distDir, laravelPublicDir, {
  recursive: true,
  force: true,
  filter(source) {
    return path.basename(source) !== 'index.php';
  },
});

console.log(`Expo web build copied to ${laravelPublicDir}`);

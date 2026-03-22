import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Find all files recursively in a directory
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (['node_modules', '.git', '.next', 'dist', 'build', '.gemini'].includes(file)) return;
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.json') || fullPath.endsWith('.md') || fullPath.endsWith('.sql') || fullPath.endsWith('.mjs') || fullPath.endsWith('.css') || fullPath.endsWith('.example')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(rootDir);
let changedCount = 0;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/MyShopLink/g, 'MyMyShopLink')
    .replace(/myshoplink/g, 'mymyshoplink')
    .replace(/MYSHOPLINK/g, 'MYMYSHOPLINK');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedCount++;
    console.log(`Updated ${path.relative(rootDir, file)}`);
  }
}

console.log(`Finished. Total files updated: ${changedCount}`);

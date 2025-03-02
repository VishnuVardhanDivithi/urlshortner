import fs from 'fs';
import path from 'path';

// Function to list all files in a directory recursively
function listFilesRecursively(dir: string, indent: string = ''): void {
  try {
    if (!fs.existsSync(dir)) {
      console.log(`${indent}Directory does not exist: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        console.log(`${indent}📁 ${file}/`);
        listFilesRecursively(filePath, indent + '  ');
      } else {
        console.log(`${indent}📄 ${file} (${stats.size} bytes)`);
      }
    }
  } catch (error) {
    console.error(`Error listing files in ${dir}:`, error);
  }
}

// Check the current directory and structure
console.log('Current working directory:', process.cwd());
console.log('\nDirectory structure:');

// Check dist directory
const distPath = path.join(__dirname, '..');
console.log(`\nChecking dist directory: ${distPath}`);
listFilesRecursively(distPath);

// Check public directory
const publicPath = path.join(__dirname, '../public');
console.log(`\nChecking public directory: ${publicPath}`);
listFilesRecursively(publicPath);

// Check one level up
const parentPath = path.join(__dirname, '../..');
console.log(`\nChecking parent directory: ${parentPath}`);
listFilesRecursively(parentPath, '  ');

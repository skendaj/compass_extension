import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Copy manifest.json
        copyFileSync('manifest.json', 'dist/manifest.json');
        
        // Create icons directory if it doesn't exist
        if (!existsSync('dist/icons')) {
          mkdirSync('dist/icons', { recursive: true });
        }
        
        // Copy icon files if they exist
        if (existsSync('icons')) {
          const iconFiles = readdirSync('icons');
          iconFiles.forEach(file => {
            if (file.endsWith('.png')) {
              copyFileSync(`icons/${file}`, `dist/icons/${file}`);
            }
          });
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});


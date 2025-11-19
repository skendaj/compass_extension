import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, cpSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Copy manifest.json
        copyFileSync('manifest.json', 'dist/manifest.json');
        
        // Copy offscreen.html
        copyFileSync('src/offscreen.html', 'dist/offscreen.html');
        
        // Copy tessdata directory for OCR
        if (existsSync('public/tessdata')) {
          if (!existsSync('dist/tessdata')) {
            mkdirSync('dist/tessdata', { recursive: true });
          }
          cpSync('public/tessdata', 'dist/tessdata', { recursive: true });
        }
        
        // Create icons directory if it doesn't exist
        if (!existsSync('dist/icons')) {
          mkdirSync('dist/icons', { recursive: true });
        }
        
        // Copy logo from public/assets as extension icons
        if (existsSync('public/assets/logo192.png')) {
          // Copy logo192.png and use it for all icon sizes (Chrome will scale)
          copyFileSync('public/assets/logo192.png', 'dist/icons/icon16.png');
          copyFileSync('public/assets/logo192.png', 'dist/icons/icon48.png');
          copyFileSync('public/assets/logo192.png', 'dist/icons/icon128.png');
        }
        
        // Copy other icon files if they exist (backup)
        if (existsSync('icons')) {
          const iconFiles = readdirSync('icons');
          iconFiles.forEach(file => {
            if (file.endsWith('.png') && !['icon16.png', 'icon48.png', 'icon128.png'].includes(file)) {
              copyFileSync(`icons/${file}`, `dist/icons/${file}`);
            }
          });
        }
        
        // Copy public assets
        if (existsSync('public')) {
          if (!existsSync('dist/assets')) {
            mkdirSync('dist/assets', { recursive: true });
          }
          if (existsSync('public/assets')) {
            const assetFiles = readdirSync('public/assets');
            assetFiles.forEach(file => {
              copyFileSync(`public/assets/${file}`, `dist/assets/${file}`);
            });
          }
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
        offscreen: resolve(__dirname, 'src/offscreen.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});


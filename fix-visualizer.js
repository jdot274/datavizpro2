// fix-visualizer.js
// This script will fix visualization issues in DesignDataPro2

// Run this file using Node.js to execute the fixes
// Usage: node fix-visualizer.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===== DesignDataPro2 Visualization Fix =====');
console.log('Applying critical fixes to ensure visualization pages load correctly');

// Step 1: Create a public directory if it doesn't exist
const publicDir = path.resolve('./public');
if (!fs.existsSync(publicDir)) {
  console.log('Creating public directory...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Step 2: Update the index.html file
console.log('Updating index.html with proper base and resource paths...');
const indexPath = path.resolve('./client/index.html');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Add proper head tags if missing
  if (!content.includes('<title>')) {
    content = content.replace(
      '<head>',
      `<head>
    <title>DesignDataPro2 - Data Visualization</title>
    <link rel="icon" type="image/png" href="./generated-icon.png" />
    <meta name="description" content="Advanced data visualization and analysis tool" />
    <base href="/" />`
    );
  }
  
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('✓ index.html updated');
}

// Step 3: Create a proper .env file
console.log('Creating environment file for proper configuration...');
const envContent = `NODE_ENV=development
VITE_APP_TITLE=DesignDataPro2
VITE_BASE_URL=./
VITE_SERVER_URL=http://localhost:3000/api
VITE_PUBLIC_URL=./
`;

fs.writeFileSync('./.env', envContent, 'utf8');
console.log('✓ .env file created');

// Step 4: Update vite.config.js
console.log('Updating Vite configuration for proper asset loading...');
const viteConfigPath = path.resolve('./vite.config.ts');

if (fs.existsSync(viteConfigPath)) {
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  if (!viteConfig.includes('base:')) {
    viteConfig = viteConfig.replace(
      'export default defineConfig({',
      `export default defineConfig({
  base: './',`
    );
  }
  
  fs.writeFileSync(viteConfigPath, viteConfig, 'utf8');
  console.log('✓ Vite config updated');
}

// Step 5: Create a loader script in public directory
console.log('Creating loader script to ensure proper resource loading...');
const loaderContent = `// This file ensures proper resource loading for visualizations
window.addEventListener('DOMContentLoaded', () => {
  console.log('DesignDataPro2 resource loader initialized');
  
  // Force proper base path
  if (!document.querySelector('base')) {
    const base = document.createElement('base');
    base.href = '/';
    document.head.appendChild(base);
  }
  
  // Pre-load critical resources
  const resources = [
    './public/textures/asphalt.png',
    './public/textures/grass.png',
    './public/textures/sand.jpg',
    './public/textures/sky.png',
    './public/textures/wood.jpg'
  ];
  
  resources.forEach(resource => {
    const img = new Image();
    img.src = resource;
  });
  
  // Register service worker if supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('./service-worker.js').then(
        function(registration) {
          console.log('Resource cache registered:', registration.scope);
        }
      );
    });
  }
});
`;

fs.writeFileSync('./public/loader.js', loaderContent, 'utf8');
console.log('✓ Loader script created');

// Step 6: Create simple service worker for resource caching
const swContent = `// Service worker for visualization resource caching
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open('design-data-pro-resources').then(function(cache) {
      return cache.addAll([
        './public/textures/asphalt.png',
        './public/textures/grass.png',
        './public/textures/sand.jpg',
        './public/textures/sky.png',
        './public/textures/wood.jpg',
        './generated-icon.png'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
`;

fs.writeFileSync('./public/service-worker.js', swContent, 'utf8');
console.log('✓ Service worker created');

// Step 7: Update App.tsx to include resource loading script
console.log('Updating App.tsx to include resource preloader...');
const appPath = path.resolve('./client/src/App.tsx');

if (fs.existsSync(appPath)) {
  let appContent = fs.readFileSync(appPath, 'utf8');
  
  if (!appContent.includes('loader.js')) {
    const scriptTag = `
        {/* Resource preloader */}
        <script src="/loader.js"></script>`;
    
    appContent = appContent.replace(
      '<Toaster position="top-right" />',
      '<Toaster position="top-right" />' + scriptTag
    );
    
    fs.writeFileSync(appPath, appContent, 'utf8');
    console.log('✓ App.tsx updated');
  }
}

console.log('\n===== Fixes Applied Successfully =====');
console.log('\nTo run the application:');
console.log('1. Frontend only: npm run dev:vite');
console.log('2. Full stack: npm run dev');
console.log('3. Production: npm run build && npm run start');
console.log('\nAccess the application at: http://localhost:3000');
console.log('Visualizations should now load correctly!');
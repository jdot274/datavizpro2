// This file ensures proper resource loading for visualizations
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

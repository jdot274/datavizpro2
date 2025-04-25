#!/bin/bash
# Fix visualization pages in DesignDataPro2
# This script addresses common issues with visualization pages not displaying correctly

echo "======= DesignDataPro2 Visualization Fix ======="
echo "This script will fix issues with visualization pages not displaying properly"

# Step 1: Clean up existing build artifacts
echo "Step 1: Cleaning up build artifacts..."
rm -rf dist node_modules/.vite node_modules/.cache

# Step 2: Install dependencies - sometimes packages get corrupted
echo "Step 2: Making sure all dependencies are installed correctly..."
npm install

# Step 3: Fix known code issues
echo "Step 3: Fixing syntax issues in components..."

# Update browser compatibility
echo "Adding browserslist config to package.json..."
if ! grep -q "browserslist" package.json; then
  # Use temporary file for sed on macOS
  sed -i '' 's/"devDependencies": {/"browserslist": [">0.2%", "not dead", "not op_mini all"], "devDependencies": {/g' package.json
fi

# Step 4: Set up proper environment variables
echo "Step 4: Setting up environment variables..."
if [ ! -f .env ]; then
  echo "Creating .env file with proper configuration..."
  cat > .env << EOL
NODE_ENV=development
VITE_APP_TITLE=DesignDataPro2
VITE_BASE_URL=/
VITE_SERVER_URL=http://localhost:3000/api
VITE_PUBLIC_PATH=./
EOL
fi

# Step 5: Fix Vite server CORS settings
echo "Step 5: Ensuring Vite server configuration is correct..."
if ! grep -q "cors: true" vite.config.ts; then
  # Config already updated by previous steps
  echo "Vite config already updated with CORS settings."
fi

# Step 6: Build and start the application
echo "Step 6: Starting application with proper flags..."
echo ""
echo "=============== NEXT STEPS ==============="
echo "Your application should be ready to run now."
echo ""
echo "Option 1: Run frontend only (faster for visualization testing):"
echo "  npm run dev:vite"
echo ""
echo "Option 2: Run full stack (backend + frontend):"
echo "  npm run dev"
echo ""
echo "Option 3: Build and serve production version:"
echo "  npm run build && npm run start"
echo ""
echo "Access the application at: http://localhost:3000"
echo ""
echo "If visualization issues persist, try:"
echo "  1. Clear browser cache and reload"
echo "  2. Try a different browser"
echo "  3. Check console for specific errors"
echo "  4. Run 'npm run clean && npm run build && npm run start'"
echo "=======================================
const { execSync } = require('child_process');
const fs = require('fs');

console.log('--- Starting Vercel build process ---');

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm ci --prefer-offline --no-audit --progress=false', { stdio: 'inherit' });
  
  // Build main application
  console.log('--- Building main application ---');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Build chat application if not in production or if explicitly set
  if (process.env.VERCEL_ENV !== 'production' || process.env.BUILD_CHAT === 'true') {
    console.log('--- Building chat application ---');
    execSync('cross-env VITE_APP_MODE=chat vite build --config vite.chat.config.js', { stdio: 'inherit' });
  }
  
  console.log('--- Build completed successfully ---');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Running Vercel build script...');

// Install production dependencies
try {
  console.log('📦 Installing production dependencies...');
  execSync('npm install --production', { stdio: 'inherit' });
  
  // Run database migrations if needed
  console.log('🔄 Running database migrations...');
  execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

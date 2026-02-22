import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we're building for Vercel (PostgreSQL)
const isVercel = !!(
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.VERCEL ||
  process.env.VERCEL_ENV
);

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const productionSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma.production');

console.log('===========================================');
console.log('🔧 Build Environment Detection');
console.log('===========================================');
console.log('POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL ? 'SET ✓' : 'NOT SET');
console.log('POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING ? 'SET ✓' : 'NOT SET');
console.log('VERCEL:', process.env.VERCEL ? 'SET ✓' : 'NOT SET');
console.log('VERCEL_ENV:', process.env.VERCEL_ENV || 'NOT SET');
console.log('Detected Environment:', isVercel ? 'VERCEL (PostgreSQL)' : 'LOCAL (SQLite)');
console.log('===========================================');

if (isVercel) {
  // Use PostgreSQL schema for Vercel
  if (fs.existsSync(productionSchemaPath)) {
    const productionSchema = fs.readFileSync(productionSchemaPath, 'utf8');
    fs.writeFileSync(schemaPath, productionSchema);
    console.log('✅ Switched to PostgreSQL schema for Vercel');
    
    // Run prisma db push to create tables
    console.log('\n📦 Pushing database schema to PostgreSQL...');
    try {
      execSync('npx prisma db push --accept-data-loss --skip-generate', {
        stdio: 'inherit',
        env: {
          ...process.env,
          // Ensure we use the direct URL for migrations
          DATABASE_URL: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL
        }
      });
      console.log('✅ Database schema pushed successfully');
    } catch (error) {
      console.error('⚠️ Database push failed, but continuing build...');
      console.error(error);
    }
  } else {
    console.error('❌ Production schema not found at:', productionSchemaPath);
    process.exit(1);
  }
} else {
  console.log('✅ Using SQLite schema for local development');
}

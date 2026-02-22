import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const productionSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma.production');

console.log('===========================================');
console.log('🔧 Prisma Build Script');
console.log('===========================================');
console.log('VERCEL:', process.env.VERCEL ? 'SET' : 'NOT SET');
console.log('VERCEL_ENV:', process.env.VERCEL_ENV || 'NOT SET');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('===========================================');

// Determine if we're on Vercel
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV || 
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech'));

if (isVercel) {
  console.log('📦 Vercel/PostgreSQL environment detected');
  
  // Read the production schema
  if (fs.existsSync(productionSchemaPath)) {
    const productionSchema = fs.readFileSync(productionSchemaPath, 'utf8');
    fs.writeFileSync(schemaPath, productionSchema);
    console.log('✅ Copied PostgreSQL schema');
  }
  
  // Get the direct URL for migrations (remove -pooler from the URL)
  let directUrl = process.env.DATABASE_URL || '';
  if (directUrl.includes('-pooler')) {
    directUrl = directUrl.replace('-pooler', '');
    console.log('✅ Converted pooled URL to direct URL for migrations');
  }
  
  // Generate Prisma Client first
  console.log('\n📦 Step 1: Generating Prisma Client...');
  try {
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log('✅ Prisma Client generated');
  } catch (e) {
    console.error('❌ Prisma generate failed');
    console.error(e instanceof Error ? e.message : e);
  }
  
  // Push schema to database using direct URL
  console.log('\n📦 Step 2: Pushing schema to database...');
  try {
    const env = { ...process.env };
    // Use direct URL for db push (migrations don't work well with pooled connections)
    if (directUrl && directUrl !== process.env.DATABASE_URL) {
      env.DATABASE_URL = directUrl;
    }
    
    execSync('npx prisma db push --accept-data-loss --skip-generate', { 
      stdio: 'inherit',
      env
    });
    console.log('✅ Schema pushed to database');
  } catch (e) {
    console.error('⚠️ Database push failed');
    console.error(e instanceof Error ? e.message : e);
  }
} else {
  console.log('📦 Local environment - using SQLite');
  
  // Generate Prisma Client for local
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated');
  } catch (e) {
    console.error('Prisma generate failed');
  }
}

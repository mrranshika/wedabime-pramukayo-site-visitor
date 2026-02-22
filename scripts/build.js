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
  process.env.DATABASE_URL?.includes('postgres') ||
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
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET ✓' : 'NOT SET');
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
    
    // Determine the correct database URL for migrations
    const dbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;
    
    console.log('\n📦 Pushing database schema to PostgreSQL...');
    console.log('Using database URL type:', dbUrl?.includes('pooler') ? 'POOLED' : 'DIRECT');
    
    try {
      // Set the environment variable explicitly
      const env = {
        ...process.env,
        DATABASE_URL: dbUrl
      };
      
      // First generate the Prisma client
      console.log('\n📦 Generating Prisma client...');
      execSync('npx prisma generate', {
        stdio: 'inherit',
        env
      });
      console.log('✅ Prisma client generated');
      
      // Then push the schema
      console.log('\n📦 Pushing database schema...');
      execSync('npx prisma db push --accept-data-loss', {
        stdio: 'inherit',
        env
      });
      console.log('✅ Database schema pushed successfully');
    } catch (error) {
      console.error('⚠️ Database operation failed:');
      console.error(error instanceof Error ? error.message : error);
      // Don't exit - let the build continue
    }
  } else {
    console.error('❌ Production schema not found at:', productionSchemaPath);
    // Create the schema inline
    const productionSchema = `// Prisma Schema for PostgreSQL
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}

model SiteVisit {
  id              String   @id @default(cuid())
  customerId      String   @unique
  leadReceivedDate DateTime
  customerName    String
  phoneNumber     String
  phoneHasWhatsApp Boolean @default(false)
  hasWhatsAppNumber Boolean?
  whatsappNumber  String?
  district        String
  city            String
  address         String?
  googleMapsLink  String?
  latitude        Float?
  longitude       Float?
  drawings        String?
  images          String?
  videos          String?
  hasRemovals     Boolean  @default(false)
  removalCharge   Float?
  hasAdditionalLabour Boolean @default(false)
  additionalLabourCharge Float?
  serviceType     String
  ceilingDetails  String?
  guttersDetails  String?
  roofDetails     String?
  quotationNumber String?
  quotationPdf    String?
  totalAmount     Float?
  status          String   @default("pending")
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([customerId])
  @@index([phoneNumber])
  @@index([district])
  @@index([status])
}
`;
    fs.writeFileSync(schemaPath, productionSchema);
    console.log('✅ Created PostgreSQL schema inline');
  }
} else {
  console.log('✅ Using SQLite schema for local development');
}

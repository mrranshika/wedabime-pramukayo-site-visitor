import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we're on Vercel
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const productionSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma.production');

console.log('===========================================');
console.log('🔧 Prisma Build Script');
console.log('===========================================');
console.log('VERCEL:', process.env.VERCEL ? 'SET' : 'NOT SET');
console.log('VERCEL_ENV:', process.env.VERCEL_ENV || 'NOT SET');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('===========================================');

if (isVercel) {
  console.log('📦 Vercel environment detected');
  
  // Read the production schema
  if (fs.existsSync(productionSchemaPath)) {
    const productionSchema = fs.readFileSync(productionSchemaPath, 'utf8');
    fs.writeFileSync(schemaPath, productionSchema);
    console.log('✅ Copied PostgreSQL schema');
  } else {
    console.log('⚠️ Production schema not found, creating inline...');
    
    const inlineSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}

model SiteVisit {
  id String @id @default(cuid())
  customerId String @unique
  leadReceivedDate DateTime
  customerName String
  phoneNumber String
  phoneHasWhatsApp Boolean @default(false)
  hasWhatsAppNumber Boolean?
  whatsappNumber String?
  district String
  city String
  address String?
  googleMapsLink String?
  latitude Float?
  longitude Float?
  drawings String?
  images String?
  videos String?
  hasRemovals Boolean @default(false)
  removalCharge Float?
  hasAdditionalLabour Boolean @default(false)
  additionalLabourCharge Float?
  serviceType String
  ceilingDetails String?
  guttersDetails String?
  roofDetails String?
  quotationNumber String?
  quotationPdf String?
  totalAmount Float?
  status String @default("pending")
  notes String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([customerId])
  @@index([phoneNumber])
  @@index([district])
  @@index([status])
}
`;
    fs.writeFileSync(schemaPath, inlineSchema);
    console.log('✅ Created inline PostgreSQL schema');
  }
  
  // Generate Prisma Client
  console.log('\n📦 Generating Prisma Client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated');
  } catch (e) {
    console.error('❌ Prisma generate failed');
    console.error(e);
  }
  
  // Push schema to database
  console.log('\n📦 Pushing schema to database...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Schema pushed to database');
  } catch (e) {
    console.error('⚠️ Database push failed (may already exist)');
    console.error(e);
  }
} else {
  console.log('📦 Local environment - using SQLite schema');
}

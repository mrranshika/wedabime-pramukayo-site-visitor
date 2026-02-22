import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we're building for Vercel (PostgreSQL)
const isVercel = process.env.POSTGRES_PRISMA_URL || process.env.VERCEL;

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const productionSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma.production');

console.log('Build environment:', isVercel ? 'Vercel (PostgreSQL)' : 'Local (SQLite)');

if (isVercel) {
  // Use PostgreSQL schema for Vercel
  if (fs.existsSync(productionSchemaPath)) {
    const productionSchema = fs.readFileSync(productionSchemaPath, 'utf8');
    fs.writeFileSync(schemaPath, productionSchema);
    console.log('✅ Switched to PostgreSQL schema for Vercel');
  } else {
    console.error('❌ Production schema not found!');
    process.exit(1);
  }
} else {
  // Use SQLite schema for local development
  const sqliteSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model SiteVisit {
  id              String   @id @default(cuid())
  customerId      String   @unique
  leadReceivedDate DateTime
  customerName    String
  
  // Phone & WhatsApp
  phoneNumber     String
  phoneHasWhatsApp Boolean @default(false)
  hasWhatsAppNumber Boolean? // Yes/No for separate WhatsApp
  whatsappNumber  String?
  
  // Location
  district        String
  city            String
  address         String?
  googleMapsLink  String?
  latitude        Float?
  longitude       Float?
  
  // Media
  drawings        String?  // JSON array of drawing URLs (max 20)
  images          String?  // JSON array of image URLs (max 20)
  videos          String?  // JSON array of video URLs (max 2)
  
  // Charges
  hasRemovals     Boolean  @default(false)
  removalCharge   Float?
  hasAdditionalLabour Boolean @default(false)
  additionalLabourCharge Float?
  
  // Service Type: "ceiling", "gutters", "roof"
  serviceType     String
  
  // Ceiling Details (JSON)
  ceilingDetails  String?
  
  // Gutters Details (JSON)
  guttersDetails  String?
  
  // Roof Details (JSON)
  roofDetails     String?
  
  // Quotation
  quotationNumber String?
  quotationPdf    String?  // PDF URL
  totalAmount     Float?
  
  // Status
  status          String   @default("pending") // pending, running, complete, cancel
  
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([customerId])
  @@index([phoneNumber])
  @@index([district])
  @@index([status])
  @@index([leadReceivedDate])
}
`;
  fs.writeFileSync(schemaPath, sqliteSchema);
  console.log('✅ Using SQLite schema for local development');
}

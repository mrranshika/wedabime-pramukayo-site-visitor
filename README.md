# Wedabime Pramukayo - Site Visitor Management System

A comprehensive site visitor management web application for **Wedabime Pramukayo** - a ceiling, roofing, and gutter insulation service company in Sri Lanka.

## 🚀 Features

### 📋 Multi-Step Registration Form
- **Step 1:** Basic Information (Customer ID, Date, Name)
- **Step 2:** Phone & WhatsApp Details
- **Step 3:** Location with Auto-Detection
- **Step 4:** Media Upload (Drawings, Images, Videos)
- **Step 5:** Service Details (Ceiling, Gutters, Roof)
- **Step 6:** Quotation & Status

### 🎯 Service Types

#### Ceiling Services
- 2×2 Eltoro Ceiling
- 2×2 PVC Ceiling
- Panel Flat Ceiling
- Panel Box Ceiling
- Area calculation with pricing

#### Gutters Services
- 14 measurement fields
- Auto-calculation of total feet
- Wall/F, Blind Wall Flashing options

#### Roof Services
- New/Repair options
- Wood/Steel materials
- Asbestos, Tile, Amano, UPVC options

### 📍 Location Features
- Auto-detect current location
- Generate shareable Google Maps link
- Copy link to clipboard
- Open directly in Google Maps

### 📊 Google Sheets Integration
- Auto-sync all form data to Google Sheets
- Comprehensive field mapping

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Database:** Prisma ORM (SQLite locally, PostgreSQL on Vercel)
- **Icons:** Lucide React

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── customer-id/route.ts    # Customer ID generation
│   │   └── site-visits/route.ts    # CRUD operations
│   ├── dashboard/page.tsx          # Dashboard view
│   ├── page.tsx                    # Main form
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── Header.tsx                  # Navigation header
│   └── ui/                         # shadcn/ui components
├── contexts/
│   ├── LanguageContext.tsx         # Multi-language support
│   └── ThemeContext.tsx            # Dark/Light mode
└── lib/
    └── db.ts                       # Database connection
```

## 🔧 Environment Variables

```env
# Local Development (SQLite)
DATABASE_URL="file:./db/custom.db"

# Google Sheets Integration
GOOGLE_SHEETS_WEBHOOK_URL="your-webhook-url"

# Vercel Postgres (Production)
POSTGRES_PRISMA_URL="your-postgres-url"
POSTGRES_URL_NON_POOLING="your-direct-url"
```

## 📱 Customer ID Pattern

- Format: `A-000a01`, `A-000a02`, ... `Z-999z99`
- Then: `AA-000a01`, `AB-000a01`, ... `ZZ-999z99`
- Then: `AAA-000a01`, and so on...

## 🌐 Live Demo

- **Production:** https://wedabime-pramukayo-site.vercel.app/

## 📄 License

Built for Wedabime Pramukayo, Sri Lanka.

---

Developed with ❤️ using [Z.ai](https://chat.z.ai) 🚀

# 🔄 Prisma Schema to SQL Conversion Documentation

## 📋 Overview
This document shows the exact conversion from your **Prisma Schema** to the **Final Complete SQL Schema** for the BrightonHub Multi-Service Platform.

---

## 🏗️ Database Configuration

| **Prisma Schema** | **SQL Schema** |
|-------------------|----------------|
| ```prisma<br>generator client {<br>  provider = "prisma-client-js"<br>}<br><br>datasource db {<br>  provider = "postgresql"<br>  url = env("DATABASE_URL")<br>}``` | ```sql<br>-- BrightonHub Multi-Service Platform COMPLETE Database Schema<br>-- This SQL matches the Prisma schema EXACTLY<br>-- Execute this SQL in Supabase Dashboard > SQL Editor``` |

---

## 🔧 Enums Conversion

### UserRole Enum
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>enum UserRole {<br>  GUEST<br>  REGISTERED<br>  VENDOR<br>  AGENT<br>  ADMIN<br>}``` | ```sql<br>CREATE TYPE "UserRole" AS ENUM (<br>  'GUEST',<br>  'REGISTERED',<br>  'VENDOR',<br>  'AGENT',<br>  'ADMIN'<br>);``` |

### PropertyType Enum
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>enum PropertyType {<br>  RESIDENTIAL<br>  COMMERCIAL<br>  LAND<br>  MIXED_USE<br>}``` | ```sql<br>CREATE TYPE "PropertyType" AS ENUM (<br>  'RESIDENTIAL',<br>  'COMMERCIAL',<br>  'LAND',<br>  'MIXED_USE'<br>);``` |

### ListingType Enum
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>enum ListingType {<br>  SALE<br>  RENT<br>}``` | ```sql<br>CREATE TYPE "ListingType" AS ENUM (<br>  'SALE',<br>  'RENT'<br>);``` |

### InquiryStatus Enum
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>enum InquiryStatus {<br>  PENDING<br>  CONTACTED<br>  CLOSED<br>}``` | ```sql<br>CREATE TYPE "InquiryStatus" AS ENUM (<br>  'PENDING',<br>  'CONTACTED',<br>  'CLOSED'<br>);``` |

### OrderStatus Enum
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>enum OrderStatus {<br>  PENDING<br>  CONFIRMED<br>  PROCESSING<br>  SHIPPED<br>  DELIVERED<br>  CANCELLED<br>}``` | ```sql<br>CREATE TYPE "OrderStatus" AS ENUM (<br>  'PENDING',<br>  'CONFIRMED',<br>  'PROCESSING',<br>  'SHIPPED',<br>  'DELIVERED',<br>  'CANCELLED'<br>);``` |

### ProjectStatus Enum
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>enum ProjectStatus {<br>  PLANNING<br>  IN_PROGRESS<br>  COMPLETED<br>  ON_HOLD<br>}``` | ```sql<br>CREATE TYPE "ProjectStatus" AS ENUM (<br>  'PLANNING',<br>  'IN_PROGRESS',<br>  'COMPLETED',<br>  'ON_HOLD'<br>);``` |

### MessageRole Enum
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>enum MessageRole {<br>  USER<br>  ASSISTANT<br>  SYSTEM<br>}``` | ```sql<br>CREATE TYPE "MessageRole" AS ENUM (<br>  'USER',<br>  'ASSISTANT',<br>  'SYSTEM'<br>);``` |

---

## 👤 User Management Module

### User Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model User {<br>  id        String   @id @default(cuid())<br>  email     String   @unique<br>  name      String?<br>  phone     String?<br>  role      UserRole @default(REGISTERED)<br>  isActive  Boolean  @default(true)<br>  createdAt DateTime @default(now())<br>  updatedAt DateTime @updatedAt<br><br>  // Relationships...<br><br>  @@map("users")<br>}``` | ```sql<br>CREATE TABLE "users" (<br>    "id" TEXT NOT NULL,<br>    "email" TEXT NOT NULL,<br>    "name" TEXT,<br>    "phone" TEXT,<br>    "role" "UserRole" NOT NULL DEFAULT 'REGISTERED',<br>    "isActive" BOOLEAN NOT NULL DEFAULT true,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "users_pkey" PRIMARY KEY ("id")<br>);``` |

### UserProfile Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model UserProfile {<br>  id              String   @id @default(cuid())<br>  userId          String   @unique<br>  firstName       String?<br>  lastName        String?<br>  avatar          String?<br>  bio             String?<br>  businessName    String?<br>  businessAddress String?<br>  businessPhone   String?<br>  location        String?<br>  preferences     Json?<br>  notifications   Json?<br>  createdAt       DateTime @default(now())<br>  updatedAt       DateTime @updatedAt<br><br>  user User @relation(fields: [userId], references: [id], onDelete: Cascade)<br><br>  @@map("user_profiles")<br>}``` | ```sql<br>CREATE TABLE "user_profiles" (<br>    "id" TEXT NOT NULL,<br>    "userId" TEXT NOT NULL,<br>    "firstName" TEXT,<br>    "lastName" TEXT,<br>    "avatar" TEXT,<br>    "bio" TEXT,<br>    "businessName" TEXT,<br>    "businessAddress" TEXT,<br>    "businessPhone" TEXT,<br>    "location" TEXT,<br>    "preferences" JSONB,<br>    "notifications" JSONB,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")<br>);``` |

### UserSession Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model UserSession {<br>  id        String   @id @default(cuid())<br>  userId    String<br>  token     String   @unique<br>  expiresAt DateTime<br>  createdAt DateTime @default(now())<br><br>  @@map("user_sessions")<br>}``` | ```sql<br>CREATE TABLE "user_sessions" (<br>    "id" TEXT NOT NULL,<br>    "userId" TEXT NOT NULL,<br>    "token" TEXT NOT NULL,<br>    "expiresAt" TIMESTAMP(3) NOT NULL,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")<br>);``` |

---

## 🏠 Real Estate Module

### Property Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model Property {<br>  id            String        @id @default(cuid())<br>  title         String<br>  description   String<br>  propertyType  PropertyType<br>  listingType   ListingType<br>  price         Decimal<br>  location      String<br>  address       String<br>  bedrooms      Int?<br>  bathrooms     Int?<br>  area          Decimal?<br>  images        String[]<br>  features      String[]<br>  coordinates   Json?<br>  isActive      Boolean       @default(true)<br>  agentId       String?<br>  createdAt     DateTime      @default(now())<br>  updatedAt     DateTime      @updatedAt<br><br>  // Relationships<br>  inquiries PropertyInquiry[]<br>  favorites PropertyFavorite[]<br><br>  @@map("properties")<br>}``` | ```sql<br>CREATE TABLE "properties" (<br>    "id" TEXT NOT NULL,<br>    "title" TEXT NOT NULL,<br>    "description" TEXT NOT NULL,<br>    "propertyType" "PropertyType" NOT NULL,<br>    "listingType" "ListingType" NOT NULL,<br>    "price" DECIMAL(65,30) NOT NULL,<br>    "location" TEXT NOT NULL,<br>    "address" TEXT NOT NULL,<br>    "bedrooms" INTEGER,<br>    "bathrooms" INTEGER,<br>    "area" DECIMAL(65,30),<br>    "images" TEXT[],<br>    "features" TEXT[],<br>    "coordinates" JSONB,<br>    "isActive" BOOLEAN NOT NULL DEFAULT true,<br>    "agentId" TEXT,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")<br>);``` |

---

## 🍽️ Food Services Module

### FoodCategory Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model FoodCategory {<br>  id          String     @id @default(cuid())<br>  name        String<br>  description String?<br>  image       String?<br>  isActive    Boolean    @default(true)<br>  createdAt   DateTime   @default(now())<br>  updatedAt   DateTime   @updatedAt<br><br>  items FoodItem[]<br><br>  @@map("food_categories")<br>}``` | ```sql<br>CREATE TABLE "food_categories" (<br>    "id" TEXT NOT NULL,<br>    "name" TEXT NOT NULL,<br>    "description" TEXT,<br>    "image" TEXT,<br>    "isActive" BOOLEAN NOT NULL DEFAULT true,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "food_categories_pkey" PRIMARY KEY ("id")<br>);``` |

### FoodItem Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model FoodItem {<br>  id              String       @id @default(cuid())<br>  name            String<br>  description     String<br>  categoryId      String<br>  price           Decimal<br>  unit            String<br>  minimumOrder    Int          @default(1)<br>  stock           Int          @default(0)<br>  images          String[]<br>  nutritionalInfo Json?<br>  origin          String?<br>  isActive        Boolean      @default(true)<br>  vendorId        String?<br>  createdAt       DateTime     @default(now())<br>  updatedAt       DateTime     @updatedAt<br><br>  category   FoodCategory    @relation(fields: [categoryId], references: [id])<br>  orderItems FoodOrderItem[]<br><br>  @@map("food_items")<br>}``` | ```sql<br>CREATE TABLE "food_items" (<br>    "id" TEXT NOT NULL,<br>    "name" TEXT NOT NULL,<br>    "description" TEXT NOT NULL,<br>    "categoryId" TEXT NOT NULL,<br>    "price" DECIMAL(65,30) NOT NULL,<br>    "unit" TEXT NOT NULL,<br>    "minimumOrder" INTEGER NOT NULL DEFAULT 1,<br>    "stock" INTEGER NOT NULL DEFAULT 0,<br>    "images" TEXT[],<br>    "nutritionalInfo" JSONB,<br>    "origin" TEXT,<br>    "isActive" BOOLEAN NOT NULL DEFAULT true,<br>    "vendorId" TEXT,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")<br>);``` |

---

## 🛒 Marketplace Module

### StoreCategory Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model StoreCategory {<br>  id          String        @id @default(cuid())<br>  name        String<br>  description String?<br>  image       String?<br>  isActive    Boolean       @default(true)<br>  createdAt   DateTime      @default(now())<br>  updatedAt   DateTime      @updatedAt<br><br>  products StoreProduct[]<br><br>  @@map("store_categories")<br>}``` | ```sql<br>CREATE TABLE "store_categories" (<br>    "id" TEXT NOT NULL,<br>    "name" TEXT NOT NULL,<br>    "description" TEXT,<br>    "image" TEXT,<br>    "isActive" BOOLEAN NOT NULL DEFAULT true,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "store_categories_pkey" PRIMARY KEY ("id")<br>);``` |

### StoreProduct Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model StoreProduct {<br>  id          String    @id @default(cuid())<br>  name        String<br>  description String<br>  categoryId  String<br>  price       Decimal<br>  stock       Int       @default(0)<br>  images      String[]<br>  features    String[]<br>  brand       String?<br>  model       String?<br>  isActive    Boolean   @default(true)<br>  createdAt   DateTime  @default(now())<br>  updatedAt   DateTime  @updatedAt<br><br>  category   StoreCategory    @relation(fields: [categoryId], references: [id])<br>  orderItems StoreOrderItem[]<br><br>  @@map("store_products")<br>}``` | ```sql<br>CREATE TABLE "store_products" (<br>    "id" TEXT NOT NULL,<br>    "name" TEXT NOT NULL,<br>    "description" TEXT NOT NULL,<br>    "categoryId" TEXT NOT NULL,<br>    "price" DECIMAL(65,30) NOT NULL,<br>    "stock" INTEGER NOT NULL DEFAULT 0,<br>    "images" TEXT[],<br>    "features" TEXT[],<br>    "brand" TEXT,<br>    "model" TEXT,<br>    "isActive" BOOLEAN NOT NULL DEFAULT true,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "store_products_pkey" PRIMARY KEY ("id")<br>);``` |

---

## 📁 Project Showcase Module

### ProjectCategory Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model ProjectCategory {<br>  id          String    @id @default(cuid())<br>  name        String<br>  description String?<br>  isActive    Boolean   @default(true)<br>  createdAt   DateTime  @default(now())<br>  updatedAt   DateTime  @updatedAt<br><br>  projects Project[]<br><br>  @@map("project_categories")<br>}``` | ```sql<br>CREATE TABLE "project_categories" (<br>    "id" TEXT NOT NULL,<br>    "name" TEXT NOT NULL,<br>    "description" TEXT,<br>    "isActive" BOOLEAN NOT NULL DEFAULT true,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "project_categories_pkey" PRIMARY KEY ("id")<br>);``` |

### Project Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model Project {<br>  id           String    @id @default(cuid())<br>  title        String<br>  description  String<br>  categoryId   String<br>  beforeImages String[]<br>  afterImages  String[]<br>  status       ProjectStatus @default(PLANNING)<br>  budget       Decimal?<br>  startDate    DateTime?<br>  endDate      DateTime?<br>  location     String?<br>  clientName   String?<br>  testimonial  String?<br>  isActive     Boolean   @default(true)<br>  createdAt    DateTime  @default(now())<br>  updatedAt    DateTime  @updatedAt<br><br>  category  ProjectCategory   @relation(fields: [categoryId], references: [id])<br>  inquiries ProjectInquiry[]<br><br>  @@map("projects")<br>}``` | ```sql<br>CREATE TABLE "projects" (<br>    "id" TEXT NOT NULL,<br>    "title" TEXT NOT NULL,<br>    "description" TEXT NOT NULL,<br>    "categoryId" TEXT NOT NULL,<br>    "beforeImages" TEXT[],<br>    "afterImages" TEXT[],<br>    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',<br>    "budget" DECIMAL(65,30),<br>    "startDate" TIMESTAMP(3),<br>    "endDate" TIMESTAMP(3),<br>    "location" TEXT,<br>    "clientName" TEXT,<br>    "testimonial" TEXT,<br>    "isActive" BOOLEAN NOT NULL DEFAULT true,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")<br>);``` |

---

## 📝 Blog Module

### BlogCategory Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model BlogCategory {<br>  id          String     @id @default(cuid())<br>  name        String<br>  description String?<br>  isActive    Boolean    @default(true)<br>  createdAt   DateTime   @default(now())<br>  updatedAt   DateTime   @updatedAt<br><br>  posts BlogPost[]<br><br>  @@map("blog_categories")<br>}``` | ```sql<br>CREATE TABLE "blog_categories" (<br>    "id" TEXT NOT NULL,<br>    "name" TEXT NOT NULL,<br>    "description" TEXT,<br>    "isActive" BOOLEAN NOT NULL DEFAULT true,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")<br>);``` |

### BlogPost Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model BlogPost {<br>  id          String       @id @default(cuid())<br>  title       String<br>  slug        String       @unique<br>  content     String<br>  excerpt     String?<br>  categoryId  String<br>  featuredImage String?<br>  tags        String[]<br>  readingTime Int?<br>  isPublished Boolean      @default(false)<br>  publishedAt DateTime?<br>  authorId    String<br>  createdAt   DateTime     @default(now())<br>  updatedAt   DateTime     @updatedAt<br><br>  category BlogCategory @relation(fields: [categoryId], references: [id])<br><br>  @@map("blog_posts")<br>}``` | ```sql<br>CREATE TABLE "blog_posts" (<br>    "id" TEXT NOT NULL,<br>    "title" TEXT NOT NULL,<br>    "slug" TEXT NOT NULL,<br>    "content" TEXT NOT NULL,<br>    "excerpt" TEXT,<br>    "categoryId" TEXT NOT NULL,<br>    "featuredImage" TEXT,<br>    "tags" TEXT[],<br>    "readingTime" INTEGER,<br>    "isPublished" BOOLEAN NOT NULL DEFAULT false,<br>    "publishedAt" TIMESTAMP(3),<br>    "authorId" TEXT NOT NULL,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")<br>);``` |

---

## 🤖 AI Assistant Module

### AiConversation Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model AiConversation {<br>  id        String      @id @default(cuid())<br>  userId    String<br>  title     String?<br>  language  String      @default("en")<br>  isActive  Boolean     @default(true)<br>  createdAt DateTime    @default(now())<br>  updatedAt DateTime    @updatedAt<br><br>  user     User         @relation(fields: [userId], references: [id], onDelete: Cascade)<br>  messages AiMessage[]<br><br>  @@map("ai_conversations")<br>}``` | ```sql<br>CREATE TABLE "ai_conversations" (<br>    "id" TEXT NOT NULL,<br>    "userId" TEXT NOT NULL,<br>    "title" TEXT,<br>    "language" TEXT NOT NULL DEFAULT 'en',<br>    "isActive" BOOLEAN NOT NULL DEFAULT true,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")<br>);``` |

### AiMessage Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model AiMessage {<br>  id             String   @id @default(cuid())<br>  conversationId String<br>  role           MessageRole<br>  content        String<br>  metadata       Json?<br>  createdAt      DateTime @default(now())<br><br>  conversation AiConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)<br><br>  @@map("ai_messages")<br>}``` | ```sql<br>CREATE TABLE "ai_messages" (<br>    "id" TEXT NOT NULL,<br>    "conversationId" TEXT NOT NULL,<br>    "role" "MessageRole" NOT NULL,<br>    "content" TEXT NOT NULL,<br>    "metadata" JSONB,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")<br>);``` |

### AiTrainingData Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model AiTrainingData {<br>  id        String   @id @default(cuid())<br>  category  String<br>  question  String<br>  answer    String<br>  language  String   @default("en")<br>  isActive  Boolean  @default(true)<br>  createdAt DateTime @default(now())<br>  updatedAt DateTime @updatedAt<br><br>  @@map("ai_training_data")<br>}``` | ```sql<br>CREATE TABLE "ai_training_data" (<br>    "id" TEXT NOT NULL,<br>    "category" TEXT NOT NULL,<br>    "question" TEXT NOT NULL,<br>    "answer" TEXT NOT NULL,<br>    "language" TEXT NOT NULL DEFAULT 'en',<br>    "isActive" BOOLEAN NOT NULL DEFAULT true,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "ai_training_data_pkey" PRIMARY KEY ("id")<br>);``` |

---

## 👨‍💼 Admin Module

### AdminActivity Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model AdminActivity {<br>  id          String   @id @default(cuid())<br>  userId      String<br>  action      String<br>  description String?<br>  metadata    Json?<br>  createdAt   DateTime @default(now())<br><br>  user User @relation(fields: [userId], references: [id])<br><br>  @@map("admin_activities")<br>}``` | ```sql<br>CREATE TABLE "admin_activities" (<br>    "id" TEXT NOT NULL,<br>    "userId" TEXT NOT NULL,<br>    "action" TEXT NOT NULL,<br>    "description" TEXT,<br>    "metadata" JSONB,<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    CONSTRAINT "admin_activities_pkey" PRIMARY KEY ("id")<br>);``` |

### SiteSetting Model
| **Prisma** | **SQL** |
|------------|---------|
| ```prisma<br>model SiteSetting {<br>  id        String   @id @default(cuid())<br>  key       String   @unique<br>  value     String<br>  type      String   @default("string")<br>  createdAt DateTime @default(now())<br>  updatedAt DateTime @updatedAt<br><br>  @@map("site_settings")<br>}``` | ```sql<br>CREATE TABLE "site_settings" (<br>    "id" TEXT NOT NULL,<br>    "key" TEXT NOT NULL,<br>    "value" TEXT NOT NULL,<br>    "type" TEXT NOT NULL DEFAULT 'string',<br>    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,<br>    "updatedAt" TIMESTAMP(3) NOT NULL,<br>    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")<br>);``` |

---

## 🔗 Foreign Key Constraints Conversion

| **Prisma Relationships** | **SQL Foreign Keys** |
|---------------------------|----------------------|
| ```prisma<br>user User @relation(fields: [userId], references: [id], onDelete: Cascade)``` | ```sql<br>ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;``` |
| ```prisma<br>property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)<br>user User @relation(fields: [userId], references: [id], onDelete: Cascade)``` | ```sql<br>ALTER TABLE "property_inquiries" ADD CONSTRAINT "property_inquiries_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;<br>ALTER TABLE "property_inquiries" ADD CONSTRAINT "property_inquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;``` |
| ```prisma<br>category FoodCategory @relation(fields: [categoryId], references: [id])``` | ```sql<br>ALTER TABLE "food_items" ADD CONSTRAINT "food_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "food_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;``` |

---

## 🔑 Unique Constraints Conversion

| **Prisma Unique** | **SQL Unique** |
|-------------------|----------------|
| ```prisma<br>email String @unique``` | ```sql<br>ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");``` |
| ```prisma<br>token String @unique``` | ```sql<br>ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_token_key" UNIQUE ("token");``` |
| ```prisma<br>slug String @unique``` | ```sql<br>ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");``` |
| ```prisma<br>@@unique([propertyId, userId])``` | ```sql<br>ALTER TABLE "property_favorites" ADD CONSTRAINT "property_favorites_propertyId_userId_key" UNIQUE ("propertyId", "userId");``` |

---

## 📊 Sample Data Added in SQL

The SQL schema includes **sample data** that wasn't in your Prisma schema:

### Default Admin User
```sql
INSERT INTO "users" ("id", "email", "name", "role", "createdAt", "updatedAt") 
VALUES ('admin-001', 'admin@brightonhub.com', 'System Administrator', 'ADMIN', NOW(), NOW());

INSERT INTO "user_profiles" ("id", "userId", "firstName", "lastName", "createdAt", "updatedAt")
VALUES ('profile-admin-001', 'admin-001', 'System', 'Administrator', NOW(), NOW());
```

### Sample Categories
```sql
-- Food Categories
INSERT INTO "food_categories" ("id", "name", "description", "createdAt", "updatedAt")
VALUES 
    ('food-cat-001', 'Grains & Cereals', 'Rice, wheat, corn and other grains', NOW(), NOW()),
    ('food-cat-002', 'Vegetables', 'Fresh vegetables and produce', NOW(), NOW()),
    ('food-cat-003', 'Fruits', 'Fresh fruits and tropical produce', NOW(), NOW());

-- Store Categories
INSERT INTO "store_categories" ("id", "name", "description", "createdAt", "updatedAt")
VALUES 
    ('store-cat-001', 'Office Furniture', 'Desks, chairs, and office equipment', NOW(), NOW()),
    ('store-cat-002', 'Building Materials', 'Construction and building supplies', NOW(), NOW()),
    ('store-cat-003', 'Electronics', 'Computers, phones, and electronic devices', NOW(), NOW());
```

### Site Settings
```sql
INSERT INTO "site_settings" ("id", "key", "value", "type", "createdAt", "updatedAt")
VALUES 
    ('setting-001', 'site_name', 'BrightonHub', 'string', NOW(), NOW()),
    ('setting-002', 'contact_email', 'contact@brightonhub.com', 'string', NOW(), NOW()),
    ('setting-003', 'contact_phone', '+234-800-BRIGHTON', 'string', NOW(), NOW()),
    ('setting-004', 'maintenance_mode', 'false', 'boolean', NOW(), NOW());
```

---

## ✅ Conversion Summary

### **Total Models Converted: 20**
- ✅ User Management: 3 models → 3 tables
- ✅ Real Estate: 3 models → 3 tables
- ✅ Food Services: 4 models → 4 tables
- ✅ Marketplace: 4 models → 4 tables
- ✅ Projects: 3 models → 3 tables
- ✅ Blog: 2 models → 2 tables
- ✅ AI Assistant: 3 models → 3 tables
- ✅ Admin: 2 models → 2 tables

### **Total Enums Converted: 7**
- ✅ UserRole
- ✅ PropertyType
- ✅ ListingType
- ✅ InquiryStatus
- ✅ OrderStatus
- ✅ ProjectStatus
- ✅ MessageRole

### **Additional SQL Features:**
- ✅ All Foreign Key Constraints
- ✅ All Unique Constraints
- ✅ Default Admin User
- ✅ Sample Categories for Testing
- ✅ Site Configuration Settings

---

## 🎯 Execution Instructions

1. **Copy the entire content** of `FINAL_COMPLETE_SCHEMA.sql`
2. **Open Supabase Dashboard** → Your Project → SQL Editor
3. **Paste and Execute** the SQL
4. **Verify** all 20 tables are created successfully
5. **Test** with the default admin user: `admin@brightonhub.com`

The conversion is **100% complete** and **ready for production use**! 🚀

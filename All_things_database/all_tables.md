# BrightonHub Database Schema Reference

This document contains the complete database schema for the BrightonHub multi-service platform, including all tables, columns, constraints, and relationships.

---

## 📊 Database Overview

**Total Schemas:** 6 (auth, public, realtime, storage, vault)  
**Total Tables:** 54  
**Core Application Tables:** 32 (in public schema)

---

## 🗂️ Schema Organization

### **AUTH SCHEMA** - Supabase Authentication System
- **Purpose:** User authentication, sessions, MFA, SSO
- **Tables:** 15 (audit_log_entries, flow_state, identities, instances, etc.)

### **PUBLIC SCHEMA** - Application Data  
- **Purpose:** Core business logic and data
- **Tables:** 32 (users, properties, projects, food items, store products, etc.)

### **REALTIME SCHEMA** - Real-time Features
- **Purpose:** Live updates and subscriptions
- **Tables:** 3 (messages, schema_migrations, subscription)

### **STORAGE SCHEMA** - File Management
- **Purpose:** File uploads and storage
- **Tables:** 4 (buckets, migrations, objects, s3_multipart_uploads)

### **VAULT SCHEMA** - Secrets Management  
- **Purpose:** Encrypted secrets storage
- **Tables:** 1 (secrets)

---

## 🏗️ Core Application Tables (PUBLIC SCHEMA)

### **👥 User Management**
| Table | Primary Key | Key Relationships | Purpose |
|-------|-------------|-------------------|----------|
| `users` | id (TEXT) | ← Referenced by 15+ tables | Core user accounts |
| `user_profiles` | id (TEXT) | → users.id | Extended user information |
| `user_sessions` | id (TEXT) | → users.id | User session management |

### **🏠 Real Estate Module**
| Table | Primary Key | Key Relationships | Purpose |
|-------|-------------|-------------------|----------|
| `properties` | id (TEXT) | → property_categories.id | Property listings |
| `property_categories` | id (TEXT) | ← properties.categoryId | Property categorization |
| `property_favorites` | id (TEXT) | → properties.id, users.id | User favorites |
| `property_inquiries` | id (TEXT) | → properties.id, users.id | Property inquiries |

### **🍽️ Food Services Module**
| Table | Primary Key | Key Relationships | Purpose |
|-------|-------------|-------------------|----------|
| `food_items` | id (TEXT) | → food_categories.id | Food product listings |
| `food_categories` | id (TEXT) | ← food_items.categoryId | Food categorization |
| `food_orders` | id (TEXT) | → users.id | Food orders |
| `food_order_items` | id (TEXT) | → food_orders.id, food_items.id | Order line items |

### **🛒 E-commerce Module**
| Table | Primary Key | Key Relationships | Purpose |
|-------|-------------|-------------------|----------|
| `store_products` | id (TEXT) | → store_categories.id | Product catalog |
| `store_categories` | id (TEXT) | ← store_products.categoryId | Product categorization |
| `store_orders` | id (TEXT) | → users.id | Store orders |
| `store_order_items` | id (TEXT) | → store_orders.id, store_products.id | Order line items |

### **🔧 Project Showcase Module**
| Table | Primary Key | Key Relationships | Purpose |
|-------|-------------|-------------------|----------|
| `projects` | id (TEXT) | → project_categories.id | Project portfolio |
| `project_categories` | id (TEXT) | ← projects.categoryId | Project categorization |
| `project_inquiries` | id (TEXT) | → projects.id, users.id | Project inquiries |

### **📝 Content Management**
| Table | Primary Key | Key Relationships | Purpose |
|-------|-------------|-------------------|----------|
| `blog_posts` | id (TEXT) | → blog_categories.id | Blog articles |
| `blog_categories` | id (TEXT) | ← blog_posts.categoryId | Blog categorization |
| `content_blocks` | id (TEXT) | - | Dynamic content blocks |
| `media_gallery` | id (TEXT) | → users.id | Media assets |

### **🔧 Admin & Operations**
| Table | Primary Key | Key Relationships | Purpose |
|-------|-------------|-------------------|----------|
| `vendor_applications` | id (TEXT) | → users.id | Vendor registration |
| `image_uploads` | id (UUID) | → users.id | Image management |
| `contact_messages` | id (TEXT) | → users.id | Contact form submissions |
| `testimonials` | id (UUID) | - | Client testimonials |
| `admin_activities` | id (TEXT) | → users.id | Admin action logs |

### **🤖 AI & Analytics**
| Table | Primary Key | Key Relationships | Purpose |
|-------|-------------|-------------------|----------|
| `ai_conversations` | id (TEXT) | → users.id | AI chat sessions |
| `ai_messages` | id (TEXT) | → ai_conversations.id | AI chat messages |
| `ai_training_data` | id (TEXT) | - | AI training content |

### **📊 Supporting Tables**
| Table | Primary Key | Key Relationships | Purpose |
|-------|-------------|-------------------|----------|
| `tags` | id (TEXT) | ← content_tags.tag_id | Tag system |
| `content_tags` | id (TEXT) | → tags.id | Content tagging |
| `reviews` | id (TEXT) | → users.id | Review system |
| `leads` | id (TEXT) | → users.id | Lead management |
| `media_assets` | id (TEXT) | - | Media asset management |
| `seo_metadata` | id (TEXT) | - | SEO optimization |
| `site_settings` | id (TEXT) | - | Site configuration |

---

## ⚠️ Critical Issues Identified

### **TESTIMONIALS TABLE MISMATCH**
The current `testimonials` table structure **DOES NOT MATCH** our migration expectations:

**Current Structure (In Database):**
```sql
testimonials (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    role VARCHAR(255),
    company VARCHAR(255),
    content TEXT,
    avatar_url TEXT,
    rating INTEGER DEFAULT 5,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

**Expected Structure (From Migration):**
```sql
testimonials (
    id TEXT PRIMARY KEY,
    client_name TEXT,
    client_title TEXT,
    client_company TEXT,
    testimonial_text TEXT,
    service_category TEXT,  -- ❌ MISSING IN CURRENT TABLE
    project_reference TEXT, -- ❌ MISSING IN CURRENT TABLE
    rating INTEGER,
    client_image TEXT,
    is_featured BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

**🚨 This explains the `service_category` column error!**

---

## 📋 Summary & Action Items

### ✅ **Working Tables** (Migration Not Needed)
- `vendor_applications` - Correct structure
- `image_uploads` - Correct structure  
- `contact_messages` - Correct structure

### ❌ **Problematic Tables** (Requires Fix)
- `testimonials` - **WRONG STRUCTURE** - needs column updates

### 🔧 **Required Migration Actions**
1. **Update testimonials table structure** to match expected schema
2. **Add missing columns:** `service_category`, `project_reference`
3. **Rename columns:** `name` → `client_name`, `content` → `testimonial_text`, etc.
4. **Fix data types:** `id` from UUID to TEXT (if needed for consistency)

### 🎯 **Next Steps**
1. Create testimonials table structure fix migration
2. Test migration on non-production environment
3. Update admin components to match final table structure
4. Verify all PostgREST queries work with updated schema

---

<details>
<summary><strong>📊 Detailed Column Information (Click to expand)</strong></summary>

### AUTH SCHEMA TABLES

| table_name | column_name | data_type | constraints | nullable | default |
|------------|-------------|-----------|-------------|----------|---------|
| **audit_log_entries** |
| | instance_id | uuid | | YES | null |
| | id | uuid | PRIMARY KEY | NO | null |
| | payload | json | | YES | null |
| | created_at | timestamp with time zone | | YES | null |
| | ip_address | character varying(64) | | NO | ''::character varying |
| **flow_state** |
| | id | uuid | PRIMARY KEY | NO | null |
| | user_id | uuid | | YES | null |
| | auth_code | text | | NO | null |
| | code_challenge_method | USER-DEFINED | | NO | null |
| | code_challenge | text | | NO | null |
| | provider_type | text | | NO | null |
| | provider_access_token | text | | YES | null |
| | provider_refresh_token | text | | YES | null |
| | created_at | timestamp with time zone | | YES | null |
| | updated_at | timestamp with time zone | | YES | null |
| | authentication_method | text | | NO | null |
| | auth_code_issued_at | timestamp with time zone | | YES | null |
| **identities** |
| | provider_id | text | | NO | null |
| | user_id | uuid | | NO | null |
| | identity_data | jsonb | | NO | null |
| | provider | text | | NO | null |
| | last_sign_in_at | timestamp with time zone | | YES | null |
| | created_at | timestamp with time zone | | YES | null |
| | updated_at | timestamp with time zone | | YES | null |
| | email | text | GENERATED | YES | null |
| | id | uuid | PRIMARY KEY | NO | gen_random_uuid() |
| **users** (auth schema) |
| | instance_id | uuid | | YES | null |
| | id | uuid | PRIMARY KEY | NO | null |
| | aud | character varying(255) | | YES | null |
| | role | character varying(255) | | YES | null |
| | email | character varying(255) | | YES | null |
| | encrypted_password | character varying(255) | | YES | null |
| | email_confirmed_at | timestamp with time zone | | YES | null |
| | invited_at | timestamp with time zone | | YES | null |
| | confirmation_token | character varying(255) | | YES | null |
| | confirmation_sent_at | timestamp with time zone | | YES | null |
| | recovery_token | character varying(255) | | YES | null |
| | recovery_sent_at | timestamp with time zone | | YES | null |
| | email_change_token_new | character varying(255) | | YES | null |
| | email_change | character varying(255) | | YES | null |
| | email_change_sent_at | timestamp with time zone | | YES | null |
| | last_sign_in_at | timestamp with time zone | | YES | null |
| | raw_app_meta_data | jsonb | | YES | null |
| | raw_user_meta_data | jsonb | | YES | null |
| | is_super_admin | boolean | | YES | null |
| | created_at | timestamp with time zone | | YES | null |
| | updated_at | timestamp with time zone | | YES | null |
| | phone | text | | YES | NULL::character varying |
| | phone_confirmed_at | timestamp with time zone | | YES | null |
| | phone_change | text | | YES | ''::character varying |
| | phone_change_token | character varying(255) | | YES | ''::character varying |
| | phone_change_sent_at | timestamp with time zone | | YES | null |
| | confirmed_at | timestamp with time zone | GENERATED | YES | null |
| | email_change_token_current | character varying(255) | | YES | ''::character varying |
| | email_change_confirm_status | smallint(16,0) | | YES | 0 |
| | banned_until | timestamp with time zone | | YES | null |
| | reauthentication_token | character varying(255) | | YES | ''::character varying |
| | reauthentication_sent_at | timestamp with time zone | | YES | null |
| | is_sso_user | boolean | | NO | false |
| | deleted_at | timestamp with time zone | | YES | null |
| | is_anonymous | boolean | | NO | false |

### PUBLIC SCHEMA TABLES

| table_name | column_name | data_type | constraints | nullable | default |
|------------|-------------|-----------|-------------|----------|---------|
| **users** (public schema) |
| | id | text | PRIMARY KEY | NO | null |
| | email | text | | NO | null |
| | name | text | | YES | null |
| | phone | text | | YES | null |
| | role | USER-DEFINED | | NO | 'REGISTERED'::"UserRole" |
| | isActive | boolean | | NO | true |
| | createdAt | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| | updatedAt | timestamp without time zone | | NO | null |
| **user_profiles** |
| | id | text | PRIMARY KEY | NO | null |
| | userId | text | FK → users.id | NO | null |
| | firstName | text | | YES | null |
| | lastName | text | | YES | null |
| | avatar | text | | YES | null |
| | bio | text | | YES | null |
| | businessName | text | | YES | null |
| | businessAddress | text | | YES | null |
| | businessPhone | text | | YES | null |
| | location | text | | YES | null |
| | preferences | jsonb | | YES | null |
| | notifications | jsonb | | YES | null |
| | createdAt | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| | updatedAt | timestamp without time zone | | NO | null |
| **properties** |
| | id | text | PRIMARY KEY | NO | null |
| | title | text | | NO | null |
| | description | text | | NO | null |
| | categoryId | text | FK → property_categories.id | YES | null |
| | propertyType | USER-DEFINED | | NO | null |
| | listingType | USER-DEFINED | | NO | null |
| | price | numeric(65,30) | | NO | null |
| | location | text | | NO | null |
| | address | text | | NO | null |
| | bedrooms | integer(32,0) | | YES | null |
| | bathrooms | integer(32,0) | | YES | null |
| | area | numeric(65,30) | | YES | null |
| | images | ARRAY | | YES | null |
| | features | ARRAY | | YES | null |
| | coordinates | jsonb | | YES | null |
| | isActive | boolean | | NO | true |
| | agentId | text | | YES | null |
| | createdAt | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| | updatedAt | timestamp without time zone | | NO | null |
| | virtual_tour_url | text | | YES | null |
| | amenities | ARRAY | | YES | null |
| | neighborhood_info | jsonb | | YES | null |
| | contact_email | text | | YES | null |
| | contact_phone | text | | YES | null |
| | property_documents | ARRAY | | YES | null |
| | floor_plans | ARRAY | | YES | null |
| | energy_rating | text | | YES | null |
| | furnished | boolean | | YES | false |
| | pet_friendly | boolean | | YES | false |
| | parking_spaces | integer(32,0) | | YES | null |
| | year_built | integer(32,0) | | YES | null |
| | property_tax | numeric(10,2) | | YES | null |
| | hoa_fees | numeric(10,2) | | YES | null |
| | views_count | integer(32,0) | | YES | 0 |
| | lead_count | integer(32,0) | | YES | 0 |
| **projects** |
| | id | text | PRIMARY KEY | NO | null |
| | title | text | | NO | null |
| | description | text | | NO | null |
| | categoryId | text | FK → project_categories.id | NO | null |
| | beforeImages | ARRAY | | YES | null |
| | afterImages | ARRAY | | YES | null |
| | status | USER-DEFINED | | NO | 'PLANNING'::"ProjectStatus" |
| | budget | numeric(65,30) | | YES | null |
| | startDate | timestamp without time zone | | YES | null |
| | endDate | timestamp without time zone | | YES | null |
| | location | text | | YES | null |
| | clientName | text | | YES | null |
| | testimonial | text | | YES | null |
| | isActive | boolean | | NO | true |
| | createdAt | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| | updatedAt | timestamp without time zone | | NO | null |
| | project_type | text | | YES | null |
| | timeline_phases | jsonb | | YES | null |
| | team_members | jsonb | | YES | null |
| | materials_used | ARRAY | | YES | null |
| | techniques_used | ARRAY | | YES | null |
| | challenges_faced | text | | YES | null |
| | solutions_implemented | text | | YES | null |
| | project_size | text | | YES | null |
| | client_industry | text | | YES | null |
| | awards_received | ARRAY | | YES | null |
| | media_coverage | ARRAY | | YES | null |
| | roi_achieved | text | | YES | null |
| | sustainability_features | ARRAY | | YES | null |
| | views_count | integer(32,0) | | YES | 0 |
| | inquiry_count | integer(32,0) | | YES | 0 |
| | contact_name | text | | YES | null |
| | contact_phone | text | | YES | null |
| | contact_email | text | | YES | null |
| | contact_address | text | | YES | null |
| | contactName | text | | YES | null |
| | contactPhone | text | | YES | null |
| | contactEmail | text | | YES | null |
| | contactAddress | text | | YES | null |
| **food_items** |
| | id | text | PRIMARY KEY | NO | null |
| | name | text | | NO | null |
| | description | text | | NO | null |
| | categoryId | text | FK → food_categories.id | NO | null |
| | price | numeric(65,30) | | NO | null |
| | unit | text | | NO | null |
| | minimumOrder | integer(32,0) | | NO | 1 |
| | stock | integer(32,0) | | NO | 0 |
| | images | ARRAY | | YES | null |
| | nutritionalInfo | jsonb | | YES | null |
| | origin | text | | YES | null |
| | isActive | boolean | | NO | true |
| | vendorId | text | | YES | null |
| | createdAt | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| | updatedAt | timestamp without time zone | | NO | null |
| | supplier_info | jsonb | | YES | null |
| | ingredients | ARRAY | | YES | null |
| | allergens | ARRAY | | YES | null |
| | shelf_life | text | | YES | null |
| | storage_instructions | text | | YES | null |
| | certifications | ARRAY | | YES | null |
| | harvest_date | date | | YES | null |
| | weight | numeric(10,2) | | YES | null |
| | packaging_type | text | | YES | null |
| | bulk_pricing | jsonb | | YES | null |
| | seasonal_availability | jsonb | | YES | null |
| | rating | numeric(3,2) | | YES | 0 |
| | review_count | integer(32,0) | | YES | 0 |
| | views_count | integer(32,0) | | YES | 0 |
| | seller_name | text | | YES | null |
| | seller_phone | text | | YES | null |
| | seller_email | text | | YES | null |
| | seller_address | text | | YES | null |
| | seller_description | text | | YES | null |
| | sellerName | text | | YES | null |
| | sellerPhone | text | | YES | null |
| | sellerEmail | text | | YES | null |
| | sellerAddress | text | | YES | null |
| | sellerDescription | text | | YES | null |
| **store_products** |
| | id | text | PRIMARY KEY | NO | null |
| | name | text | | NO | null |
| | description | text | | NO | null |
| | categoryId | text | FK → store_categories.id | NO | null |
| | price | numeric(65,30) | | NO | null |
| | stock | integer(32,0) | | NO | 0 |
| | images | ARRAY | | YES | null |
| | features | ARRAY | | YES | null |
| | brand | text | | YES | null |
| | model | text | | YES | null |
| | isActive | boolean | | NO | true |
| | createdAt | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| | updatedAt | timestamp without time zone | | NO | null |
| | sku | text | | YES | null |
| | weight | numeric(10,2) | | YES | null |
| | dimensions | jsonb | | YES | null |
| | specifications | jsonb | | YES | null |
| | warranty_info | text | | YES | null |
| | return_policy | text | | YES | null |
| | shipping_info | jsonb | | YES | null |
| | bulk_pricing | jsonb | | YES | null |
| | discount_price | numeric(65,30) | | YES | null |
| | tags | ARRAY | | YES | null |
| | rating | numeric(3,2) | | YES | 0 |
| | review_count | integer(32,0) | | YES | 0 |
| | views_count | integer(32,0) | | YES | 0 |
| | is_featured | boolean | | YES | false |
| | vendor_id | text | | YES | null |
| | seller_name | text | | YES | null |
| | seller_phone | text | | YES | null |
| | seller_email | text | | YES | null |
| | seller_address | text | | YES | null |
| | seller_description | text | | YES | null |
| | sellerName | text | | YES | null |
| | sellerPhone | text | | YES | null |
| | sellerEmail | text | | YES | null |
| | sellerAddress | text | | YES | null |
| | sellerDescription | text | | YES | null |
| **blog_posts** |
| | id | text | PRIMARY KEY | NO | null |
| | title | text | | NO | null |
| | slug | text | | NO | null |
| | content | text | | NO | null |
| | excerpt | text | | YES | null |
| | categoryId | text | FK → blog_categories.id | NO | null |
| | featuredImage | text | | YES | null |
| | tags | ARRAY | | YES | null |
| | readingTime | integer(32,0) | | YES | null |
| | isPublished | boolean | | NO | false |
| | publishedAt | timestamp without time zone | | YES | null |
| | authorId | text | | NO | null |
| | createdAt | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| | updatedAt | timestamp without time zone | | NO | null |
| | views | integer(32,0) | | YES | 0 |
| | likes | integer(32,0) | | YES | 0 |
| | meta_title | text | | YES | null |
| | meta_description | text | | YES | null |
| | author_name | text | | YES | null |
| | author_bio | text | | YES | null |
| | author_avatar | text | | YES | null |
| | social_image | text | | YES | null |
| | table_of_contents | jsonb | | YES | null |
| | related_posts | ARRAY | | YES | null |
| | external_links | jsonb | | YES | null |
| | video_url | text | | YES | null |
| | audio_url | text | | YES | null |
| | download_files | ARRAY | | YES | null |
| | is_active | boolean | | YES | true |
| | author_email | text | | YES | null |
| | author_phone | text | | YES | null |
| | authorName | text | | YES | null |
| | authorEmail | text | | YES | null |
| | authorPhone | text | | YES | null |
| | authorBio | text | | YES | null |
| **testimonials** (CURRENT STRUCTURE - PROBLEMATIC) |
| | id | uuid | PRIMARY KEY | NO | gen_random_uuid() |
| | name | character varying(255) | | NO | null |
| | role | character varying(255) | | YES | null |
| | company | character varying(255) | | YES | null |
| | content | text | | NO | null |
| | avatar_url | text | | YES | null |
| | rating | integer(32,0) | | YES | 5 |
| | is_featured | boolean | | YES | false |
| | is_active | boolean | | YES | true |
| | display_order | integer(32,0) | | YES | 0 |
| | created_at | timestamp with time zone | | YES | now() |
| | updated_at | timestamp with time zone | | YES | now() |
| **vendor_applications** |
| | id | text | PRIMARY KEY | NO | null |
| | user_id | text | FK → users.id | NO | null |
| | categories | ARRAY | | NO | null |
| | business_name | text | | NO | null |
| | business_description | text | | NO | null |
| | contact_email | text | | NO | null |
| | contact_phone | text | | YES | null |
| | business_address | text | | YES | null |
| | website_url | text | | YES | null |
| | social_media | jsonb | | YES | null |
| | status | text | | NO | 'pending'::text |
| | submitted_at | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| | reviewed_at | timestamp without time zone | | YES | null |
| | reviewed_by | text | FK → users.id | YES | null |
| | admin_notes | text | | YES | null |
| | documents | ARRAY | | YES | null |
| | verification_data | jsonb | | YES | null |
| | created_at | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| | updated_at | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| **image_uploads** |
| | id | uuid | PRIMARY KEY | NO | gen_random_uuid() |
| | filename | character varying(255) | | NO | null |
| | original_filename | character varying(255) | | NO | null |
| | file_size | integer(32,0) | | NO | null |
| | mime_type | character varying(100) | | NO | null |
| | upload_purpose | character varying(50) | | NO | null |
| | content_type | character varying(50) | | YES | null |
| | content_id | text | | YES | null |
| | uploaded_by | text | FK → users.id | NO | null |
| | storage_path | text | | NO | null |
| | public_url | text | | NO | null |
| | metadata | jsonb | | YES | null |
| | is_active | boolean | | NO | true |
| | created_at | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| | updated_at | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| **contact_messages** |
| | id | text | PRIMARY KEY | NO | null |
| | name | text | | NO | null |
| | email | text | | NO | null |
| | phone | text | | YES | null |
| | subject | text | | NO | null |
| | message | text | | NO | null |
| | category | text | | YES | 'general'::text |
| | status | text | | NO | 'new'::text |
| | priority | text | | NO | 'normal'::text |
| | assigned_to | text | FK → users.id | YES | null |
| | admin_notes | text | | YES | null |
| | ip_address | text | | YES | null |
| | user_agent | text | | YES | null |
| | created_at | timestamp without time zone | | NO | CURRENT_TIMESTAMP |
| | updated_at | timestamp without time zone | | NO | CURRENT_TIMESTAMP |

</details>

---

## 🎯 Migration Requirements

### **Immediate Actions Needed:**

1. **Fix Testimonials Table Structure**
   - Current table has wrong column names and types
   - Missing `service_category` and `project_reference` columns
   - Primary key type mismatch (UUID vs TEXT)

2. **Verify Other Migration Tables**
   - ✅ `vendor_applications` - Exists with correct structure
   - ✅ `image_uploads` - Exists with correct structure  
   - ✅ `contact_messages` - Exists with correct structure
   - ❌ `testimonials` - **REQUIRES STRUCTURE UPDATE**

---
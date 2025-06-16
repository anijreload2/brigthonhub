# Comprehensive User Platform Specification

## Overview
This document outlines the complete user management and vendor platform system for BrightonHub, focusing on contact-based transactions rather than payment processing.

## 1. User Types & Roles

### 1.1 Admin Users
- **Full Access**: Control all aspects of the platform
- **Vendor Management**: Approve/disapprove vendor registrations
- **Content Control**: Manage all listings, testimonials, and site settings
- **User Management**: Register, deregister, approve, and bar users

### 1.2 Vendor Users (4 Types)
All vendors require admin approval before their listings become active.

#### 1.2.1 Property Vendors
- **Access**: Property database and management dashboard
- **Capabilities**: 
  - Upload and manage property listings
  - Monitor inquiries and messages
  - Set contact preferences (address, email, phone, social media)
  - Receive direct messages from interested buyers/renters

#### 1.2.2 Food Vendors
- **Access**: Food items database and management dashboard
- **Capabilities**:
  - Upload and manage food product listings
  - Monitor orders and inquiries
  - Set contact preferences and delivery information
  - Receive direct messages from customers

#### 1.2.3 Marketplace Vendors
- **Access**: Store products database and management dashboard
- **Capabilities**:
  - Upload and manage general product listings
  - Monitor inquiries and orders
  - Set contact preferences and business information
  - Receive direct messages from potential buyers

#### 1.2.4 Project Team Vendors
- **Access**: Projects database and management dashboard
- **Capabilities**:
  - Upload and manage project portfolios
  - Monitor project inquiries
  - Set team contact information and specializations
  - Receive project consultation requests

### 1.3 General Users (Registered)
- **Access**: View all content, bookmark items, send messages, access AI platform
- **Capabilities**:
  - Browse all listings
  - Bookmark favorite items (properties, products, projects)
  - Send messages to vendors through contact forms
  - Receive responses via email
  - Access AI assistant features
  - Create and manage personal profile

### 1.4 Guest Users (Unregistered)
- **Access**: View content and use basic contact features
- **Limitations**: Cannot bookmark items or access AI features

## 2. Contact-Based Transaction System

### 2.1 Cart & Payment Removal
- ✅ Remove all cart functionality from food pages
- ✅ Remove all cart functionality from marketplace pages
- 🔄 Remove remaining "Add to Cart" and "Buy Now" buttons from detail pages
- 🔄 Replace with "Contact Seller" buttons that open contact forms

### 2.2 Vendor Contact Preferences
Vendors can choose which contact methods to display:
- **Email Address**
- **Phone Number**
- **Physical Address**
- **Social Media Links**
- **WhatsApp/Telegram**
- **Website URL**

### 2.3 Contact Forms
Standardized contact forms for all vendor types with:
- Buyer/Inquirer information
- Product/Service of interest
- Message/Inquiry details
- Preferred contact method
- Contact timing preferences

## 3. Standardized Detail Page Structure

### 3.1 Food Detail Pages
**Four Tabs Implementation:**
- **Description**: Product details, origin, features
- **Specifications**: Nutritional info, ingredients, packaging
- **Seller Info**: Vendor contact details and business information
- **Reviews**: Customer feedback and ratings

### 3.2 Marketplace Detail Pages (Current Standard)
**Four Tabs Structure:**
- **Description**: Product overview and features
- **Specifications**: Technical details and specifications
- **Seller Info**: Vendor contact and business details
- **Reviews**: Customer reviews and ratings

### 3.3 Project Detail Pages
**Updates Required:**
- 🔄 Remove client testimony section
- 🔄 Remove "Get Free Quote" button
- 🔄 Remove start and end dates
- 🔄 Add "Contact Us" button opening contact form
- 🔄 Add project team contact section
- **Structure**: Project overview, team info, portfolio, contact form

### 3.4 Property Detail Pages
**Updates Required:**
- 🔄 Remove "Schedule Viewing" button
- 🔄 Update "Contact Agent" to open contact form
- 🔄 Show agent details based on agent's contact preferences
- 🔄 Implement working bookmark (heart) button for registered users
- 🔄 Implement universal share button
- **Structure**: Property details, agent info, location, contact form

## 4. Vendor Dashboard System

### 4.1 Multi-Type Vendor Registration
- Vendors can register for multiple categories (property + food + marketplace + projects)
- Each category requires separate admin approval
- Dashboard shows all approved vendor types with category-specific sections

### 4.2 Vendor Dashboard Features
- **Profile Management**: Business information, contact preferences
- **Listing Management**: Add, edit, delete listings per approved category
- **Message Center**: Receive and respond to customer inquiries
- **Analytics**: Views, contacts, popular listings
- **Status Tracking**: Approval status for each vendor category

### 4.3 Admin Approval Workflow
- Vendor submits registration for specific categories
- Admin reviews vendor application and business details
- Admin approves/disapproves each category individually
- Approved vendors can immediately start adding listings
- Unapproved vendors see "Pending Approval" status

## 5. User Authentication & Authorization

### 5.1 Registration Flow
1. **Guest** → Register → **General User**
2. **General User** → Apply for Vendor Status → **Pending Vendor**
3. **Pending Vendor** → Admin Approval → **Active Vendor**

### 5.2 Permission Matrix
| Feature | Guest | General User | Vendor | Admin |
|---------|-------|--------------|--------|-------|
| View Listings | ✅ | ✅ | ✅ | ✅ |
| Contact Vendors | ✅ | ✅ | ✅ | ✅ |
| Bookmark Items | ❌ | ✅ | ✅ | ✅ |
| AI Assistant | ❌ | ✅ | ✅ | ✅ |
| Vendor Dashboard | ❌ | ❌ | ✅ | ✅ |
| Admin Panel | ❌ | ❌ | ❌ | ✅ |

## 6. Database Schema Updates

### 6.1 User Table Updates
```sql
ALTER TABLE users ADD COLUMN vendor_status JSONB DEFAULT '{}';
-- Structure: {"property": "pending|approved|rejected", "food": "approved", ...}

ALTER TABLE users ADD COLUMN contact_preferences JSONB DEFAULT '{}';
-- Structure: {"email": true, "phone": true, "address": false, ...}
```

### 6.2 New Tables Required
- **user_bookmarks**: Store user bookmarks across all content types
- **vendor_applications**: Track vendor application status
- **contact_messages**: Store contact form submissions
- **vendor_contacts**: Store vendor contact information

## 7. Implementation Phases

### Phase 1: Cart Removal & Contact System ✅🔄
- ✅ Remove cart functionality from food and marketplace pages
- 🔄 Fix remaining "Add to Cart" buttons in detail pages
- 🔄 Implement contact forms for all vendor types

### Phase 2: Detail Page Standardization 🔄
- 🔄 Implement four-tab structure for food detail pages
- 🔄 Update project detail pages (remove quotes, dates, testimonials)
- 🔄 Update property detail pages (remove scheduling, add agent contact)
- 🔄 Implement bookmark and share functionality

### Phase 3: Vendor Management System 📋
- 📋 Create vendor registration flow
- 📋 Build vendor dashboard with multi-category support
- 📋 Implement admin approval workflow
- 📋 Create vendor application tracking

### Phase 4: User Platform Enhancement 📋
- 📋 Implement user bookmarks system
- 📋 Create message center for vendor-customer communication
- 📋 Add user profile management
- 📋 Integrate with existing AI assistant

## 8. Security Considerations

### 8.1 Contact Information Protection
- Vendors control visibility of contact details
- Email addresses can be masked with contact forms
- Phone numbers can be click-to-call without displaying full number

### 8.2 Spam Prevention
- Rate limiting on contact forms
- CAPTCHA for guest users
- Message filtering for inappropriate content

### 8.3 Vendor Verification
- Admin approval prevents fraudulent vendor accounts
- Business verification requirements for vendor applications
- Regular review of vendor performance and customer feedback

## 9. User Experience Improvements

### 9.1 Contact Flow Optimization
- One-click contact buttons on all listings
- Pre-filled contact forms with product/service context
- Clear response time expectations
- Follow-up email confirmations

### 9.2 Vendor Response Management
- Notification system for new inquiries
- Response time tracking and reporting
- Customer feedback on vendor responsiveness

## 10. Success Metrics

### 10.1 Platform Metrics
- Vendor application and approval rates
- Customer inquiry conversion rates
- User registration and engagement rates
- Vendor response times and customer satisfaction

### 10.2 Business Metrics
- Number of active vendors per category
- Monthly contact form submissions
- User retention and platform activity
- Vendor renewal and satisfaction rates

---

**Status**: Specification Complete ✅
**Next**: Begin implementation of Phase 1 and Phase 2 items
**Priority**: Cart removal, contact forms, detail page standardization

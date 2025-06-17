
// BrightonHub Type Definitions

// Supabase Database Type
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          phone?: string | null
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          avatar: string | null
          bio: string | null
          business_name: string | null
          business_address: string | null
          business_phone: string | null
          location: string | null
          preferences: any | null
          notifications: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          avatar?: string | null
          bio?: string | null
          business_name?: string | null
          business_address?: string | null
          business_phone?: string | null
          location?: string | null
          preferences?: any | null
          notifications?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          avatar?: string | null
          bio?: string | null
          business_name?: string | null
          business_address?: string | null
          business_phone?: string | null
          location?: string | null
          preferences?: any | null
          notifications?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string
          category_id: string | null
          property_type: string
          listing_type: string
          price: number
          location: string
          address: string
          bedrooms: number | null
          bathrooms: number | null
          area: number | null
          images: string[]
          features: string[]
          coordinates: any | null
          is_active: boolean
          agent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category_id?: string | null
          property_type: string
          listing_type: string
          price: number
          location: string
          address: string
          bedrooms?: number | null
          bathrooms?: number | null
          area?: number | null
          images?: string[]
          features?: string[]
          coordinates?: any | null
          is_active?: boolean
          agent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category_id?: string | null
          property_type?: string
          listing_type?: string
          price?: number
          location?: string
          address?: string
          bedrooms?: number | null
          bathrooms?: number | null
          area?: number | null
          images?: string[]
          features?: string[]
          coordinates?: any | null
          is_active?: boolean
          agent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      food_items: {
        Row: {
          id: string
          name: string
          description: string
          category_id: string
          price: number
          unit: string
          minimum_order: number
          stock: number
          images: string[]
          nutritional_info: any | null
          origin: string | null
          is_active: boolean
          vendor_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category_id: string
          price: number
          unit: string
          minimum_order?: number
          stock?: number
          images?: string[]
          nutritional_info?: any | null
          origin?: string | null
          is_active?: boolean
          vendor_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category_id?: string
          price?: number
          unit?: string
          minimum_order?: number
          stock?: number
          images?: string[]
          nutritional_info?: any | null
          origin?: string | null
          is_active?: boolean
          vendor_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          category_id: string
          before_images: string[]
          after_images: string[]
          status: string
          budget: number | null
          start_date: string | null
          end_date: string | null
          location: string | null
          client_name: string | null
          testimonial: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category_id: string
          before_images?: string[]
          after_images?: string[]
          status?: string
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          client_name?: string | null
          testimonial?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category_id?: string
          before_images?: string[]
          after_images?: string[]
          status?: string
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          client_name?: string | null
          testimonial?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Application Type Definitions (keeping existing types)
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export enum UserRole {
  GUEST = 'GUEST',
  REGISTERED = 'REGISTERED',
  VENDOR = 'VENDOR',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN'
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  location?: string;
  preferences?: any;
  notifications?: any;
}

export interface PropertyCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  categoryId?: string;
  category?: PropertyCategory;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  location: string;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images: string[];
  features: string[];
  coordinates?: any;
  isActive: boolean;
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields for vendor listings
  isVendorListing?: boolean;
  vendor?: {
    id: string;
    name: string;
    email: string;
  };
}

export enum PropertyType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
  MIXED_USE = 'MIXED_USE'
}

export enum ListingType {
  SALE = 'SALE',
  RENT = 'RENT'
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  unit: string;
  minimumOrder: number;
  stock: number;
  images: string[];
  nutritionalInfo?: any;
  origin?: string;
  isActive: boolean;
  vendorId?: string;
  category?: FoodCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
  images: string[];
  features: string[];
  brand?: string;
  model?: string;
  isActive: boolean;
  category?: StoreCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  beforeImages: string[];
  afterImages: string[];
  status: ProjectStatus;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  clientName?: string;
  testimonial?: string;
  isActive: boolean;
  category?: ProjectCategory;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD'
}

export interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId: string;
  featuredImage?: string;
  tags: string[];
  readingTime?: number;
  isPublished: boolean;
  publishedAt?: Date;
  authorId: string;
  category?: BlogCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface AiConversation {
  id: string;
  userId: string;
  title?: string;
  language: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages?: AiMessage[];
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: any;
  createdAt: Date;
}

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum InquiryStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  CLOSED = 'CLOSED'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search and Filter Types
export interface PropertyFilters {
  propertyType?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  minArea?: number;
  maxArea?: number;
}

export interface FoodFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  origin?: string;
  inStock?: boolean;
}

export interface StoreFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  inStock?: boolean;
}

export interface ProjectFilters {
  categoryId?: string;
  status?: ProjectStatus;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
}

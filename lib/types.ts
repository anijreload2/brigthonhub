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
      blogs: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string | null
          author_id: string
          category_id: string | null
          status: string
          published_at: string | null
          featured_image: string | null
          tags: string[]
          meta_title: string | null
          meta_description: string | null
          slug: string
          views_count: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string | null
          author_id: string
          category_id?: string | null
          status?: string
          published_at?: string | null
          featured_image?: string | null
          tags?: string[]
          meta_title?: string | null
          meta_description?: string | null
          slug: string
          views_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string | null
          author_id?: string
          category_id?: string | null
          status?: string
          published_at?: string | null
          featured_image?: string | null
          tags?: string[]
          meta_title?: string | null
          meta_description?: string | null
          slug?: string
          views_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          subject: string | null
          content: string
          message_type: string
          thread_id: string | null
          parent_id: string | null
          is_read: boolean
          read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          subject?: string | null
          content: string
          message_type?: string
          thread_id?: string | null
          parent_id?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          subject?: string | null
          content?: string
          message_type?: string
          thread_id?: string | null
          parent_id?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          slug: string
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          slug: string
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          slug?: string
          parent_id?: string | null
          sort_order?: number
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
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
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
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  bio?: string;
  business_name?: string;
  business_address?: string;
  business_phone?: string;
  location?: string;
  preferences?: any;
  notifications?: any;
  created_at: Date;
  updated_at: Date;
}

export interface PropertyCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  category_id?: string;
  category?: PropertyCategory;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  location: string;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images: string[];
  features: string[];
  coordinates?: any;
  is_active: boolean;
  agent_id?: string;
  created_at: Date;
  updated_at: Date;
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
  category_id: string;
  price: number;
  unit: string;
  minimum_order: number;
  stock: number;
  images: string[];
  nutritional_info?: any;
  origin?: string;
  is_active: boolean;
  vendor_id?: string;
  category?: FoodCategory;
  created_at: Date;
  updated_at: Date;
}

export interface FoodCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  is_active: boolean;
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  category_id: string;
  price: number;
  stock: number;
  images: string[];
  features: string[];
  brand?: string;
  model?: string;
  is_active: boolean;
  category?: StoreCategory;
  created_at: Date;
  updated_at: Date;
}

export interface StoreCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  is_active: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category_id: string;
  before_images: string[];
  after_images: string[];
  status: ProjectStatus;
  budget?: number;
  start_date?: Date;
  end_date?: Date;
  location?: string;
  client_name?: string;
  testimonial?: string;
  is_active: boolean;
  category?: ProjectCategory;
  created_at: Date;
  updated_at: Date;
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
  is_active: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category_id: string;
  featured_image?: string;
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  reading_time?: number;
  status: string;
  published_at?: Date;
  author_id: string;
  views_count: number;
  category?: BlogCategory;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BlogCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface AiConversation {
  id: string;
  user_id: string;
  title?: string;
  language: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  messages?: AiMessage[];
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: any;
  created_at: Date;
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
  category_id?: string;
  minPrice?: number;
  maxPrice?: number;
  origin?: string;
  inStock?: boolean;
}

export interface StoreFilters {
  category_id?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  inStock?: boolean;
}

export interface ProjectFilters {
  category_id?: string;
  status?: ProjectStatus;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject?: string;
  content: string;
  message_type: string;
  thread_id?: string;
  parent_id?: string;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
  updated_at: Date;
  sender?: User;
  recipient?: User;
  parent?: Message;
  replies?: Message[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: CategoryType;
  slug: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  parent?: Category;
  children?: Category[];
}

export enum CategoryType {
  PROJECT = 'project',
  PROPERTY = 'property',
  FOOD = 'food',
  BLOG = 'blog'
}

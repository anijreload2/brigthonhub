
// BrightonHub Constants
export const BRAND_COLORS = {
  primary: '#005288',
  secondary: '#8CC63F',
  accent: '#FF6B00',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

export const LANGUAGES = {
  en: 'English',
  yo: 'Yoruba',
  ha: 'Hausa',
  ig: 'Igbo'
};

export const CURRENCY = {
  symbol: '₦',
  code: 'NGN',
  name: 'Nigerian Naira'
};

export const PROPERTY_TYPES = [
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'LAND', label: 'Land' },
  { value: 'MIXED_USE', label: 'Mixed Use' }
];

export const LISTING_TYPES = [
  { value: 'SALE', label: 'For Sale' },
  { value: 'RENT', label: 'For Rent' }
];

export const PROJECT_STATUSES = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On Hold' }
];

export const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

export const USER_ROLES = [
  { value: 'GUEST', label: 'Guest' },
  { value: 'REGISTERED', label: 'Registered User' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'AGENT', label: 'Agent' },
  { value: 'ADMIN', label: 'Administrator' }
];

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const FOOD_UNITS = [
  'kg', 'g', 'tonnes', 'bags', 'baskets', 'crates', 'pieces', 'bunches'
];

export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100
};

export const IMAGE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 10
};

export const CONTACT_INFO = {
  email: 'info@brightonhub.ng',
  phone: '+234 800 000 0000',
  address: 'Lagos, Nigeria',
  website: 'https://brightonhub.ng'
};

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/brightonhub',
  twitter: 'https://twitter.com/brightonhub',
  instagram: 'https://instagram.com/brightonhub',
  linkedin: 'https://linkedin.com/company/brightonhub'
};

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  PROPERTIES: '/api/properties',
  FOOD: '/api/food',
  STORE: '/api/store',
  PROJECTS: '/api/projects',
  BLOG: '/api/blog',
  AI: '/api/ai',
  ADMIN: '/api/admin',
  UPLOAD: '/api/upload'
};

export const ROUTES = {
  HOME: '/',
  PROPERTIES: '/properties',
  FOOD: '/food',
  STORE: '/store',
  PROJECTS: '/projects',
  BLOG: '/blog',
  AI: '/ai-assistant',
  PROFILE: '/profile',
  ADMIN: '/admin',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password'
  }
};

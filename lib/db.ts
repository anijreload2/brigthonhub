// Export Supabase clients for database operations
export { supabase, getAdminClient } from './supabase'

// Legacy support - gradually remove these imports from other files
export const db = null // Placeholder to prevent immediate breaking changes

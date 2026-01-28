import { createClient } from '@supabase/supabase-js'

// This safely pulls the keys from your .env file or Netlify settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// If the keys are missing, this will show a helpful error in the console
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase keys are missing! Check your .env file or Netlify settings.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
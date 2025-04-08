
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Log configuration presence for debugging
console.log('Supabase configuration:', { 
  urlPresent: !!supabaseUrl, 
  keyPresent: !!supabaseAnonKey 
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Initialize Supabase client with fallbacks if values are missing
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  { 
    auth: { persistSession: true },
    db: { schema: 'public' }
  }
);

// Verify connection but don't block app rendering
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error.message);
  } else {
    console.log('Supabase connection successful');
  }
});

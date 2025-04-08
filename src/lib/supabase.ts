
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing from environment variables!');
}

console.log('Initializing Supabase client with:', { 
  urlPresent: !!supabaseUrl, 
  keyPresent: !!supabaseAnonKey 
});

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  { 
    auth: { persistSession: true },
    db: { schema: 'public' }
  }
);

// Verify connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('Supabase connection successful', data);
  }
});

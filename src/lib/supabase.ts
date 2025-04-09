
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Using the provided Supabase URL and public anon key
export const supabase = createClient<Database>(
  'https://fynkygotvuqlsiqmpmbz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bmt5Z290dnVxbHNpcW1wbWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTM4OTksImV4cCI6MjA1OTY2OTg5OX0.l7OOAipajIpDV_MCIjv0YTfrI9SL9hNNgw_mvCCuUGw'
);

// Log connection status without blocking UI
console.log('Supabase: Connecting to your database...');

// Test connection by making a simple query
supabase
  .from('movies')
  .select('count()', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('Supabase connection error:', error.message);
    } else {
      console.log(`Supabase connected successfully! Found ${count} movies.`);
    }
  })
  .catch((err) => {
    console.error('Supabase connection failed:', err.message);
  });

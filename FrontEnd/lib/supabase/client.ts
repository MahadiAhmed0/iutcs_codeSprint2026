import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Supabase client init:', { 
    url: url ? url.substring(0, 30) + '...' : 'MISSING',
    keyExists: !!key 
  });
  
  if (!url || !key) {
    console.error('Supabase credentials missing!');
  }
  
  return createBrowserClient(url!, key!);
}

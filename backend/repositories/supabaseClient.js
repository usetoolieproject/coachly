import { createClient } from '@supabase/supabase-js';

export const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://sguavpabcxeppkgwdssl.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseKey) {
    console.error('❌ CRITICAL: No Supabase key found in environment variables!');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  
  console.log('🔌 Supabase connecting to:', supabaseUrl);
  console.log('🔑 Key type:', supabaseKey.substring(0, 20) + '...');
  
  return createClient(supabaseUrl, supabaseKey);
};

// Create a default supabase client instance
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://sguavpabcxeppkgwdssl.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseKey) {
  console.error('❌ CRITICAL: No Supabase key found for default client!');
}
export const supabase = createClient(supabaseUrl, supabaseKey || 'missing-key');



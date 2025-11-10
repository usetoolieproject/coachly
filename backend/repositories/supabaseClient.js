import { createClient } from '@supabase/supabase-js';

export const getSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sguavpabcxeppkgwdssl.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndWF2cGFiY3hlcHBrZ3dkc3NsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAxMDkxMCwiZXhwIjoyMDc1NTg2OTEwfQ.o2C2QJYOd-fo74f_qbH3y6omr1xahziI0ongCMF84Zc';
  return createClient(supabaseUrl, supabaseKey);
};

// Create a default supabase client instance
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sguavpabcxeppkgwdssl.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndWF2cGFiY3hlcHBrZ3dkc3NsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAxMDkxMCwiZXhwIjoyMDc1NTg2OTEwfQ.o2C2QJYOd-fo74f_qbH3y6omr1xahziI0ongCMF84Zc';
export const supabase = createClient(supabaseUrl, supabaseKey);



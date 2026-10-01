import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nuqqyasxaxckrsgwrdmv.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51cXF5YXN4YXhja3JzZ3dyZG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTA1MzQsImV4cCI6MjEwNDI4NjUzNH0.MBnhmj9x7GJkJIvvqAvG6nREJjrm3PcRIMT2nZQsqf0';

export const supabase = createClient(supabaseUrl, supabaseKey);

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hkdofsoadrdtbnfedsdz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZG9mc29hZHJkdGJuZmVkc2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxNTI1MDgsImV4cCI6MjA0NTcyODUwOH0.qzpKljsBvOUIXS5Str98jdGTGTrBAcy-IsFf13zPFpc'

export const supabase = createClient(supabaseUrl, supabaseKey)
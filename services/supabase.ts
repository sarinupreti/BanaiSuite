import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zulubpefionyabryenfq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1bHVicGVmaW9ueWFicnllbmZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDQ2OTUsImV4cCI6MjA2ODc4MDY5NX0.SsORiiJ2MjQV0vIVv2gd76dAYS1d0vK0s0vLC7mF7JI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

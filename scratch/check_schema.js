import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function check() {
  // Try to get info about the table
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'kpi_stats' })
  if (error) {
    // If RPC doesn't exist, try a simple select and check metadata if possible
    const { data: sample, error: err2 } = await supabase.from('kpi_stats').select('*').limit(1)
    console.log('Sample data:', sample)
    if (err2) console.error('Error selecting:', err2)
  } else {
    console.log('Table info:', data)
  }
}

check()

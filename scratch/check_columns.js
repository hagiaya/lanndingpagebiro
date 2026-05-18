import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function check() {
  const { data, error } = await supabase.from('kpi_stats').select('*').limit(1)
  if (error) {
    console.error('Error selecting:', error)
  } else if (data && data.length > 0) {
    console.log('Columns in kpi_stats:', Object.keys(data[0]))
    console.log('Sample row:', data[0])
  } else {
    console.log('No data in kpi_stats. Trying to guess columns...')
  }
}

check()

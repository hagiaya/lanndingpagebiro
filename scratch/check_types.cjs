const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function check() {
  const { data, error } = await supabase.from('kpi_stats').select('*').limit(1)
  if (data && data.length > 0) {
    console.log('Columns and types found:')
    for (const [key, val] of Object.entries(data[0])) {
      console.log(`- ${key}: ${typeof val} (Sample: ${val})`)
    }
  } else {
    // If no data, try to insert a dummy to see errors or just check if it works
    console.log('No data found in kpi_stats.')
  }
}

check()

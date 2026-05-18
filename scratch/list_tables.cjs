const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function check() {
  const { data, error } = await supabase.rpc('get_tables')
  if (error) {
     // If rpc fails, try to list common tables
     const tables = ['employees', 'activities', 'mails', 'photos', 'kpi_stats', 'attendance', 'custom_metrics']
     for (const t of tables) {
       const { data: d, error: e } = await supabase.from(t).select('*').limit(1)
       if (!e) console.log(`Table ${t} exists. Sample:`, d[0] ? Object.keys(d[0]) : 'Empty')
     }
  } else {
    console.log('Tables:', data)
  }
}

check()

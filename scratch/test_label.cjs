const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function test() {
  console.log('Testing update on kpi_stats using label column...')
  const { data, error } = await supabase
    .from('kpi_stats')
    .upsert({ key: 'ORG_STRUCTURE', value: 0, label: '{"test": "json"}' })
    .select()
  
  if (error) {
    console.error('Upsert Error:', JSON.stringify(error, null, 2))
  } else {
    console.log('Upsert Success:', data)
  }
}

test()

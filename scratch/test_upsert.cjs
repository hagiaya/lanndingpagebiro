const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function test() {
  console.log('Testing update on kpi_stats...')
  const { data, error } = await supabase
    .from('kpi_stats')
    .update({ value: 'test_value' })
    .eq('key', 'ORG_STRUCTURE')
    .select()
  
  if (error) {
    console.error('Update Error:', JSON.stringify(error, null, 2))
  } else {
    console.log('Update Success:', data)
    if (!data || data.length === 0) {
      console.log('No record found, trying insert...')
      const { error: insertError } = await supabase
        .from('kpi_stats')
        .insert({ key: 'ORG_STRUCTURE', value: 'test_value' })
      if (insertError) console.error('Insert Error:', JSON.stringify(insertError, null, 2))
      else console.log('Insert Success')
    }
  }
}

test()

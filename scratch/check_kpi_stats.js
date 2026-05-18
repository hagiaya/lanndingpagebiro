import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').replace(/['"]/g, '').trim();
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkKpiStats() {
  console.log('Fetching all kpi_stats rows...');
  const { data: rows, error } = await supabase.from('kpi_stats').select('*');
  if (error) {
    console.error('Error fetching kpi_stats:', error);
    return;
  }
  console.log('kpi_stats rows:', JSON.stringify(rows, null, 2));
}

checkKpiStats();

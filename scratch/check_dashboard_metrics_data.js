import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').replace(/['"]/g, '').trim();
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkMetrics() {
  console.log('Fetching all dashboard_metrics rows...');
  const { data: rows, error } = await supabase.from('dashboard_metrics').select('*');
  if (error) {
    console.error('Error fetching dashboard_metrics:', error);
    return;
  }
  console.log('dashboard_metrics rows:', JSON.stringify(rows, null, 2));
}

checkMetrics();

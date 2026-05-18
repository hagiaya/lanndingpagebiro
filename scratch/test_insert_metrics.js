import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').replace(/['"]/g, '').trim();
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('dashboard_metrics').upsert([
    { category: 'TEST_CAT', year: '2026', score: '' }
  ]);
  if (error) {
    console.error('UPSERT ERROR:', error);
  } else {
    console.log('UPSERT SUCCESS:', data);
  }
}

check();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').replace(/['"]/g, '').trim();
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function delete2026() {
  console.log('Deleting 2026 rows for Nilai SAKIP, Indeks BerAkhlak, and Index Reformasi Birokrasi...');
  const { error } = await supabase
    .from('dashboard_metrics')
    .delete()
    .eq('year', '2026')
    .in('category', ['Nilai SAKIP', 'Indeks BerAkhlak', 'Index Reformasi Birokrasi']);
    
  if (error) {
    console.error('Error deleting:', error);
  } else {
    console.log('Successfully deleted all 2026 rows for these categories!');
  }
}

delete2026();

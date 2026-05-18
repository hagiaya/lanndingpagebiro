import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').replace(/['"]/g, '').trim();
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { error } = await supabase.from('attendance').select('*').order('date', { ascending: false }).limit(1);
  if (error) console.log("Order by date error:", error.message);
  
  const { error: err2 } = await supabase.from('attendance').select('*').order('timestamp', { ascending: false }).limit(1);
  if (err2) console.log("Order by timestamp error:", err2.message);

  const { error: err3 } = await supabase.from('attendance').select('*').order('time', { ascending: false }).limit(1);
  if (err3) console.log("Order by time error:", err3.message);
  
  const { error: err4 } = await supabase.from('attendance').select('*').order('id', { ascending: false }).limit(1);
  if (err4) console.log("Order by id error:", err4.message);
}

test();

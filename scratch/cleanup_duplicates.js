import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').replace(/['"]/g, '').trim();
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function cleanup() {
  console.log('Fetching all dashboard metrics...');
  const { data: rows, error } = await supabase.from('dashboard_metrics').select('*');
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  console.log(`Found ${rows.length} total rows.`);
  
  // Group by category and year
  const groups = {};
  rows.forEach(row => {
    const key = `${row.category}|||${row.year}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });
  
  const idsToDelete = [];
  
  Object.entries(groups).forEach(([key, groupRows]) => {
    if (groupRows.length > 1) {
      console.log(`Duplicate found for "${key}": ${groupRows.length} rows.`);
      // Keep the first one, delete the rest
      const [keep, ...duplicates] = groupRows;
      duplicates.forEach(dup => {
        idsToDelete.push(dup.id);
      });
    }
  });
  
  if (idsToDelete.length > 0) {
    console.log(`Deleting ${idsToDelete.length} duplicate rows...`);
    const { error: deleteError } = await supabase
      .from('dashboard_metrics')
      .delete()
      .in('id', idsToDelete);
      
    if (deleteError) {
      console.error('Delete error:', deleteError);
    } else {
      console.log('Cleanup completed successfully!');
    }
  } else {
    console.log('No duplicates found in database.');
  }
}

cleanup();

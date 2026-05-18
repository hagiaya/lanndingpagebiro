import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').replace(/['"]/g, '').trim();
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function thoroughCleanup() {
  console.log('Fetching all dashboard metrics...');
  const { data: rows, error } = await supabase.from('dashboard_metrics').select('*');
  if (error) {
    console.error('Error fetching metrics:', error);
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
      console.log(`Duplicates found for "${key}": ${groupRows.length} rows.`);
      
      // Sort to keep the best one: prefer non-zero score, then by id
      groupRows.sort((a, b) => {
        if (a.score !== 0 && b.score === 0) return -1;
        if (a.score === 0 && b.score !== 0) return 1;
        return a.id.localeCompare(b.id);
      });
      
      const keep = groupRows[0];
      const duplicates = groupRows.slice(1);
      
      console.log(`  Keeping row ID: ${keep.id} (score: ${keep.score})`);
      duplicates.forEach(dup => {
        console.log(`  Adding duplicate to delete: ${dup.id} (score: ${dup.score})`);
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
      console.log('Thorough cleanup completed successfully!');
    }
  } else {
    console.log('No duplicate (category, year) pairs found.');
  }
}

thoroughCleanup();

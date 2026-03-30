import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Auth helpers ─────────────────────────────────────────────────────────────
export const signOut = () => {
  localStorage.clear();
  return Promise.resolve();
};

// ── Table name constants ─────────────────────────────────────────────────────
export const TABLES = {
  USERS:         'users',
  FOODS:         'foods',
  FOOD_LOGS:     'food_logs',
  WORKOUTS:      'workouts',
  WORKOUT_LOGS:  'workout_logs',
  CLIENTS:       'clients'
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Dumbbell, ArrowLeft } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const trainerId = localStorage.getItem('clientId');
    supabase.from('workouts').select('*').eq('trainer_id', trainerId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setWorkouts(data || []); setLoading(false); });
  }, []);

  return (
    <div className="trainer-dashboard">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
        <Link to="/trainer-dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-dim)', fontSize: 13, textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Trainer Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="text-gradient" style={{ fontSize: '2rem', margin: 0 }}>Workouts</h2>
          <Link to="/trainer/workouts/new" className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Plus size={16} /> New Workout
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="loader" style={{ margin: '0 auto' }} /></div>
        ) : workouts.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <Dumbbell size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ color: 'var(--color-text-dim)' }}>No workout plans yet.</p>
            <Link to="/trainer/workouts/new" className="primary-button" style={{ display: 'inline-flex', marginTop: '1rem', textDecoration: 'none' }}>
              Build First Workout
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {workouts.map(w => (
              <div key={w.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: 15 }}>{w.name}</strong>
                  <p style={{ fontSize: 13, color: 'var(--color-text-dim)', margin: '4px 0 0' }}>
                    {(w.exercises || []).length} exercises
                    {w.notes ? ` · ${w.notes.slice(0, 50)}` : ''}
                  </p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>
                  {new Date(w.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dumbbell, ClipboardCheck, Clock, ListChecks, CheckCircle2, Loader2, Play } from 'lucide-react';
import { supabase, TABLES } from '../../services/supabaseClient';

export default function Workout() {
  const navigate = useNavigate();
  const clientId = localStorage.getItem('clientId');
  
  const [assignedWorkouts, setAssigned] = useState([]);
  const [history, setHistory]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [loggingId, setLoggingId]       = useState(null);
  const [diaryDate, setDiaryDate]       = useState(new Date());
  const dateScrollRef                   = useRef(null);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (dateScrollRef.current) {
        dateScrollRef.current.scrollLeft = dateScrollRef.current.scrollWidth;
    }
  }, []);

  async function load() {
    try {
      // 1. Fetch Assigned Workouts + Workout Details
      // We join through 'assigned_workouts' to 'workouts'
      const { data: assigned, error: assignError } = await supabase
        .from('assigned_workouts')
        .select(`
          id,
          status,
          workout_id,
          workouts (
            id,
            name,
            notes,
            exercises
          )
        `)
        .eq('client_id', clientId)
        .eq('status', 'active');

      if (assignError) throw assignError;
      setAssigned(assigned || []);

      // 2. Fetch recent history from workout_logs
      const { data: recent, error: historyError } = await supabase
        .from(TABLES.WORKOUT_LOGS)
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;
      setHistory(recent || []);

    } catch (err) {
      console.error('Error loading workout data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function logWorkout(workout) {
    setLoggingId(workout.id);
    try {
      // Create entries in workout_logs for each exercise in the block
      const entries = workout.workouts.exercises.map(ex => ({
        client_id: clientId,
        exercise: ex.name,
        category: 'Assigned',
        value: `${ex.sets}x${ex.reps}`,
        calories_burnt: 0,
        created_at: diaryDate.toISOString()
      }));

      const { error } = await supabase.from(TABLES.WORKOUT_LOGS).insert(entries);
      if (error) throw error;

      alert("Workout session logged successfully!");
      load(); // Refresh
    } catch (err) {
      console.error('Error logging session:', err);
      alert('Failed to log session.');
    } finally {
      setLoggingId(null);
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--color-bg-main)' }}>
      <Loader2 className="animate-spin" color="var(--color-primary)" size={40} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)', padding: '20px 20px 40px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#fff' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Workouts</h1>
      </header>

      {/* Assigned Workouts */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <ClipboardCheck size={18} color="var(--color-primary)" />
          <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--color-text-dim)', margin: 0 }}>Your Training Plan</h2>
        </div>

        {assignedWorkouts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <Dumbbell size={32} style={{ color: 'var(--color-text-dim)', opacity: 0.3, marginBottom: 12 }} />
            <p style={{ color: 'var(--color-text-dim)', fontSize: 13, margin: 0 }}>No active workouts assigned by your coach yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {assignedWorkouts.map(item => (
              <div key={item.id} className="glass-panel slide-up" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-display)' }}>{item.workouts.name}</h3>
                    {item.workouts.notes && <p style={{ fontSize: 12, color: 'var(--color-text-dim)', marginTop: 4 }}>{item.workouts.notes}</p>}
                  </div>
                  <button 
                    disabled={loggingId === item.id}
                    onClick={() => logWorkout(item)}
                    className="primary-button" 
                    style={{ padding: '8px 16px', fontSize: 12, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {loggingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                    Log Session
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {item.workouts.exercises.map((ex, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{ex.name}</span>
                      <span style={{ fontSize: 13, color: 'var(--color-primary)' }}>{ex.sets} x {ex.reps} <span style={{ color: 'var(--color-text-dim)', fontSize: 11, marginLeft: 6 }}>{ex.rest}s rest</span></span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Clock size={18} color="var(--color-primary)" />
          <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--color-text-dim)', margin: 0 }}>Recent Activity</h2>
        </div>

        {/* 30-Day Scrollable Calendar */}
        <div 
            className="hide-scrollbar"
            ref={dateScrollRef}
            style={{ 
                display: 'flex', 
                overflowX: 'auto', 
                gap: '0.8rem', 
                paddingBottom: '0.5rem', 
                marginBottom: '1.5rem',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth'
            }}
        >
            {[...Array(30)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - 29 + i);
                const isSelected = d.toLocaleDateString() === diaryDate.toLocaleDateString();
                const isToday = d.toLocaleDateString() === new Date().toLocaleDateString();
                return (
                    <button
                        key={i}
                        onClick={() => setDiaryDate(d)}
                        style={{
                            flex: '0 0 auto',
                            minWidth: '60px',
                            padding: '0.8rem 0.5rem',
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            background: isSelected ? 'rgba(163,230,53,0.1)' : 'rgba(255,255,255,0.02)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            color: '#fff'
                        }}
                    >
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: isSelected ? 'var(--primary)' : 'var(--text-dim)', fontWeight: 600 }}>
                            {isToday ? 'Today' : d.toLocaleDateString([], { weekday: 'short' })}
                        </span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : '#fff' }}>
                            {d.getDate()}
                        </span>
                    </button>
                );
            })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(() => {
              const selectedDateStr = diaryDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
              const dayLogs = history.filter(item => new Date(item.created_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) === selectedDateStr);
              
              if (dayLogs.length === 0) {
                  return <p style={{ fontSize: 13, color: 'var(--color-text-dim)', textAlign: 'center', padding: '1rem' }}>No activity logged on this date.</p>;
              }

              return dayLogs.map(log => (
                  <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{log.exercise}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{log.value}</div>
                    </div>
                    <CheckCircle2 size={16} color="var(--color-primary)" opacity={0.6} />
                  </div>
              ));
          })()}
        </div>
      </section>
    </div>
  );
}

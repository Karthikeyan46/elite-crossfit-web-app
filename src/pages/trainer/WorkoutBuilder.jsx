// WorkoutBuilder.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { supabase, TABLES } from '../../services/supabaseClient';

const PRESETS = ['Bench Press','Squat','Deadlift','Pull-ups','Push-ups','Overhead Press','Barbell Row','Lunges','Plank','Dumbbell Curl','Tricep Dips','Leg Press','Cable Row','Lat Pulldown','Hip Thrust'];

export default function WorkoutBuilder() {
  const navigate = useNavigate();
  const [name, setName]       = useState('');
  const [notes, setNotes]     = useState('');
  const [exs, setExs]         = useState([{ name: '', sets: 3, reps: 10, rest: 60 }]);
  const [clients, setClients] = useState([]);
  const [assignTo, setAssignTo] = useState('');
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  useEffect(() => {
    supabase.from(TABLES.PROFILES).select('id,name').eq('role','client').order('name').then(({ data }) => setClients(data || []));
  }, []);

  const update = (i, k, v) => setExs(p => p.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const remove = i => setExs(p => p.filter((_, idx) => idx !== i));
  const add    = () => setExs(p => [...p, { name: '', sets: 3, reps: 10, rest: 60 }]);

  async function save() {
    if (!name.trim())              { setErr('Give this workout a name.'); return; }
    if (exs.some(e => !e.name.trim())) { setErr('All exercises need a name.'); return; }
    setSaving(true); setErr('');

    const trainerId = localStorage.getItem('clientId');
    const { data: w, error } = await supabase
      .from('workouts')
      .insert({ trainer_id: trainerId, name: name.trim(), notes, exercises: exs })
      .select().single();

    if (error) { setErr(error.message); setSaving(false); return; }

    if (assignTo) {
      await supabase.from('assigned_workouts').insert({ workout_id: w.id, client_id: assignTo, status: 'active' });
    }
    navigate('/trainer/workouts');
  }

  const inp = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 14, padding: '8px 12px', outline: 'none' };

  return (
    <div className="trainer-dashboard">
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem' }}>
        <Link to="/trainer/workouts" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-dim)', fontSize: 13, textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> All Workouts
        </Link>
        <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Build Workout</h2>

        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>Workout Name *</label>
              <input style={{ ...inp, width: '100%' }} placeholder="Push Day A" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>Assign to Client</label>
              <select style={{ ...inp, width: '100%' }} value={assignTo} onChange={e => setAssignTo(e.target.value)}>
                <option style={{ background: '#1a1a1a', color: 'white' }} value="">— Assign later —</option>
                {clients.map(c => <option style={{ background: '#1a1a1a', color: 'white' }} key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>Notes</label>
            <textarea style={{ ...inp, width: '100%', minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} placeholder="Warm-up, focus areas…" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 72px 36px', gap: 8, padding: '0 1.5rem', marginBottom: 6 }}>
          {['Exercise','Sets','Reps','Rest(s)',''].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--color-text-dim)', textAlign: h ? 'center' : 'left' }}>{h}</div>
          ))}
        </div>

        <datalist id="ex-presets">{PRESETS.map(p => <option key={p} value={p} />)}</datalist>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {exs.map((ex, i) => (
            <div key={i} className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 72px 36px', gap: 8, padding: '12px 1rem', alignItems: 'center' }}>
              <input list="ex-presets" style={{ ...inp, width: '100%' }} placeholder="Exercise name" value={ex.name} onChange={e => update(i, 'name', e.target.value)} />
              {['sets','reps','rest'].map(k => (
                <input key={k} type="number" min="1" style={{ ...inp, textAlign: 'center', width: '100%' }} value={ex[k]} onChange={e => update(i, k, e.target.value)} />
              ))}
              <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={add} className="glass-panel" style={{ width: '100%', background: 'none', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 10, color: 'var(--color-text-dim)', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 14, marginBottom: '1.5rem' }}>
          <Plus size={15} /> Add Exercise
        </button>

        {err && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: 14 }}>{err}</p>}

        <button onClick={save} disabled={saving} className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Save size={16} /> {saving ? 'Saving…' : 'Save Workout'}
        </button>
      </div>
    </div>
  );
}

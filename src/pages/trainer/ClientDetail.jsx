import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Utensils, TrendingUp, ClipboardList, Save, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase, TABLES } from '../../services/supabaseClient';
import Avatar from '../../components/Avatar';

// Tiny SVG weight line chart
function WeightLine({ logs }) {
  if (!logs.length) return (
    <p style={{ color: 'var(--color-text-dim)', fontSize: 13, padding: '1rem 0' }}>No weight data logged yet.</p>
  );
  const W = 400, H = 90, PAD = 12;
  const vals = logs.map(l => l.weight);
  const min = Math.min(...vals) - 2, max = Math.max(...vals) + 2;
  const pts = logs.map((l, i) => {
    const x = PAD + (i / Math.max(logs.length - 1, 1)) * (W - PAD * 2);
    const y = PAD + ((max - l.weight) / (max - min)) * (H - PAD * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <polyline points={pts} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinejoin="round" />
      {logs.map((l, i) => {
        const x = PAD + (i / Math.max(logs.length - 1, 1)) * (W - PAD * 2);
        const y = PAD + ((max - l.weight) / (max - min)) * (H - PAD * 2);
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--color-primary)" />;
      })}
    </svg>
  );
}

// Weekly workout bars
function WeekBars({ logs }) {
  const days = ['M','T','W','T','F','S','S'];
  const now  = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday

  const counts = days.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const s = d.toISOString().slice(0, 10);
    return logs.filter(l => l.created_at?.slice(0, 10) === s).length;
  });
  const max = Math.max(...counts, 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 72 }}>
      {counts.map((c, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%', borderRadius: 3,
            height: Math.max(4, Math.round((c / max) * 56)),
            background: c > 0 ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
            transition: 'height 0.4s'
          }} />
          <span style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile]     = useState(null);
  const [workoutLogs, setWorkouts] = useState([]);
  const [foodLogs, setFood]       = useState([]);
  const [weightLogs, setWeight]   = useState([]);
  const [photos, setPhotos]       = useState([]);
  const [tab, setTab]             = useState('overview');
  const [note, setNote]           = useState('');
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const { data: p } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', id)
      .single();
    setProfile(p);
    setNote(p?.trainer_note || '');

    const [{ data: wl }, { data: fl }, { data: wt }, { data: ph }] = await Promise.all([
      supabase.from(TABLES.WORKOUT_LOGS).select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(30),
      supabase.from(TABLES.FOOD_LOGS).select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(30),
      supabase.from(TABLES.WEIGHT_LOGS || 'weight_logs').select('*').eq('client_id', id).order('created_at', { ascending: true }).limit(20),
      supabase.from('progress_photos').select('*').eq('client_id', id).order('taken_at', { ascending: false }).limit(20)
    ]);

    setWorkouts(wl || []);
    setFood(fl || []);
    setWeight(wt || []);
    setPhotos(ph || []);
    setLoading(false);
  }

  async function saveNote() {
    setSaving(true);
    await supabase.from(TABLES.PROFILES).update({ trainer_note: note }).eq('id', id);
    setSaving(false);
    alert(`Instructions updated for ${profile?.name}`);
  }

  async function deletePhoto(photoId) {
    if (!window.confirm('Delete this progress photo?')) return;
    await supabase.from('progress_photos').delete().eq('id', photoId);
    setPhotos(photos.filter(p => p.id !== photoId));
  }

  if (loading) return <div className="trainer-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="loader" /></div>;
  if (!profile) return <div className="trainer-dashboard" style={{ padding: '3rem', textAlign: 'center' }}>Client not found. <Link to="/trainer/clients">Go back</Link></div>;

  const today = new Date().toISOString().slice(0, 10);
  const todayCals   = foodLogs.filter(f => f.created_at?.slice(0,10) === today).reduce((s, f) => s + (f.calories || 0), 0);
  const weekWorkouts = workoutLogs.filter(l => new Date(l.created_at) > new Date(Date.now() - 7*86400000)).length;
  const compliance   = Math.min(100, Math.round((weekWorkouts / 5) * 100));

  const tabs = [
    { id: 'overview',  label: 'Overview',  icon: TrendingUp },
    { id: 'workouts',  label: 'Workouts',  icon: Activity },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'photos',    label: 'Photos',    icon: ImageIcon },
    { id: 'wod',       label: 'Daily WOD', icon: ClipboardList },
  ];

  return (
    <div className="trainer-dashboard">
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>

        {/* Back */}
        <Link to="/trainer/clients" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-dim)', fontSize: 13, textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> All Clients
        </Link>

        {/* Client header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Avatar url={profile.profile_photo_url} name={profile.name} size="lg" />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{profile.name}</h2>
            <code style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>@{profile.username}</code>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
          {tabs.map(({ id: tid, label, icon: Icon }) => (
            <button key={tid} onClick={() => setTab(tid)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === tid ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: tab === tid ? 'var(--color-primary)' : 'var(--color-text-dim)',
              fontSize: 13, fontWeight: 500, marginBottom: -1
            }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <>
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'This Week', value: weekWorkouts, sub: 'workouts' },
                { label: 'Compliance', value: `${compliance}%`, sub: 'of 5-day target' },
                { label: 'Cals Today', value: todayCals, sub: 'logged' },
              ].map(s => (
                <div key={s.label} className="stat-card glass-panel">
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-value">{s.value}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{s.sub}</span>
                </div>
              ))}
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Workouts This Week</h4>
              <WeekBars logs={workoutLogs} />
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Weight Trend</h4>
              <WeightLine logs={weightLogs} />
            </div>
          </>
        )}

        {/* Workouts */}
        {tab === 'workouts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {workoutLogs.length === 0
              ? <p style={{ color: 'var(--color-text-dim)', textAlign: 'center', padding: '3rem' }}>No workouts logged yet.</p>
              : workoutLogs.map(l => (
                <div key={l.id} className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{l.exercise}</strong>
                    <span style={{ marginLeft: 10, color: 'var(--color-primary)' }}>{l.value}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="burnt-tag" style={{ marginRight: 8 }}>{l.calories_burnt} kcal</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Nutrition */}
        {tab === 'nutrition' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {foodLogs.length === 0
              ? <p style={{ color: 'var(--color-text-dim)', textAlign: 'center', padding: '3rem' }}>No food logged yet.</p>
              : foodLogs.map(f => (
                <div key={f.id} className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{f.name}</strong>
                    <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--color-text-dim)', textTransform: 'capitalize' }}>{f.meal_type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                    <span style={{ color: 'var(--color-primary)' }}>{f.calories} kcal</span>
                    <span style={{ color: 'var(--color-text-dim)' }}>P {f.protein}g  C {f.carbs}g  F {f.fats}g</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Photos Tab */}
        {tab === 'photos' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {photos.length === 0 ? (
              <div className="glass-panel" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <p style={{ color: 'var(--color-text-dim)' }}>No progress photos uploaded yet.</p>
              </div>
            ) : (
              photos.map(p => (
                <div key={p.id} className="glass-panel" style={{ padding: 12 }}>
                  <img src={p.photo_url} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{new Date(p.taken_at).toLocaleDateString()}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>{p.notes || 'Routine check'}</div>
                    </div>
                    <button onClick={() => deletePhoto(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Daily WOD / trainer note */}
        {tab === 'wod' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Daily Instructions for {profile.name}</h4>
            <p style={{ fontSize: 13, color: 'var(--color-text-dim)', marginBottom: '1rem' }}>
              This message appears on the client's dashboard under "Trainer Instructions".
            </p>
            <textarea
              className="glass-input"
              style={{ width: '100%', minHeight: 140, marginBottom: '1rem', borderRadius: 12, fontFamily: 'inherit', resize: 'vertical' }}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Focus on legs today. 4×8 squats, 3×12 lunges, 3×10 leg press."
            />
            <button className="primary-button" onClick={saveNote} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Save size={16} /> {saving ? 'Saving…' : 'Save Instructions'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

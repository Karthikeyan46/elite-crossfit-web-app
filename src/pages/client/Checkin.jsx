import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Moon, Zap, Smile, Activity, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export default function Checkin() {
  const navigate = useNavigate();
  const clientId = localStorage.getItem('clientId');
  
  const [form, setForm] = useState({
    sleep: 7,
    energy: 7,
    soreness: 5,
    mood: 7,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const QUESTIONS = [
    { id: 'sleep',    label: 'Sleep Quality', icon: Moon },
    { id: 'energy',   label: 'Energy Levels', icon: Zap },
    { id: 'mood',     label: 'Overall Mood',  icon: Smile },
    { id: 'soreness', label: 'Muscle Soreness', icon: Activity },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Calculate current week start (Monday)
      const now = new Date();
      const day = now.getDay() || 7; // Get current day number, Monday is 1, Sunday is 7
      if (day !== 1) now.setHours(-24 * (day - 1));
      const weekStart = now.toISOString().split('T')[0];

      const { error } = await supabase.from('checkins').insert({
        client_id: clientId,
        week_start: weekStart,
        ...form
      });

      if (error) throw error;
      alert('Check-in submitted! Your coach will review it soon.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Checkin error:', err);
      alert('Failed to submit check-in. Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)', padding: '20px 20px 40px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#fff' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Weekly Check-in</h1>
      </header>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-dim)', marginBottom: '2rem', lineHeight: 1.5 }}>
          Share your weekly vitals (1-10) with your coach to optimize your training.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
            {QUESTIONS.map(({ id, label, icon: Icon }) => (
              <div key={id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Icon size={16} color="var(--color-primary)" />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: 700 }}>{form[id]}</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  style={{ width: '100%', accentColor: 'var(--color-primary)', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}
                  value={form[id]}
                  onChange={e => setForm({ ...form, [id]: parseInt(e.target.value) })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Additional Notes</label>
              <textarea
                className="glass-input"
                style={{ width: '100%', minHeight: 100, borderRadius: 12, resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="How was your week? Any wins or struggles?"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="primary-button"
            style={{ width: '100%', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            {submitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={20} />}
            <span style={{ fontWeight: 700 }}>{submitting ? 'Submitting...' : 'Submit Check-in'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

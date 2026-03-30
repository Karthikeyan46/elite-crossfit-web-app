import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase, TABLES } from '../../services/supabaseClient';

export default function Settings() {
  const clientId = localStorage.getItem('clientId');
  const [form, setForm]   = useState({ name: '', brand_name: '', accent_colour: '#a3e635' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]     = useState('');

  useEffect(() => {
    supabase.from(TABLES.PROFILES).select('name, brand_name, accent_colour').eq('id', clientId).single()
      .then(({ data }) => {
        if (data) setForm({ name: data.name || '', brand_name: data.brand_name || '', accent_colour: data.accent_colour || '#a3e635' });
      });
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true); setMsg('');
    const { error } = await supabase.from(TABLES.PROFILES).update({
      name: form.name,
      brand_name: form.brand_name,
      accent_colour: form.accent_colour,
    }).eq('id', clientId);
    setMsg(error ? 'Error: ' + error.message : '✓ Saved!');
    setSaving(false);
  }

  const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 14, padding: '11px 14px', outline: 'none' };
  const lbl = { display: 'block', fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 };

  return (
    <div className="trainer-dashboard">
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '2rem' }}>
        <Link to="/trainer-dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-dim)', fontSize: 13, textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Trainer Dashboard
        </Link>
        <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Settings</h2>

        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <h4 style={{ marginBottom: '1.25rem', fontWeight: 600 }}>Profile & Branding</h4>
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={lbl}>Your Name</label>
              <input style={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Coach Ravi" />
            </div>
            <div>
              <label style={lbl}>Gym / Brand Name</label>
              <input style={inp} value={form.brand_name} onChange={e => setForm(p => ({ ...p, brand_name: e.target.value }))} placeholder="Elite CrossFit Studio" />
              <p style={{ fontSize: 12, color: 'var(--color-text-dim)', marginTop: 4 }}>Shown to clients on their mobile app.</p>
            </div>
            <div>
              <label style={lbl}>Accent Colour</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="color" value={form.accent_colour} onChange={e => setForm(p => ({ ...p, accent_colour: e.target.value }))}
                  style={{ width: 44, height: 44, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'none', cursor: 'pointer', padding: 2 }} />
                <span style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>{form.accent_colour} — client app highlight colour</span>
              </div>
            </div>
            {msg && <p style={{ fontSize: 13, color: msg.startsWith('Error') ? '#ef4444' : 'var(--color-primary)' }}>{msg}</p>}
            <button type="submit" className="primary-button" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
              <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: '→ Client List',   to: '/trainer/clients' },
              { label: '→ Workout Plans', to: '/trainer/workouts' },
              { label: '→ Check-ins',     to: '/trainer/checkins' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{ fontSize: 14, color: 'var(--color-primary)', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

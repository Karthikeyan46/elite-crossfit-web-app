import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase, TABLES } from '../../services/supabaseClient';
import Avatar from '../../components/Avatar';

export default function Checkins() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      // Get all clients
      const { data: clients } = await supabase.from(TABLES.PROFILES).select('id,name,username,profile_photo_url').eq('role','client');
      const ids = (clients || []).map(c => c.id);
      const map = Object.fromEntries((clients || []).map(c => [c.id, c]));

      if (!ids.length) { setLoading(false); return; }

      const { data } = await supabase
        .from('checkins')
        .select('*')
        .in('client_id', ids)
        .order('submitted_at', { ascending: false })
        .limit(40);

      setCheckins((data || []).map(c => ({ ...c, client: map[c.client_id] })));
      setLoading(false);
    })();
  }, []);

  const scoreColor = v => v >= 8 ? 'var(--color-primary)' : v >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="trainer-dashboard">
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem' }}>
        <Link to="/trainer-dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-dim)', fontSize: 13, textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Trainer Dashboard
        </Link>
        <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Check-ins</h2>
        <p style={{ color: 'var(--color-text-dim)', fontSize: 14, marginBottom: '2rem' }}>Weekly wellness reports from your clients</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="loader" style={{ margin: '0 auto' }} /></div>
        ) : checkins.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-dim)' }}>
            No check-ins yet. Clients submit these weekly from the mobile app.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {checkins.map(c => (
              <div key={c.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar url={c.client?.profile_photo_url} name={c.client?.name} size="sm" />
                    <div>
                      <Link to={`/trainer/clients/${c.client_id}`} style={{ fontWeight: 600, color: '#fff', textDecoration: 'none' }}>{c.client?.name}</Link>
                      <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>
                        Week of {c.week_start ? new Date(c.week_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {[
                    { label: 'Sleep',    val: c.sleep },
                    { label: 'Energy',   val: c.energy },
                    { label: 'Soreness', val: c.soreness },
                    { label: 'Mood',     val: c.mood },
                  ].map(m => (
                    <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>{m.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: scoreColor(m.val), marginTop: 4 }}>{m.val ?? '—'}<span style={{ fontSize: 11, opacity: 0.6 }}>/10</span></div>
                    </div>
                  ))}
                </div>
                {c.notes && <p style={{ marginTop: '0.75rem', fontSize: 13, color: 'var(--color-text-dim)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>"{c.notes}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

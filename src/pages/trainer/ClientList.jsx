import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, UserPlus, ArrowLeft, Activity, Loader2 } from 'lucide-react';
import { supabase, TABLES } from '../../services/supabaseClient';

export default function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState('');

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    setLoading(true);
    try {
        // Fetch all users with role 'client'
        const { data: clientData, error } = await supabase
            .from(TABLES.USERS)
            .select('*')
            .eq('role', 'client')
            .order('name');

        if (error) throw error;

        // Enrich with last activity
        const enriched = await Promise.all((clientData || []).map(async c => {
            const { data: fl } = await supabase
                .from(TABLES.FOOD_LOGS)
                .select('timestamp')
                .eq('user_id', c.id)
                .order('timestamp', { ascending: false })
                .limit(1);

            const lastAny = fl?.[0]?.timestamp;
            const daysAgo = lastAny
                ? Math.floor((Date.now() - new Date(lastAny)) / 86400000)
                : null;

            return {
                ...c,
                lastActive: daysAgo,
                compliance: 85, // Mock compliance for demo
            };
        }));

        setClients(enriched);
    } catch (err) {
        console.error('Error loading clients:', err);
    } finally {
        setLoading(false);
    }
  }

  async function handleAddClient(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('Feature available in production via Supabase Auth API.');
    setTimeout(() => {
        setSaving(false);
        setShowInvite(false);
        setMsg('');
    }, 2000);
  }

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const compColor = v => v >= 80 ? '#4ade80' : v >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="trainer-dashboard" style={{ minHeight: '100vh', background: '#0a0a0a', padding: '2rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <Link to="/trainer-dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-dim)', fontSize: 13, textDecoration: 'none', marginBottom: 12 }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Athlete Roster</h1>
          </div>
          <button
            onClick={() => setShowInvite(v => !v)}
            className="primary-button"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px' }}
          >
            <UserPlus size={20} /> Add Athlete
          </button>
        </div>

        {/* Add client form */}
        {showInvite && (
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: 24 }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Invite New Athlete</h3>
            <form onSubmit={handleAddClient} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1.5rem', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 8 }}>NAME</label>
                  <input className="glass-input" style={{ width: '100%' }} placeholder="John Doe" value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 8 }}>EMAIL</label>
                  <input className="glass-input" style={{ width: '100%' }} type="email" placeholder="john@example.com" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 8 }}>INITIAL PASSWORD</label>
                  <input className="glass-input" style={{ width: '100%' }} type="password" placeholder="••••••••" value={newClient.password} onChange={e => setNewClient(p => ({ ...p, password: e.target.value }))} required />
                </div>
                <button type="submit" className="primary-button" disabled={saving} style={{ height: 48, padding: '0 30px' }}>
                    {saving ? <Loader2 size={18} className="animate-spin" /> : 'Invite'}
                </button>
            </form>
          </div>
        )}

        {msg && <div style={{ background: 'rgba(163,230,53,0.1)', color: 'var(--color-primary)', padding: '12px', borderRadius: 12, marginBottom: '2rem', fontSize: 14 }}>{msg}</div>}

        {/* Main List */}
        <div className="glass-panel" style={{ borderRadius: 24, padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: 15, marginBottom: '2rem', maxWidth: 400 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                    <input 
                        className="glass-input" 
                        placeholder="Search athletes..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        style={{ width: '100%', paddingLeft: 42 }} 
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 size={40} className="animate-spin" color="var(--color-primary)" style={{ margin: '0 auto' }} /></div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-dim)' }}>No athletes found.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => navigate(`/trainer/clients/${c.id}`)}
                            className="glass-panel" 
                            style={{ 
                                padding: '1.25rem', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr auto', 
                                alignItems: 'center', gap: 20, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                        >
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{c.name}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)' }}>
                                {c.lastActive === null ? 'Never active' : c.lastActive === 0 ? 'Active today' : `Last active ${c.lastActive}d ago`}
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4ade80' }}>
                                {c.compliance}% Compliance
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${c.compliance}%`, background: compColor(c.compliance), borderRadius: 3 }} />
                            </div>
                            <ChevronRight size={20} color="var(--color-text-dim)" />
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
      <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

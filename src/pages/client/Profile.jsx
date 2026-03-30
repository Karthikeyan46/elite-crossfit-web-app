import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, LogOut, Shield, Award, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { supabase, TABLES } from '../../services/supabaseClient';
import Avatar from '../../components/Avatar';

export default function Profile() {
  const navigate = useNavigate();
  const clientId = localStorage.getItem('clientId');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from(TABLES.PROFILES).select('*').eq('id', clientId).single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [clientId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)', padding: '20px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#fff' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>My Profile</h1>
      </header>

      <div className="glass-panel" style={{ padding: '2rem 1.5rem', textAlign: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Avatar url={profile?.profile_photo_url} name={profile?.name} size="xl" />
        </div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>{profile?.name}</h2>
        <p style={{ color: 'var(--color-text-dim)', fontSize: 13, margin: 0 }}>@{profile?.username}</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: 'var(--color-primary)', color: '#000', padding: '4px 10px', borderRadius: 20 }}>
            {profile?.subscription_tier || 'Free'} Member
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: User, label: 'Edit Profile', to: '#' },
          { icon: Award, label: 'Achievements', to: '/challenges' },
          { icon: Shield, label: 'Privacy & Security', to: '#' },
          { icon: SettingsIcon, label: 'Settings', to: '#' },
        ].map(({ icon: Icon, label, to }) => (
          <button key={label} onClick={() => navigate(to)} className="glass-panel" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon size={18} color="var(--color-primary)" />
              <span style={{ fontWeight: 500 }}>{label}</span>
            </div>
            <ChevronRight size={16} color="var(--color-text-dim)" />
          </button>
        ))}

        <button 
          onClick={handleLogout}
          className="glass-panel" 
          style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, padding: '1.25rem', color: '#ef4444', border: '1px solid rgba(239,68,68,0.1)' }}
        >
          <LogOut size={18} />
          <span style={{ fontWeight: 600 }}>Log Out</span>
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-dim)', marginTop: 40 }}>
        ELITE CROSS Fit Studio v2.5.0
      </p>
    </div>
  );
}

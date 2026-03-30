import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Utensils, 
    Dumbbell, 
    TrendingUp, 
    Camera, 
    User, 
    Bot, 
    Flame, 
    Mic, 
    ChevronRight, 
    CheckCircle, 
    Plus, 
    Bell, 
    Droplets, 
    LayoutGrid, 
    Book, 
    BarChart3, 
    MoreHorizontal,
    Search
} from 'lucide-react';
import { supabase, TABLES } from '../../services/supabaseClient';
import AiCoach from '../../components/AiCoach';
import QuickActionOverlay from '../../components/QuickActionOverlay';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'Athlete';
  
  const [stats, setStats] = useState({
    calories: 0, 
    protein: 0, 
    carbs: 0, 
    fat: 0,
    calorieGoal: 2270, 
    weight: 78.5,
    height: 178,
    exercise: 0,
    steps: 0,
    water: 0,
    quote: "You've burned 150 calories today. Keep the fire burning!",
    quoteTitle: "Level Up Your Goal"
  });
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`);
  const [coachOpen, setCoachOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (!userId) {
        navigate('/login');
        return;
    }
    loadData();
  }, [userId]);

  async function loadData() {
    if (userId === 'demo-client-id') {
        setStats({
            calories: 850, 
            protein: 65, 
            carbs: 120, 
            fat: 30,
            calorieGoal: 2270, 
            weight: 78.5,
            height: 178,
            exercise: 150,
            steps: 4500,
            water: 4,
            quote: "You've burned 150 calories today. Keep the fire burning!",
            quoteTitle: "Level Up Your Goal"
        });
        setLoading(false);
        return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString();

    try {
      const { data: foodLogs } = await supabase
        .from(TABLES.FOOD_LOGS)
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', todayStr);

      const totals = (foodLogs || []).reduce((acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fat: acc.fat + (log.fat || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      setStats(prev => ({
        ...prev,
        ...totals,
      }));
    } catch (error) {
        console.error('Error loading dashboard:', error);
    } finally {
        setLoading(false);
    }
  }

  const remaining = stats.calorieGoal - stats.calories + stats.exercise;
  const progressPercentage = (stats.calories / (stats.calorieGoal + stats.exercise)) * 100;

  return (
    <div className="mobile-app-container" style={{ minHeight: '100vh', background: 'var(--color-bg-main)', color: 'var(--color-text-main)', paddingBottom: 100 }}>
      {/* ── Top Header ────────────────────────────────────────── */}
      <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '1rem 1.25rem',
          background: 'var(--color-bg-secondary)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div 
                onClick={() => fileInputRef.current.click()}
                style={{ 
                    width: 44, 
                    height: 44, 
                    borderRadius: '50%', 
                    background: 'var(--color-bg-tertiary)', 
                    overflow: 'hidden', 
                    border: '2px solid var(--color-primary)',
                    cursor: 'pointer',
                    position: 'relative'
                }}
            >
                <img 
                    src={profilePic}
                    alt="profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setProfilePic(URL.createObjectURL(file));
                    }}
                />
            </div>
            <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Welcome back</p>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{userName}</h2>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Bell size={22} color="var(--color-primary)" />
            <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: '#fff' }}>
                <Link to="/profile"><User size={22} color="var(--color-primary)" /></Link>
            </button>
        </div>
      </header>

      {/* ── Progress Banner ─────────────────────────────── */}
      <div style={{ padding: '0 16px', margin: '1.5rem 0' }}>
          <div style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, var(--color-primary), #b3e600)', 
              borderRadius: '16px', 
              padding: '20px', 
              color: '#000',
              boxShadow: '0 8px 32px rgba(205, 255, 0, 0.2)'
          }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 800 }}>{stats.quoteTitle}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, opacity: 0.9 }}>{stats.quote}</p>
          </div>
      </div>

      <div style={{ padding: '0 16px'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Today's Overview</h2>
              <button 
                onClick={() => setIsEditingMetrics(!isEditingMetrics)}
                style={{ background: 'var(--color-primary-transparent)', border: 'none', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700, padding: '6px 16px', borderRadius: '12px' }}
              >
                {isEditingMetrics ? 'Save' : 'Edit Goal'}
              </button>
          </div>

          {/* ── Settings Panel (Conditional) ────────────────────────── */}
          {isEditingMetrics && (
            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '24px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-primary)', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginBottom: 6, display: 'block' }}>Weight (kg)</label>
                        <input 
                            type="number" 
                            className="glass-input" 
                            style={{ width: '100%', fontSize: '0.9rem', padding: '8px' }}
                            value={stats.weight}
                            onChange={(e) => setStats({...stats, weight: e.target.value})}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginBottom: 6, display: 'block' }}>Height (cm)</label>
                        <input 
                            type="number" 
                            className="glass-input" 
                            style={{ width: '100%', fontSize: '0.9rem', padding: '8px' }}
                            value={stats.height}
                            onChange={(e) => setStats({...stats, height: e.target.value})}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginBottom: 6, display: 'block' }}>Cals Goal</label>
                        <input 
                            type="number" 
                            className="glass-input" 
                            style={{ width: '100%', fontSize: '0.9rem', padding: '8px' }}
                            value={stats.calorieGoal}
                            onChange={(e) => setStats({...stats, calorieGoal: e.target.value})}
                        />
                    </div>
                </div>
                <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginBottom: 6, display: 'block' }}>Motivational Title</label>
                    <input 
                        className="glass-input" 
                        style={{ width: '100%', fontSize: '0.9rem', padding: '8px', marginBottom: 12 }}
                        value={stats.quoteTitle}
                        onChange={(e) => setStats({...stats, quoteTitle: e.target.value})}
                    />
                    <label style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginBottom: 6, display: 'block' }}>Daily Quote</label>
                    <textarea 
                        className="glass-input" 
                        style={{ width: '100%', fontSize: '0.9rem', padding: '8px', height: 60, resize: 'none' }}
                        value={stats.quote}
                        onChange={(e) => setStats({...stats, quote: e.target.value})}
                    />
                </div>
            </div>
          )}

          {/* ── Calorie Hero Card ────────────────────────────────── */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>Nutrition</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Goal: {stats.calorieGoal} kcal  |  Food: {stats.calories} kcal</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  {/* Circular Progress */}
                  <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                          <circle cx="70" cy="70" r="60" fill="transparent" stroke="var(--color-bg-tertiary)" strokeWidth="10" />
                          <circle 
                            cx="70" cy="70" r="60" 
                            fill="transparent" 
                            stroke="var(--color-primary)" 
                            strokeWidth="10" 
                            strokeDasharray={2 * Math.PI * 60}
                            strokeDashoffset={2 * Math.PI * 60 * (1 - progressPercentage / 100)}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                          />
                      </svg>
                      <div style={{ position: 'absolute', textAlign: 'center' }}>
                          <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{remaining}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Left</span>
                      </div>
                  </div>

                  {/* Macros Strip */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Protein</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{stats.protein}g</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--color-bg-tertiary)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: '45%', background: '#bef264', borderRadius: 2 }}></div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Carbs</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{stats.carbs}g</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--color-bg-tertiary)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: '60%', background: '#64d2ff', borderRadius: 2 }}></div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Fat</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{stats.fat}g</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--color-bg-tertiary)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: '30%', background: '#ffb944', borderRadius: 2 }}></div>
                      </div>
                  </div>
              </div>
          </div>


          {/* ── Bottom Grid (Steps Only) ─────────────────────────────────────── */}
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Steps Card */}
              <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '24px', background: 'var(--color-bg-secondary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--color-border)' }}>
                  <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>Steps</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 4 }}>{stats.steps}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                      <Flame size={18} color="var(--color-primary)" />
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-primary)' }}>Goal Met</span>
                  </div>
              </div>
          </div>
      </div>

      {/* ── Bottom Navigation ──────────────────────────────── */}
      <nav style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, 
          background: 'var(--color-bg-secondary)', 
          borderTop: '1px solid var(--color-border)', 
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '12px 0 28px', zIndex: 100 
      }}>
        <Link to="/client-dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', color: 'var(--color-primary)' }}>
            <LayoutGrid size={24} />
            <span style={{ fontSize: '10px', fontWeight: 700 }}>HOME</span>
        </Link>
        <Link to="/food" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', color: 'var(--color-text-muted)' }}>
            <Book size={24} />
            <span style={{ fontSize: '10px', fontWeight: 700 }}>DIARY</span>
        </Link>
        <div style={{ 
            marginTop: -45, 
            width: 58, height: 58, borderRadius: '20px', 
            background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(205, 255, 0, 0.4)',
            cursor: 'pointer',
            transform: 'rotate(45deg)'
        }} onClick={() => setActionOpen(true)}>
            <div style={{ transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={32} color="#000" />
            </div>
        </div>
        <Link to="/progress" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', color: 'var(--color-text-muted)' }}>
            <BarChart3 size={24} />
            <span style={{ fontSize: '10px', fontWeight: 700 }}>STATS</span>
        </Link>
        <Link to="/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', color: 'var(--color-text-muted)' }}>
            <User size={24} />
            <span style={{ fontSize: '10px', fontWeight: 700 }}>ME</span>
        </Link>
      </nav>

      <AiCoach open={coachOpen} onClose={() => setCoachOpen(false)} />
      <QuickActionOverlay 
        open={actionOpen} 
        onClose={() => setActionOpen(false)} 
        onCoachOpen={() => setCoachOpen(true)}
      />
      
      <style>{`
        .white-panel {
            transition: transform 0.2s ease;
        }
        .white-panel:active {
            transform: scale(0.98);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

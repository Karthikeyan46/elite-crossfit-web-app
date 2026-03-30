import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Activity,
    Utensils,
    Search,
    LogOut,
    Dumbbell,
    UserPlus,
    X,
    TrendingUp,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { supabase, TABLES } from '../../services/supabaseClient';

const TrainerDashboard = () => {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddClient, setShowAddClient] = useState(false);
    const [newClientEmail, setNewClientEmail] = useState('');
    const [newClientName, setNewClientName] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const trainerId = localStorage.getItem('userId');

    useEffect(() => {
        if (!trainerId) {
            navigate('/login');
            return;
        }
        fetchClients();
    }, [trainerId]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            // Fetch all clients assigned to this trainer
            const { data: clientLinks, error: linkError } = await supabase
                .from(TABLES.CLIENTS)
                .select('client_id')
                .eq('trainer_id', trainerId);

            if (linkError) throw linkError;

            const clientIds = (clientLinks || []).map(l => l.client_id);
            
            if (clientIds.length > 0) {
                const { data: clientData, error: clientError } = await supabase
                    .from(TABLES.USERS)
                    .select('*')
                    .in('id', clientIds);
                
                if (clientError) throw clientError;

                // For each client, fetch today's compliance
                const today = new Date();
                today.setHours(0,0,0,0);
                const todayStr = today.toISOString();

                const clientsWithStats = await Promise.all((clientData || []).map(async (client) => {
                    const { count: foodCount } = await supabase
                        .from(TABLES.FOOD_LOGS)
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', client.id)
                        .gte('timestamp', todayStr);

                    const { count: workoutCount } = await supabase
                        .from(TABLES.WORKOUT_LOGS)
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', client.id)
                        .gte('timestamp', todayStr)
                        .eq('status', 'completed');

                    return {
                        ...client,
                        dietCompliant: (foodCount || 0) > 0,
                        workoutCompliant: (workoutCount || 0) > 0
                    };
                }));

                setClients(clientsWithStats);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClient = async (e) => {
        e.preventDefault();
        alert("This demo uses Supabase Auth. In a real app, you would send an invite email or create the user via Auth API.");
        setShowAddClient(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const filteredClients = clients.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="trainer-dashboard" style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh' }}>
                
                {/* ── Sidebar ────────────────────────────────────────── */}
                <aside style={{ background: '#111', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '3rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Dumbbell size={24} color="#000" />
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>FitCoach <span style={{ color: 'var(--color-primary)' }}>AI</span></h2>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                        {[
                            { icon: Users, label: 'Client Roster', active: true },
                            { icon: Activity, label: 'Compliance Hub' },
                            { icon: TrendingUp, label: 'Analytics' },
                            { icon: Utensils, label: 'Food Database' }
                        ].map(item => (
                            <div key={item.label} style={{ 
                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, 
                                background: item.active ? 'rgba(163,230,53,0.1)' : 'transparent',
                                color: item.active ? 'var(--color-primary)' : 'var(--color-text-dim)',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
                            }}>
                                <item.icon size={18} />
                                {item.label}
                            </div>
                        ))}
                    </nav>

                    <button 
                        onClick={handleLogout}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </aside>

                {/* ── Main Content ────────────────────────────────────── */}
                <main style={{ padding: '3rem' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 8px' }}>Trainer Dashboard</h1>
                            <p style={{ color: 'var(--color-text-dim)', margin: 0 }}>Manage your clients and track their daily performance.</p>
                        </div>
                        <button 
                            onClick={() => setShowAddClient(true)}
                            className="primary-button" 
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px' }}
                        >
                            <UserPlus size={20} /> Add Client
                        </button>
                    </header>

                    {/* ── Stats Overview ────────────────────────────────── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: '3rem' }}>
                        {[
                            { label: 'Active Clients', val: clients.length, icon: Users, color: 'var(--color-primary)' },
                            { label: 'Avg. Diet Compliance', val: '84%', icon: Utensils, color: '#64d2ff' },
                            { label: 'Avg. Workouts Done', val: '72%', icon: Dumbbell, color: '#bef264' }
                        ].map(s => (
                            <div key={s.label} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ width: 50, height: 50, borderRadius: 14, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <s.icon size={24} color={s.color} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: 4 }}>{s.label}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.val}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Client Roster ──────────────────────────────────── */}
                    <div className="glass-panel" style={{ borderRadius: 24, overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Active Athletes</h3>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search clients..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px 8px 38px', color: '#fff', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ padding: '1rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>
                                        <th style={{ padding: '12px' }}>NAME</th>
                                        <th style={{ padding: '12px' }}>ROLE</th>
                                        <th style={{ padding: '12px' }}>DIET TODAY</th>
                                        <th style={{ padding: '12px' }}>WORKOUT TODAY</th>
                                        <th style={{ padding: '12px' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClients.map(client => (
                                        <tr key={client.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '16px 12px' }}>
                                                <div style={{ fontWeight: 700 }}>{client.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>ID: {client.id.slice(0, 8)}</div>
                                            </td>
                                            <td style={{ padding: '16px 12px' }}>
                                                <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', textTransform: 'uppercase' }}>{client.role}</span>
                                            </td>
                                            <td style={{ padding: '16px 12px' }}>
                                                {client.dietCompliant ? 
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80', fontSize: '0.9rem' }}><CheckCircle2 size={16} /> Tracked</div> :
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-dim)', fontSize: '0.9rem' }}><AlertCircle size={16} /> Pending</div>
                                                }
                                            </td>
                                            <td style={{ padding: '16px 12px' }}>
                                                {client.workoutCompliant ? 
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80', fontSize: '0.9rem' }}><CheckCircle2 size={16} /> Completed</div> :
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-dim)', fontSize: '0.9rem' }}><AlertCircle size={16} /> No Activity</div>
                                                }
                                            </td>
                                            <td style={{ padding: '16px 12px' }}>
                                                <button 
                                                    onClick={() => navigate(`/trainer/clients/${client.id}`)}
                                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: '0.85rem', cursor: 'pointer' }}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredClients.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-dim)' }}>
                                    No clients found.
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* ── Add Client Modal ────────────────────────────────── */}
            {showAddClient && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', borderRadius: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Add Athlete</h3>
                            <button onClick={() => setShowAddClient(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddClient} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                             <div className="form-group">
                                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>Full Name</label>
                                <input type="text" className="glass-input" required placeholder="John Doe" value={newClientName} onChange={e => setNewClientName(e.target.value)} style={{ width: '100%' }} />
                             </div>
                             <div className="form-group">
                                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>Email Address</label>
                                <input type="email" className="glass-input" required placeholder="john@example.com" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} style={{ width: '100%' }} />
                             </div>
                             <button type="submit" className="primary-button" style={{ padding: '14px', borderRadius: 12 }}>Invite via Email</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerDashboard;

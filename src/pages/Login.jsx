import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { supabase, TABLES } from '../services/supabaseClient';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // 🟢 HARDCODED DEMO LOGIN
        if (email === 'client@demo.ai' && password === 'password123') {
            localStorage.setItem('userId', 'demo-client-id');
            localStorage.setItem('userRole', 'client');
            localStorage.setItem('userName', 'Demo Athlete');
            localStorage.setItem('isClientLoggedIn', 'true');
            localStorage.setItem('isDemoMode', 'true');
            localStorage.setItem('isTrainer', 'false');
            setTimeout(() => navigate('/dashboard'), 500);
            return;
        }

        if (email === 'trainer@demo.ai' && password === 'password123') {
            localStorage.setItem('userId', 'demo-trainer-id');
            localStorage.setItem('userRole', 'trainer');
            localStorage.setItem('userName', 'Coach Alpha');
            localStorage.setItem('isClientLoggedIn', 'false');
            localStorage.setItem('isDemoMode', 'true');
            localStorage.setItem('isTrainer', 'true');
            setTimeout(() => navigate('/trainer-dashboard'), 500);
            return;
        }

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Get user role from metadata or users table
            const { data: userData, error: userError } = await supabase
                .from(TABLES.USERS)
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (userError) throw userError;

            localStorage.setItem('userId', authData.user.id);
            localStorage.setItem('userRole', userData.role);
            localStorage.setItem('userName', userData.name);
            localStorage.setItem('isDemoMode', 'false');
            localStorage.setItem('isClientLoggedIn', userData.role === 'client' ? 'true' : 'false');
            localStorage.setItem('isTrainer', userData.role === 'trainer' ? 'true' : 'false');

            if (userData.role === 'trainer') {
                navigate('/trainer-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-main)', padding: '20px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--color-primary)' }}>FitCoach AI</h1>
                    <p style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>Welcome back! Log in to your portal.</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-dim)', marginBottom: 8 }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' }} />
                            <input 
                                type="email" 
                                required 
                                className="glass-input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 42px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-dim)', marginBottom: 8 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' }} />
                            <input 
                                type="password" 
                                required 
                                className="glass-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 42px' }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: '#ff4444', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(255, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="primary-button" 
                        style={{ padding: '14px', borderRadius: '12px', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} /> Sign In</>}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)' }}>
                            New to FitCoach? <span style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/onboarding')}>Create an account</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;

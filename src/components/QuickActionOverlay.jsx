import React, { useState } from 'react';
import { 
    X, 
    Utensils, 
    Dumbbell, 
    Droplets, 
    Moon, 
    Plus, 
    ChevronRight, 
    Zap, 
    Target,
    Heart,
    Trash2,
    Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionOverlay = ({ open, onClose, onCoachOpen }) => {
    const navigate = useNavigate();
    const [subView, setSubView] = useState('main'); // main, water, exercise, sleep
    const [customWater, setCustomWater] = useState('');

    if (!open) return null;

    const menuItems = [
        { id: 'food', label: 'Log Food', icon: Utensils, color: '#bef264', sub: false, path: '/food' },
        { id: 'exercise', label: 'Log Exercise', icon: Dumbbell, color: '#cdff00', sub: true },
        { id: 'sleep', label: 'Log Sleep', icon: Moon, color: '#a78bfa', sub: true },
        { id: 'coach', label: 'AI Coach', icon: Bot, color: '#ffb944', sub: false, action: 'open_coach' }
    ];

    const exerciseTypes = [
        { label: 'Cardio', icon: Zap, color: '#ff4d4d', desc: 'Running, Cycling, HIIT' },
        { label: 'Strength', icon: Target, color: '#cdff00', desc: 'Weights, Bodyweight' },
        { label: 'Yoga', icon: Heart, color: '#4ade80', desc: 'Stretching, Mindfulness' }
    ];

    const renderMainSet = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 24 }}>
            {menuItems.map(item => (
                <button 
                    key={item.id}
                    onClick={() => {
                        if (item.action === 'open_coach') {
                            onCoachOpen();
                            onClose();
                        } else if (item.sub) {
                            setSubView(item.id);
                        } else {
                            navigate(item.path);
                            onClose();
                        }
                    }}
                    style={{ 
                        background: 'var(--color-bg-tertiary)', 
                        border: '1px solid var(--color-border)',
                        borderRadius: 24, padding: 20, 
                        display: 'flex', flexDirection: 'column', 
                        alignItems: 'center', gap: 12,
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <div style={{ 
                        width: 50, height: 50, borderRadius: 15, 
                        background: `${item.color}20`, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                        <item.icon size={24} color={item.color} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{item.label}</span>
                </button>
            ))}
        </div>
    );



    const renderExerciseSub = () => (
        <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>Select Workout Type</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)', marginBottom: 24 }}>Choose your training session</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {exerciseTypes.map(type => (
                    <button 
                        key={type.label}
                        onClick={() => { 
                            // In real app, navigate to specialized logging screen
                            alert(`Starting ${type.label} log!`); 
                            navigate('/workout');
                            onClose(); 
                        }}
                        style={{ 
                            background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
                            borderRadius: 20, padding: 20, 
                            display: 'flex', alignItems: 'center', gap: 16,
                            textAlign: 'left', cursor: 'pointer'
                        }}
                    >
                        <div style={{ 
                            width: 48, height: 48, borderRadius: 12, 
                            background: `${type.color}20`, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}>
                            <type.icon size={22} color={type.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, color: '#fff' }}>{type.label}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{type.desc}</div>
                        </div>
                        <ChevronRight size={18} color="var(--color-text-dim)" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderSleepSub = () => (
        <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>Sleep Log</h3>
            <div style={{ 
                background: 'var(--color-bg-tertiary)', borderRadius: 24, padding: '2rem 1rem', 
                textAlign: 'center', border: '1px solid var(--color-border)', marginTop: 20 
            }}>
                <Moon size={48} color="#a78bfa" style={{ marginBottom: 16, opacity: 0.8 }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)', marginBottom: 24 }}>How was your rest last night?</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 10px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>WOKE UP</div>
                        <div style={{ fontWeight: 800 }}>06:30 AM</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>BEDTIME</div>
                        <div style={{ fontWeight: 800 }}>10:45 PM</div>
                    </div>
                </div>

                <button 
                    onClick={() => { alert('Sleep logged! Database integration coming soon.'); onClose(); }}
                    className="primary-button" 
                    style={{ width: 'calc(100% - 20px)', marginTop: 24 }}
                >
                    Confirm Log
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ 
            position: 'fixed', inset: 0, 
            background: 'rgba(0,0,0,0.85)', 
            backdropFilter: 'blur(15px)', 
            zIndex: 1000,
            display: 'flex', alignItems: 'flex-end',
            animation: 'fadeIn 0.3s ease'
        }}>
            <div style={{ 
                width: '100%', 
                background: 'var(--color-bg-secondary)', 
                borderTopLeftRadius: 30, borderTopRightRadius: 30,
                padding: '2rem 1.5rem 3.5rem',
                maxHeight: '85vh',
                overflowY: 'auto',
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    {subView !== 'main' ? (
                        <button 
                            onClick={() => setSubView('main')}
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '6px 14px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 700 }}
                        >
                            Back
                        </button>
                    ) : <div></div>}
                    <button 
                        onClick={() => { onClose(); setSubView('main'); }}
                        style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {subView === 'main' && renderMainSet()}
                {subView === 'exercise' && renderExerciseSub()}
                {subView === 'sleep' && renderSleepSub()}

                <style>{`
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                `}</style>
            </div>
        </div>
    );
};

export default QuickActionOverlay;

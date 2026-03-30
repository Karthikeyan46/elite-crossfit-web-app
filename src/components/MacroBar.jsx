import React from 'react';

const MacroBar = ({ label, current, goal, color }) => {
    const pct = Math.min(100, Math.round((current / (goal || 1)) * 100));
    
    return (
        <div className="macro-bar-container" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{Math.round(current)} / {goal}g</span>
            </div>
            <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div 
                    style={{ 
                        height: '100%', 
                        width: `${pct}%`, 
                        background: color || 'var(--color-primary)', 
                        borderRadius: 3,
                        transition: 'width 0.4s ease-out'
                    }} 
                />
            </div>
        </div>
    );
};

export default MacroBar;

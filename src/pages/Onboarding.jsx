import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import './Home.css'; // Reusing some base styles

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState(null); // 'trainer' or 'client'
    const navigate = useNavigate();

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        localStorage.setItem('userRole', selectedRole);
        setStep(2);
    };

    const completeOnboarding = () => {
        if (role === 'trainer') {
            localStorage.setItem('isTrainer', 'true');
            navigate('/trainer-dashboard');
        } else {
            localStorage.setItem('isTrainer', 'false');
            navigate('/dashboard');
        }
    };

    return (
        <div className="onboarding-page container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            {step === 1 && (
                <div className="step-container animate-fade-in">
                    <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to ELITE CROSS Fit Studio</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--color-text-dim)', marginBottom: '3rem' }}>
                        How do you plan to use the platform?
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                        <div 
                            className={`glass-panel role-card ${role === 'client' ? 'selected' : ''}`}
                            onClick={() => handleRoleSelect('client')}
                            style={{ padding: '2rem', cursor: 'pointer', transition: 'all 0.3s ease', width: '100%', maxWidth: '400px', border: role === 'client' ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <User size={48} color="var(--color-secondary)" style={{ marginBottom: '1rem' }} />
                            <h3>I am a Client</h3>
                            <p>Track your progress, get personalized plans, and reach your goals.</p>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="step-container animate-fade-in">
                    <CheckCircle2 size={64} color="var(--color-success)" style={{ marginBottom: '2rem' }} />
                    <h1 className="text-gradient">You're all set!</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--color-text-dim)', marginBottom: '3rem' }}>
                        Ready to start your {role === 'trainer' ? 'training business' : 'fitness journey'}?
                    </p>
                    <Button size="lg" variant="primary" icon={<ArrowRight size={20} />} onClick={completeOnboarding}>
                        Go to My Dashboard
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Onboarding;

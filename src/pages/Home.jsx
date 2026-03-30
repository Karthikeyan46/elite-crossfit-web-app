import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, 
    Activity, 
    Flame, 
    Heart, 
    X, 
    Check, 
    ShieldCheck, 
    Star, 
    Play, 
    ChevronRight,
    Dumbbell,
    TrendingUp,
    Award
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import trainerImage from '../assets/image/trainer.jpg';
import { pricingPlans, testimonials } from '../data/gymData';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page animate-fade-in">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    {/* Interactive Reel Video */}
                    <div className="hero-video-container animate-slide-up" style={{ borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '2px solid var(--color-primary, #cdff00)', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                        <video 
                            src="/antigravity_reel.mp4" 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '70vh', objectFit: 'cover' }}
                        />
                    </div>

                    <div className="hero-text-content">
                        <h1 className="hero-title animate-slide-up">
                            The Operating System for <span className="text-gradient">Modern Fitness</span>
                        </h1>
                        <p className="hero-subtitle animate-slide-up animate-delay-100">
                            ELITE CROSS Fit Studio empowers trainers to scale their business and helps clients achieve results with AI-driven nutrition and personalized coaching.
                        </p>
                        <div className="hero-cta animate-slide-up animate-delay-200">
                            <Button size="lg" variant="primary" icon={<ArrowRight size={20} />} onClick={() => navigate('/onboarding')}>
                                Get Started Free
                            </Button>
                            <Button size="lg" variant="outline" onClick={() => {
                                const el = document.getElementById('pricing');
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }}>
                                View Pricing
                            </Button>
                        </div>
                    </div>
 
                    {/* SaaS Comparison Split */}
                    <div className="hero-comparison">
                        {/* Legacy Method Column */}
                        <div className="comparison-card traditional-gym">
                            <h3 className="comparison-title">Legacy Apps</h3>
                            <ul className="comparison-list">
                                <li>
                                    <X size={20} className="comparison-icon negative" />
                                    <span>Manual calorie counting and spreadsheets</span>
                                </li>
                                <li>
                                    <X size={20} className="comparison-icon negative" />
                                    <span>Disconnect between trainers and clients</span>
                                </li>
                                <li>
                                    <X size={20} className="comparison-icon negative" />
                                    <span>Basic tracking with no real insights</span>
                                </li>
                            </ul>
                        </div>
 
                        {/* ELITE CROSS Fit Studio Column */}
                        <div className="comparison-card elite-crossfit">
                            <h3 className="comparison-title text-gradient">ELITE CROSS Fit Studio</h3>
                            <ul className="comparison-list">
                                <li>
                                    <Check size={20} className="comparison-icon positive" />
                                    <span>AI Food Scanner: Snap, Analyze, Log</span>
                                </li>
                                <li>
                                    <Check size={20} className="comparison-icon positive" />
                                    <span>Real-time Trainer Dashboard</span>
                                </li>
                                <li>
                                    <Check size={20} className="comparison-icon positive" />
                                    <span>Personalized AI Wellness Coaching</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section container" id="features">
                <div className="section-header">
                    <h2 className="section-title">Built for <span className="text-gradient">Scale</span></h2>
                    <p className="section-subtitle">Everything you need to manage your fitness empire or your personal health.</p>
                </div>

                <div className="features-split-container">
                    {/* Trainer Spotlight - Restored */}
                    <div className="trainer-spotlight glass-panel">
                        <div className="trainer-header-row">
                            <div className="trainer-image-container pulse-glow">
                                <img src={trainerImage} alt="Head Coach" className="trainer-img" />
                            </div>
                            <div className="trainer-title-group">
                                <h3 className="trainer-title">Lead Trainer</h3>
                                <h4 className="trainer-name text-gradient">Expert Coaching</h4>
                                <p className="trainer-experience">15+ Years Professional Experience</p>
                            </div>
                        </div>

                        <div className="trainer-bio">
                            <p>Our lead coaching methodology is designed to help you achieve sustainable results through science-based training and personalized nutrition guidance.</p>
                            <p>Specializing in metabolic conditioning, strength development, and holistic wellness, we ensure every program is tailored to your unique goals and lifestyle.</p>
                        </div>
                    </div>

                    <div className="features-stack">
                        <Card className="feature-card">
                            <div className="feature-icon-wrapper">
                                <ShieldCheck size={32} className="feature-icon" />
                            </div>
                            <div className="feature-text-content">
                                <h3>Exclusive Trainer</h3>
                                <p>Easily design workouts, track nutrition, and communicate with your clients in real-time.</p>
                            </div>
                        </Card>

                        <Card className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Activity size={32} className="feature-icon" />
                            </div>
                            <div className="feature-text-content">
                                <h3>AI Food Scanner</h3>
                                <p>No more manual entry. Our computer vision identifies meals and calculates macros instantly.</p>
                            </div>
                        </Card>

                        <Card className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Heart size={32} className="feature-icon" />
                            </div>
                            <div className="feature-text-content">
                                <h3>Wellness Ecosystem</h3>
                                <p>Integrate sleep, water, and activity tracking for a holistic view of your health.</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="pricing-section container" id="pricing">
                <div className="section-header">
                    <h2 className="section-title">Transparent <span className="text-gradient">Pricing</span></h2>
                    <p className="section-subtitle">Choose the plan that fits your fitness journey.</p>
                </div>
                <div className="pricing-grid">
                    {pricingPlans.map((plan) => (
                        <div key={plan.id} className={`pricing-card glass-panel ${plan.popular ? 'popular-plan' : ''}`}>
                            {plan.popular && <div className="popular-badge">Most Popular</div>}
                            <h3 className="plan-name">{plan.name}</h3>
                            <div className="plan-price">
                                <span className="price">{plan.price}</span>
                                <span className="period">/{plan.period}</span>
                            </div>
                            <ul className="plan-features">
                                {plan.features.map((feature, index) => (
                                    <li key={index}>
                                        <Check size={18} className="text-primary" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button 
                                variant={plan.popular ? 'primary' : 'outline'} 
                                className="w-full mt-auto"
                                onClick={() => navigate('/onboarding')}
                            >
                                {plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section container" id="success">
                <div className="section-header">
                    <h2 className="section-title">Success <span className="text-gradient">Stories</span></h2>
                    <p className="section-subtitle">Hear from those who have transformed their lives with us.</p>
                </div>
                <div className="testimonials-grid">
                    {testimonials.map((t) => (
                        <Card key={t.id} className="testimonial-card">
                            <div className="flex gap-1 mb-4">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} size={16} fill="var(--color-primary)" color="var(--color-primary)" />
                                ))}
                            </div>
                            <p className="testimonial-content italic opacity-90">"{t.content}"</p>
                            <div className="testimonial-footer mt-6 flex items-center gap-4">
                                <div>
                                    <h4 className="font-bold">{t.name}</h4>
                                    <p className="text-dim text-sm">{t.role}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container cta-container glass-panel">
                    <h2>Ready to Elevate Your Fitness?</h2>
                    <p>Join the thousands of trainers and clients already using ELITE CROSS Fit Studio to reach new heights.</p>
                    <Button size="lg" variant="primary" onClick={() => navigate('/onboarding')}>Start Your Free Trial</Button>
                </div>
            </section>
        </div>
    );
};

export default Home;

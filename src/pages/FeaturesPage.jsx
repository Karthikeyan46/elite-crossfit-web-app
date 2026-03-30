import React from 'react';
import { 
    ShieldCheck, 
    Activity, 
    Heart 
} from 'lucide-react';
import Card from '../components/Card';
import trainerImage from '../assets/image/trainer.jpg';
import './Home.css';

const FeaturesPage = () => {
    return (
        <div className="features-landing-page animate-fade-in">
            <section className="features-section container" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
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
        </div>
    );
};

export default FeaturesPage;

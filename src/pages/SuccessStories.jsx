import React from 'react';
import { testimonials } from '../data/gymData';
import Card from '../components/Card';
import { Star } from 'lucide-react';
import './Home.css';

const SuccessStories = () => {
    return (
        <div className="success-landing-page animate-fade-in">
            <section className="testimonials-section container" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
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
        </div>
    );
};

export default SuccessStories;

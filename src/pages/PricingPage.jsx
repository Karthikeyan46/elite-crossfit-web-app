import React from 'react';
import { useNavigate } from 'react-router-dom';
import { pricingPlans } from '../data/gymData';
import Button from '../components/Button';
import { Check } from 'lucide-react';
import './Home.css';

const PricingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="pricing-landing-page animate-fade-in">
            <section className="pricing-section container" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
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
        </div>
    );
};

export default PricingPage;

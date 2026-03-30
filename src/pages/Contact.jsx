import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';
import Button from '../components/Button';
import Card from '../components/Card';
import './Contact.css';

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = {
            name: e.target.name.value,
            email: e.target.email.value,
            subject: e.target.subject.value,
            message: e.target.message.value,
        };

        try {
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT || import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    from_name: formData.name,
                    from_email: formData.email,
                    reply_to: formData.email, // Allows one-click reply
                    subject: formData.subject,
                    message: formData.message,
                },
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            setIsSuccess(true);
            e.target.reset();
            setTimeout(() => setIsSuccess(false), 5000);
        } catch (error) {
            console.error('Failed to send email:', error);
            alert('Failed to send message. Please try again or contact us directly.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page container animate-fade-in">
            <header className="page-header">
                <h1 className="page-title">Get In <span className="text-gradient">Touch</span></h1>
                <p className="page-subtitle">Have questions or want to learn more? We'd love to hear from you.</p>
            </header>

            <div className="contact-grid">
                <div className="contact-info-section">
                    <Card className="contact-info-card pointer-none" hoverEffect={false}>
                        <h2>Gym Information</h2>
                        <div className="info-list">
                            <div className="info-item">
                                <MapPin className="info-icon" size={24} />
                                <div>
                                    <h4>Location</h4>
                                    <a 
                                        href="https://www.google.com/maps/dir//Elite+CrossFit,+129,+Palani+Rd,+near+5K+Car+Care,+Udumalaipettai,+Tamil+Nadu+642126/@10.5807445,77.2562231,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ba9cde5c9514401:0x2d230b460a00e821!2m2!1d77.256153!2d10.5816073?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="address-link"
                                    >
                                        <p>129, Palani Rd, near 5K Car Care, Udumalaipettai, Tamil Nadu 642126</p>
                                    </a>
                                    <a
                                        href="https://www.google.com/maps/dir//Elite+CrossFit,+129,+Palani+Rd,+near+5K+Car+Care,+Udumalaipettai,+Tamil+Nadu+642126/@10.5807445,77.2562231,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ba9cde5c9514401:0x2d230b460a00e821!2m2!1d77.256153!2d10.5816073?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="map-link text-gradient"
                                    >
                                        View on Maps
                                    </a>
                                </div>
                            </div>

                            <div className="info-item map-container" style={{ marginTop: 'var(--spacing-4)', width: '100%', height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <iframe
                                    title="Elite CrossFit Location"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.654854!2d77.234567!3d10.589012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDM1JzIwLjQiTiA3N8KwMTQnMTIuNCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>

                            <div className="info-item">
                                <Phone className="info-icon" size={24} />
                                <div>
                                    <h4>Phone</h4>
                                    <p>063830 30651</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <Mail className="info-icon" size={24} />
                                <div>
                                    <h4>Email</h4>
                                    <p>mail2crossfit@gmail.com</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <Clock className="info-icon" size={24} />
                                <div>
                                    <h4>Hours</h4>
                                    <p>Mon-Sat: 5:15 AM - 12:00 PM, 4:00 PM - 10:00 PM</p>
                                    <p>Sun: Closed</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="contact-form-section">
                    <Card className="contact-form-card" hoverEffect={false}>
                        {isSuccess && (
                            <div className="form-success-message animate-fade-in" style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-4)', textAlign: 'center' }}>
                                Thank you for your message! We will get back to you shortly.
                            </div>
                        )}
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input type="text" id="name" name="name" required placeholder="John Doe" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input type="email" id="email" name="email" required placeholder="john@example.com" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input type="text" id="subject" name="subject" required placeholder="Membership Inquiry" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea id="message" name="message" required rows="5" placeholder="How can we help you?"></textarea>
                            </div>
                            <Button type="submit" variant="primary" size="lg" icon={<Send size={18} />} disabled={isSubmitting}>
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Contact;

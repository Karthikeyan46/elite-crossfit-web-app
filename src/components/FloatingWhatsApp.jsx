import React from 'react';
import { MessageCircle } from 'lucide-react';
import './FloatingWhatsApp.css';

const FloatingWhatsApp = () => {
    return (
        <a 
            href="https://wa.me/916383030651"
            target="_blank"
            rel="noopener noreferrer"
            className="floating-whatsapp"
            aria-label="Connect with us on WhatsApp"
        >
            <div className="whatsapp-tooltip">Chat with us</div>
            <div className="whatsapp-icon-bg pulse-glow-green">
                <MessageCircle size={22} />
            </div>
        </a>
    );
};

export default FloatingWhatsApp;

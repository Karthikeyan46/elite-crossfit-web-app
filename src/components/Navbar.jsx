import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Menu, X, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import './Navbar.css'; // I will create this or use styled components or inline

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenu = () => setIsOpen(false);

  const handleNavClick = (e, targetId) => {
    closeMenu();
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not on the home page, navigate to the home page and then scroll
      // This requires a bit more complex state management or a useEffect in the Home component
      // For simplicity, we'll just navigate to the home page for now.
      // A more robust solution would involve passing state to the home page to trigger scroll.
      navigate(`/#${targetId}`);
    }
  };

  return (
    <header className="navbar glass-panel">
      <div className="container navbar-container">
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <Dumbbell className="logo-icon text-gradient" size={32} />
          <span className="logo-text text-gradient">ELITE <span style={{ color: 'var(--color-primary)' }}>CROSS</span> Fit Studio</span>
        </NavLink>

        <nav className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>Home</NavLink>
          <NavLink to="/gallery" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>Gallery</NavLink>
          <NavLink to="/features" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>Features</NavLink>
          <NavLink to="/testimonials" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>Testimonials</NavLink>
          <NavLink to="/pricing" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>Pricing</NavLink>
          
          {/* Contact Details Group */}
          <div className="nav-contact-group">
            <span className="nav-link-header">Contact Us</span>
            <div className="nav-contact-icons">
              <a 
                href="https://www.google.com/maps/dir//Elite+CrossFit,+129,+Palani+Rd,+near+5K+Car+Care,+Udumalaipettai,+Tamil+Nadu+642126/@10.5807445,77.2562231,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ba9cde5c9514401:0x2d230b460a00e821!2m2!1d77.256153!2d10.5816073?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                title="Location"
                className="contact-icon-link"
              >
                <MapPin size={20} />
              </a>
              <a 
                href="https://wa.me/916383030651"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="contact-icon-link whatsapp"
              >
                <MessageCircle size={20} />
              </a>
              <a 
                href="tel:06383030651"
                title="Call Us"
                className="contact-icon-link"
              >
                <Phone size={20} />
              </a>
              <a 
                href="mailto:mail2crossfit@gmail.com"
                title="Email Us"
                className="contact-icon-link"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          <NavLink
            to={localStorage.getItem('isTrainer') === 'true' ? "/trainer-dashboard" : "/dashboard"}
            className={({ isActive }) => isActive ? 'nav-link active client-portal-link' : 'nav-link client-portal-link'}
            onClick={closeMenu}
          >
            {localStorage.getItem('isClientLoggedIn') ? "Dashboard" : "Client Portal"}
          </NavLink>
        </nav>

        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sparshLogo from '../../assets/sparsh-logo.jpg';
import styles from './Navbar.module.scss';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = ['home', 'services', 'why-choose-us', 'testimonials', 'team'];

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      setIsScrolled(scrollY > 50);

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className={`${styles.navbar} ${isScrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navContainer}>
          <div className={styles.logo} onClick={() => scrollToSection('home')} title="Sparsh Salon & Spa">
            <img src={sparshLogo} alt="Sparsh Salon & Spa" className={styles.logoImg} />
            <span className={styles.logoText}>SPARSH</span>
          </div>

          <ul className={styles.navLinks}>
            <li className={activeSection === 'home' ? styles.active : ''} onClick={() => scrollToSection('home')}>Home</li>
            <li className={activeSection === 'services' ? styles.active : ''} onClick={() => scrollToSection('services')}>Services</li>
            <li className={activeSection === 'why-choose-us' ? styles.active : ''} onClick={() => scrollToSection('why-choose-us')}>Why Us</li>
            <li className={activeSection === 'testimonials' ? styles.active : ''} onClick={() => scrollToSection('testimonials')}>Reviews</li>
            <li className={activeSection === 'team' ? styles.active : ''} onClick={() => scrollToSection('team')}>Team</li>
            <li onClick={() => navigate('/login')} className={styles.loginBtn}>Login</li>
          </ul>

          <div 
            className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ''}`} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>
      
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <ul>
          <li onClick={() => scrollToSection('home')}>Home</li>
          <li onClick={() => scrollToSection('services')}>Services</li>
          <li onClick={() => scrollToSection('why-choose-us')}>Why Us</li>
          <li onClick={() => scrollToSection('testimonials')}>Reviews</li>
          <li onClick={() => scrollToSection('team')}>Team</li>
          <li onClick={() => navigate('/login')} className={styles.mobileLoginBtn}>Login</li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;

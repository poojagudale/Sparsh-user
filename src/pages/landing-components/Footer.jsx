import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaPinterestP } from 'react-icons/fa';
import styles from './Footer.module.scss';

const Footer = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        
        <div className={styles.footerColumn}>
          <h3 className={styles.brandName}>SPARSH</h3>
          <p className={styles.brandDesc}>
            Experience luxury beauty and wellness. Where elegance meets confidence in a handcrafted environment.
          </p>
          <div className={styles.socialIcons}>
            <a href="#" className={styles.socialLink}><FaInstagram /></a>
            <a href="#" className={styles.socialLink}><FaFacebookF /></a>
            <a href="#" className={styles.socialLink}><FaPinterestP /></a>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <h4 className={styles.columnTitle}>Quick Links</h4>
          <ul className={styles.footerList}>
            <li onClick={() => scrollToSection('home')}>Home</li>
            <li onClick={() => scrollToSection('why-choose-us')}>About Us</li>
            <li onClick={() => scrollToSection('services')}>Services</li>
            <li onClick={() => scrollToSection('testimonials')}>Reviews</li>
            <li onClick={() => navigate('/login')}>Book Appointment</li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h4 className={styles.columnTitle}>Our Services</h4>
          <ul className={styles.footerList}>
            <li>Hair Styling</li>
            <li>Bridal Makeup</li>
            <li>Facial Treatments</li>
            <li>Skincare</li>
            <li>Nail Art</li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h4 className={styles.columnTitle}>Contact & Hours</h4>
          <p className={styles.infoText}>Mon - Sat: 9:00 AM - 8:00 PM</p>
          <p className={styles.infoText}>Sunday: 10:00 AM - 6:00 PM</p>
          <p className={styles.infoEmail}>bookings@sparshstudio.com</p>
        </div>

      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} SPARSH Studio. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

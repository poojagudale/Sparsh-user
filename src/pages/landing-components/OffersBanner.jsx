import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './OffersBanner.module.scss';

const OffersBanner = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.bannerSection}>
      <motion.div 
        className={styles.bannerContainer}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.bannerContent}>
          <h2 className={styles.bannerTitle}>Ready to transform your look?</h2>
          <p className={styles.bannerSubtitle}>Get 20% off on your first bridal or skincare package.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className={styles.ctaBtn}
          >
            Book Your Slot Today
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

export default OffersBanner;

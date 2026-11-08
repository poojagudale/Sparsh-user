import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';
import heroImg from '../../assets/hero.jpg';
import styles from './Hero.module.scss';

const Hero = () => {
  const navigate = useNavigate();

  const fadeLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 1, ease: 'easeOut' } }
  };

  const fadeRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 1, ease: 'easeOut' } }
  };

  const floatingAnimation = {
    y: ['-10px', '10px'],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut'
    }
  };

  return (
    <section id="home" className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <motion.div 
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={fadeLeft}
        >
          <div className={styles.glassCard}>
            <motion.h1 className={styles.title}>
              Enhance Your Natural Beauty
            </motion.h1>
            
            <motion.p className={styles.subtitle}>
              Experience premium beauty treatments, skincare, and wellness at Sparsh. Where elegance meets confidence.
            </motion.p>

            <div className={styles.buttonGroup}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className={styles.primaryBtn}
              >
                Book Appointment <FaChevronRight className={styles.btnIcon} />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const el = document.getElementById('services');
                  if(el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={styles.secondaryBtn}
              >
                Explore Services
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={styles.heroImageWrapper}
          initial="hidden"
          animate="visible"
          variants={fadeRight}
        >
          <motion.div className={styles.imageDecoration} animate={floatingAnimation}>
            <img src={heroImg} alt="Luxury Beauty Salon" className={styles.heroImg} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

import React from 'react';
import { motion } from 'framer-motion';
import { FaCut, FaCrown, FaSpa, FaMagic, FaPaintBrush, FaLeaf } from 'react-icons/fa';
import styles from './ServicesSection.module.scss';

const ServicesSection = () => {
  const services = [
    {
      title: 'Hair Styling',
      desc: 'Expert cuts, vibrant coloring, and blowout styling tailored to match your personal aesthetic.',
      icon: <FaCut />
    },
    {
      title: 'Bridal Makeup',
      desc: 'Luxury makeup services designed to make you look breathtaking and timeless on your wedding day.',
      icon: <FaCrown />
    },
    {
      title: 'Facial',
      desc: 'Advanced facial therapies targeting specific skin concerns with professional medical-grade products.',
      icon: <FaMagic />
    },
    {
      title: 'Hair Spa',
      desc: 'Deep conditioning and nourishing hair spa treatments to restore vitality and shine.',
      icon: <FaLeaf />
    },
    {
      title: 'Skincare',
      desc: 'Rejuvenating treatments, dermaplaning, and organic masques for radiant, hydrated skin.',
      icon: <FaSpa />
    },
    {
      title: 'Nail Art',
      desc: 'Sleek gel manicures, luxury pedicures, and custom nail art designed by master techs.',
      icon: <FaPaintBrush />
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardHover = {
    rest: { y: 0, scale: 1, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)' },
    hover: { 
      y: -12, 
      scale: 1.02, 
      boxShadow: '0 20px 40px rgba(192, 132, 252, 0.15)',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <section id="services" className={styles.servicesSection}>
      <div className={styles.sectionContainer}>
        <motion.div 
          className={styles.sectionHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <span className={styles.sectionLabel}>Our Offerings</span>
          <h2 className={styles.sectionTitle}>Featured Services</h2>
          <div className={styles.headingDivider} />
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className={styles.servicesGrid}
        >
          {services.map((item, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              whileHover="hover"
              initial="rest"
              animate="rest"
              variantsHover={cardHover}
              className={styles.serviceCard}
            >
              <div className={styles.serviceIconWrapper}>
                {item.icon}
              </div>
              <h3 className={styles.serviceCardTitle}>{item.title}</h3>
              <p className={styles.serviceCardDesc}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;

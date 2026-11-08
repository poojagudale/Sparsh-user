import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaQuoteRight } from 'react-icons/fa';
import styles from './Testimonials.module.scss';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sophia Miller',
      role: 'Bride',
      review: 'Absolutely the best bridal makeup experience! The team at Sparsh made me feel like a queen on my wedding day. The makeup lasted all night and looked flawless in every photograph.',
      rating: 5,
      avatar: 'S'
    },
    {
      name: 'Jessica K.',
      role: 'Regular Client',
      review: 'I regularly visit Sparsh for hair styling and facials. The staff is professional, and the atmosphere is so relaxing. They use premium products that have completely transformed my skin.',
      rating: 5,
      avatar: 'J'
    },
    {
      name: 'Priya Patel',
      role: 'Wellness Enthusiast',
      review: 'Their skin care and facial treatments are out of this world. It is not just a treatment; it is a full luxury wellness experience. I always leave feeling completely renewed.',
      rating: 5,
      avatar: 'P'
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <section id="testimonials" className={styles.testimonialsSection}>
      <div className={styles.sectionContainer}>
        <motion.div 
          className={styles.sectionHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <span className={styles.sectionLabel}>Client Stories</span>
          <h2 className={styles.sectionTitle}>Customer Feedback</h2>
          <div className={styles.headingDivider} />
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className={styles.testimonialsGrid}
        >
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              className={styles.testimonialCard}
            >
              <div className={styles.cardTop}>
                <div className={styles.starRating}>
                  {[...Array(t.rating)].map((_, i) => (
                    <FaStar key={i} className={styles.starIcon} />
                  ))}
                </div>
                <FaQuoteRight className={styles.quoteIcon} />
              </div>
              <p className={styles.testimonialReview}>"{t.review}"</p>
              <div className={styles.clientProfile}>
                <div className={styles.avatar}>
                  {t.avatar}
                </div>
                <div className={styles.clientInfo}>
                  <h4 className={styles.clientName}>{t.name}</h4>
                  <span className={styles.clientRole}>{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;

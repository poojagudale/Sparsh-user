import React from 'react';
import { motion } from 'framer-motion';
import { FaCertificate, FaGem, FaPumpSoap, FaHeart, FaTags, FaUsers } from 'react-icons/fa';
import styles from './WhyChooseUs.module.scss';

const WhyChooseUs = () => {
  const reasons = [
    { title: 'Certified Experts', icon: <FaCertificate /> },
    { title: 'Premium Products', icon: <FaGem /> },
    { title: 'Hygienic Environment', icon: <FaPumpSoap /> },
    { title: 'Personalized Care', icon: <FaHeart /> },
    { title: 'Affordable Packages', icon: <FaTags /> },
    { title: 'Trusted by Hundreds', icon: <FaUsers /> },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="why-choose-us" className={styles.whySection}>
      <div className={styles.sectionContainer}>
        <motion.div 
          className={styles.contentWrapper}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeUp}
        >
          <div className={styles.textSection}>
            <span className={styles.sectionLabel}>The Studio</span>
            <h2 className={styles.sectionTitle}>Why Choose Sparsh</h2>
            <div className={styles.headingDivider} />
            <p className={styles.description}>
              At Sparsh, we believe every woman deserves to feel confident and beautiful. 
              Experience luxurious beauty treatments with professional care, personalized to 
              bring out the best version of you in an oasis of calmness and elegance.
            </p>
          </div>
          
          <div className={styles.featuresGrid}>
            {reasons.map((reason, idx) => (
              <motion.div 
                key={idx}
                className={styles.featureItem}
                variants={fadeUp}
                whileHover={{ scale: 1.05 }}
              >
                <div className={styles.iconWrapper}>
                  {reason.icon}
                </div>
                <h4 className={styles.featureTitle}>{reason.title}</h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

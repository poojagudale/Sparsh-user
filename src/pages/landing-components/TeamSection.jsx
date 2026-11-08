import React from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import styles from './TeamSection.module.scss';

const TeamSection = () => {
  const team = [
    {
      name: 'Elena Rodriguez',
      role: 'Senior Hair Stylist',
      desc: 'Expert in modern cuts and advanced color techniques with 10 years of experience.',
      img: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Sarah Chen',
      role: 'Bridal Makeup Artist',
      desc: 'Specializes in creating flawless, timeless bridal looks for your special day.',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Aisha Patel',
      role: 'Skincare Specialist',
      desc: 'Certified esthetician dedicated to transforming your skin health and natural glow.',
      img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Mia Wong',
      role: 'Nail Artist',
      desc: 'Creative nail technician offering bespoke designs and luxury manicures.',
      img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Olivia Smith',
      role: 'Salon Manager',
      desc: 'Ensuring every guest receives a premium, seamless experience at Sparsh.',
      img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <section id="team" className={styles.teamSection}>
      <div className={styles.sectionContainer}>
        <motion.div 
          className={styles.sectionHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <span className={styles.sectionLabel}>The People</span>
          <h2 className={styles.sectionTitle}>Meet Our Beauty Experts</h2>
          <div className={styles.headingDivider} />
          <p className={styles.sectionSubtitle}>
            Our experienced professionals are passionate about helping you look and feel your best.
          </p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className={styles.teamGrid}
        >
          {team.map((member, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -10 }}
              className={styles.teamCard}
            >
              <div className={styles.imageWrapper}>
                <img src={member.img} alt={member.name} className={styles.teamImage} loading="lazy" />
                <div className={styles.socialOverlay}>
                  <a href="#" className={styles.socialIcon}><FaInstagram /></a>
                  <a href="#" className={styles.socialIcon}><FaFacebookF /></a>
                  <a href="#" className={styles.socialIcon}><FaTwitter /></a>
                </div>
              </div>
              <div className={styles.teamInfo}>
                <h3 className={styles.memberName}>{member.name}</h3>
                <span className={styles.memberRole}>{member.role}</span>
                <p className={styles.memberDesc}>{member.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;

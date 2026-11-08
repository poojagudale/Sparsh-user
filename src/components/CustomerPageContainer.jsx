import React from 'react';
import CustomerNavbar from './CustomerNavbar';
import styles from './CustomerPageContainer.module.scss';

/**
 * CustomerPageContainer — shared container layout for customer pages:
 * Home, Services, Bookings, Profile.
 *
 * Ensures:
 * - Consistent 1200px max width and 24px horizontal padding matching the header
 * - Proper top clearance (88px) for fixed navbar
 * - Proper bottom clearance (80px) so content is never obscured by FooterTabs
 * - Consistent viewport scrolling and left alignment across all tabs
 */
const CustomerPageContainer = ({ children, className = '', mainClassName = '' }) => {
  return (
    <div className={`${styles.page} ${className}`}>
      <CustomerNavbar />
      <main className={`${styles.main} ${mainClassName}`}>
        {children}
      </main>
      <div className={styles.bottomPad} />
    </div>
  );
};

export default CustomerPageContainer;

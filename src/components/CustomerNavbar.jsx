import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import sparshLogo from '../assets/sparsh-logo.jpg';
import styles from './CustomerNavbar.module.scss';

/**
 * CustomerNavbar — post-login top navigation bar for customers.
 * Consistent with the Sparsh landing page visual identity.
 * Renders on all protected pages; hidden on /, /login, /signup.
 */
const CustomerNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('customer');
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Derive initials for avatar fallback
  const initials = user?.fullName
    ? user.fullName.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const path = location.pathname;
  const isHomeActive = path === '/home' || path === '/search';
  const isServicesActive = path === '/services_view' || path === '/services';
  const isBookingsActive = path === '/bookings' || path === '/booking' || path.startsWith('/bookings/');
  const isProfileActive = path === '/profile' || path.startsWith('/profile');

  const hasProfilePic = Boolean(user?.profilePicture && !avatarError);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          {/* Logo */}
          <div className={styles.logo} onClick={() => navigate('/home')} title="Sparsh Salon & Spa Home">
            <img src={sparshLogo} alt="Sparsh Salon & Spa" className={styles.logoImg} />
            <span className={styles.logoText}>SPARSH</span>
          </div>

          {/* Desktop links */}
          <ul className={styles.navLinks}>
            <li>
              <NavLink
                to="/home"
                className={isHomeActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/services_view"
                className={isServicesActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
              >
                Services
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/bookings"
                className={isBookingsActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
              >
                Bookings
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={isProfileActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
              >
                Profile
              </NavLink>
            </li>
          </ul>

          {/* Desktop user avatar + dropdown */}
          <div className={styles.userArea}>
            <button
              className={styles.avatarBtn}
              onClick={() => setShowUserMenu((prev) => !prev)}
              aria-label="User menu"
            >
              {hasProfilePic ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName || 'User profile'}
                  className={styles.avatarImg}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className={styles.avatarInitials}>{initials}</div>
              )}
            </button>

            {showUserMenu && (
              <div className={styles.userDropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownUserRow}>
                    <div className={styles.dropdownAvatar}>
                      {hasProfilePic ? (
                        <img
                          src={user.profilePicture}
                          alt={user.fullName || 'User'}
                          className={styles.avatarImg}
                          referrerPolicy="no-referrer"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className={styles.avatarInitials}>{initials}</div>
                      )}
                    </div>
                    <div className={styles.dropdownUserMeta}>
                      <p className={styles.dropdownName}>{user?.fullName || 'Guest'}</p>
                      <p className={styles.dropdownEmail}>{user?.email || ''}</p>
                    </div>
                  </div>
                </div>
                <hr className={styles.dropdownDivider} />
                <button
                  className={styles.dropdownItem}
                  onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  My Profile
                </button>
                <button
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  onClick={() => { setShowUserMenu(false); handleLogout(); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <ul>
          <li>
            <NavLink to="/home" onClick={closeMobileMenu}
              className={isHomeActive ? styles.mobileActive : ''}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/services_view" onClick={closeMobileMenu}
              className={isServicesActive ? styles.mobileActive : ''}>
              Services
            </NavLink>
          </li>
          <li>
            <NavLink to="/bookings" onClick={closeMobileMenu}
              className={isBookingsActive ? styles.mobileActive : ''}>
              Bookings
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" onClick={closeMobileMenu}
              className={isProfileActive ? styles.mobileActive : ''}>
              Profile
            </NavLink>
          </li>
          <li className={styles.mobileUserInfo}>
            <div className={styles.mobileAvatar}>
              {hasProfilePic ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName || 'User'}
                  className={styles.avatarImg}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className={styles.avatarInitials}>{initials}</div>
              )}
            </div>
            <span>{user?.fullName || 'Guest'}</span>
          </li>
          <li>
            <button className={styles.mobileLogoutBtn} onClick={() => { closeMobileMenu(); handleLogout(); }}>
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Overlays */}
      {showUserMenu && (
        <div className={styles.overlay} onClick={() => setShowUserMenu(false)} />
      )}
      {mobileMenuOpen && (
        <div className={styles.overlay} onClick={closeMobileMenu} />
      )}
    </>
  );
};

export default CustomerNavbar;

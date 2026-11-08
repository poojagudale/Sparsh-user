import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { registerWithEmail } from '../api/authApi';
import { getMyCustomerProfile } from '../api/CustomerApi';
import heroImg from '../assets/hero.jpg';
import styles from './Login.module.scss';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  // ── Local Registration ─────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const authResponse = await registerWithEmail(fullName, email, password);
      saveAuth(authResponse);
      
      try {
        const customer = await getMyCustomerProfile();
        if (customer && customer.custId) {
          localStorage.setItem('customer', JSON.stringify(customer));
        } else {
          localStorage.removeItem('customer');
        }
      } catch (profileErr) {
        console.warn('Customer profile preload check:', profileErr);
      }

      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.splitPageContainer}>
      <div className={styles.layoutWrapper}>
        
        {/* ── LEFT SIDE (50%): Image Banner with Overlay ── */}
        <motion.div 
          className={styles.imageColumn}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className={styles.imageBg} style={{ backgroundImage: `url(${heroImg})` }} />
          <div className={styles.imageOverlay} />
          <div className={styles.floatingContent}>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Join Sparsh
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Luxury Awaits You
            </motion.p>
          </div>
        </motion.div>

        {/* ── RIGHT SIDE (50%): Elegant Registration Card ── */}
        <motion.div 
          className={styles.formColumn}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className={styles.backToHome}>
            <Link to="/">&larr; Back to Home</Link>
          </div>

          <motion.div 
            className={styles.loginCard}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.header}>
              <h1>Create Account</h1>
              <p>Join SPARSH for a luxury parlor experience</p>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form className={styles.form} onSubmit={handleSignup}>
              <div className={styles.inputGroup}>
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="signup-email">Email Address</label>
                <input
                  type="email"
                  id="signup-email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="signup-password">Password</label>
                <input
                  type="password"
                  id="signup-password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              <motion.button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
                id="signup-submit-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </motion.button>
            </form>

            <p className={styles.switchLink} style={{ marginTop: '2rem' }}>
              Already have an account?{' '}
              <Link to="/login" id="goto-login-link">Login</Link>
            </p>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};

export default Signup;

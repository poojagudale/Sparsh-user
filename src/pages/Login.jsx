import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { loginWithEmail, loginWithGoogle } from '../api/authApi';
import { getMyCustomerProfile } from '../api/CustomerApi';
import heroImg from '../assets/hero.jpg';
import sparshLogo from '../assets/sparsh-logo.jpg';
import styles from './Login.module.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleBtnWidth, setGoogleBtnWidth] = useState(380);
  const googleWrapperRef = useRef(null);

  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const updateWidth = () => {
      if (googleWrapperRef.current) {
        const clientWidth = googleWrapperRef.current.clientWidth;
        if (clientWidth > 0) {
          // Google GSI button width allowed range: 200px to 400px
          const clamped = Math.min(400, Math.max(200, Math.floor(clientWidth)));
          setGoogleBtnWidth(clamped);
        }
      }
    };
    updateWidth();
    const timer = setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Helper to preload customer profile data into localStorage if available
  const preloadCustomerProfile = async () => {
    try {
      const customer = await getMyCustomerProfile();
      if (customer && customer.custId) {
        localStorage.setItem('customer', JSON.stringify(customer));
      } else {
        localStorage.removeItem('customer');
      }
    } catch (err) {
      console.warn('Customer profile preload check:', err);
    }
  };

  // ── Local Login ────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authResponse = await loginWithEmail(email, password);
      saveAuth(authResponse);
      
      // If remember me is set, store flag
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('remember_me');
      }

      // Preload customer profile information for the authenticated user
      await preloadCustomerProfile();

      // Requirement 1: Redirect successfully logged-in admin (and customers) to the Home tab
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Google Login ───────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      if (!credentialResponse || !credentialResponse.credential) {
        throw new Error('Google credential token was not received.');
      }

      // Extract picture from token payload if available
      let googlePicture = null;
      try {
        const payloadBase64 = credentialResponse.credential.split('.')[1];
        if (payloadBase64) {
          const parsed = JSON.parse(atob(payloadBase64));
          googlePicture = parsed.picture || null;
        }
      } catch (tokenParseErr) {
        console.warn('Could not extract payload locally:', tokenParseErr);
      }

      const authResponse = await loginWithGoogle(credentialResponse.credential);
      if (googlePicture && !authResponse.profilePicture) {
        authResponse.profilePicture = googlePicture;
      }
      saveAuth(authResponse);

      // Preload customer profile information from Customer table
      await preloadCustomerProfile();

      // Requirement 1: Redirect successfully logged-in admin to the Home tab
      navigate('/home');
    } catch (err) {
      console.error('Google Auth Frontend Error:', err);
      const msg = err.response?.data?.message || err.message || 'Google sign-in failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google sign-in component reported error or user cancelled.');
    setError('Google sign-in was cancelled or failed.');
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
              Welcome Back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Beauty Begins Here
            </motion.p>
          </div>
        </motion.div>

        {/* ── RIGHT SIDE (50%): Glassmorphism Form Card ── */}
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
              <img src={sparshLogo} alt="Sparsh Salon & Spa" className={styles.logoBadge} />
              <h1>Welcome Back</h1>
              <p>Sign in to continue to SPARSH</p>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form className={styles.form} onSubmit={handleLogin}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className={styles.optionsRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember Me</span>
                </label>
                <a href="#forgot" className={styles.forgotLink} onClick={(e) => {
                  e.preventDefault();
                  alert("Please contact our salon support at bookings@sparshstudio.com to reset your password.");
                }}>
                  Forgot Password?
                </a>
              </div>

              <motion.button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
                id="login-submit-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </motion.button>
            </form>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <div ref={googleWrapperRef} className={styles.googleBtnWrapper} id="google-login-btn">
              <GoogleLogin
                key={googleBtnWidth}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                shape="rectangular"
                size="large"
                text="signin_with"
                width={googleBtnWidth}
              />
            </div>

            <p className={styles.switchLink}>
              Don't have an account?{' '}
              <Link to="/signup" id="goto-signup-link">Sign Up</Link>
            </p>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;

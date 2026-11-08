import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNavbar from '../components/CustomerNavbar';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { getCustomerByMobile } from '../api/CustomerApi';
import styles from './CustomerHome.module.scss';
import TeamSection from './landing-components/TeamSection';

// We import the requested images
import heroImg from '../assets/First.jpeg';
import fallbackRelax from '../assets/hero.jpg';
import fallbackRefresh from '../assets/Parlour.jpeg';
import fallbackGlow from '../assets/hero.png';

const isValidMobile = (v) => /^[6-9]\d{9}$/.test(v.trim());

const CustomerHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [fieldError, setFieldError] = useState('');

  // Services API state
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesError] = useState('');

  // External Image URLs
  const [wideImgSrc, setWideImgSrc] = useState('https://static.wixstatic.com/media/83a490_78db6d7836564a45b08a142a0c43dc76~mv2.png/v1/fill/w_1920,h_1280,al_c,q_95,enc_auto/83a490_78db6d7836564a45b08a142a0c43dc76~mv2.png');
  const [relaxImgSrc, setRelaxImgSrc] = useState('https://cdnewmoda.expatwoman.com/s3fs-public/spa%20day.jpg');
  const [refreshImgSrc, setRefreshImgSrc] = useState('https://static.thatsup.website/424/42349/responsive-images/_DSF2654___media_library_original_4096_2731.jpg');
  const [glowImgSrc, setGlowImgSrc] = useState('https://www.kanvazhotelbali.com/wp-content/uploads/2024/07/main-facial.jpg');

  const showToast = (msg, type = 'info') => setToast({ message: msg, type });

  const handleSearch = async (e) => {
    e.preventDefault();
    setFieldError('');

    if (!mobile.trim()) { setFieldError('Please enter your contact number.'); return; }
    if (!isValidMobile(mobile)) { setFieldError('Please enter a valid 10-digit mobile number.'); return; }

    setLoading(true);
    try {
      const customer = await getCustomerByMobile(mobile.trim());
      if (customer && customer.custId) {
        localStorage.setItem('customer', JSON.stringify(customer));
        navigate('/profile');
      } else {
        localStorage.removeItem('customer');
        navigate('/profile', { state: { isNew: true, mobile: mobile.trim() } });
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExploreServices = async () => {
    setLoadingServices(true);
    navigate('/services_view');
  };

  return (
    <div className={styles.page}>
      <CustomerNavbar />
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <main className={styles.main}>
        {/* SECTION 1 — Hero + Welcome Content */}
        <section className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <span className={styles.eyebrow}>BEAUTY • CARE • CONFIDENCE</span>
            <h1 className={styles.heroTitle}>
              Welcome to Sparsh !
            </h1>
            <p className={styles.heroText}>
              Your beauty journey, all in one place.
            </p>
            <p className={styles.heroDescription}>
              Your personal salon experience starts here. Explore our services, discover the right treatments for you, and manage your appointments conveniently in one place. We're here to make every visit special.
            </p>
            <div className={styles.heroHighlights}>
              <div className={styles.highlightPill}>
                <span className={styles.highlightDot} />
                <span>Personalized Salon Care</span>
              </div>
              <div className={styles.highlightPill}>
                <span className={styles.highlightDot} />
                <span>Effortless Appointments</span>
              </div>
              <div className={styles.highlightPill}>
                <span className={styles.highlightDot} />
                <span>Certified Stylists</span>
              </div>
            </div>
            <div className={styles.searchContainer}>
              <button onClick={() => navigate('/profile')} className={styles.primaryBtn} disabled={loading}>
                Go to My Profile
              </button>
            </div>
          </div>
          <div className={styles.heroRight}>
            <img src={heroImg} alt="Sparsh Reception" className={styles.heroImg} />
          </div>
        </section>

        {/* SECTION 2 — Welcome to Sparsh */}
        <section className={styles.welcomeSection}>
          <h2 className={styles.sectionTitle}>A Little Time for You 🌸</h2>
          <p className={styles.sectionText}>At Sparsh, beauty is more than a service. It's a moment to relax, refresh and feel your best.</p>
        </section>

        {/* SECTION 2.5 — Large Horizontal Image */}
        <section className={styles.wideImageSection}>
          <img
            src={wideImgSrc}
            alt="Salon Interior"
            className={styles.wideImage}
            onError={() => setWideImgSrc(fallbackRefresh)}
          />
        </section>

        {/* SECTION 2.75 — Meet Our Team (reused from Landing page) */}
        <TeamSection />

        {/* SECTION 3 — The Sparsh Experience */}
        <section className={styles.experienceSection}>
          <div className={styles.expHeader}>
            <h2 className={styles.expTitle}>The Sparsh Experience</h2>
            <p className={styles.expSubtitle}>Relax. Refresh. Rediscover yourself.</p>
          </div>

          <div className={styles.inspCards}>
            <div className={styles.inspCard}>
              <img
                src={relaxImgSrc}
                alt="Relax"
                className={styles.inspImg}
                onError={() => setRelaxImgSrc(fallbackRelax)}
              />
              <h4>RELAX</h4>
              <p>Take a moment to unwind.</p>
            </div>
            <div className={styles.inspCard}>
              <img
                src={refreshImgSrc}
                alt="Refresh"
                className={styles.inspImg}
                onError={() => setRefreshImgSrc(fallbackRefresh)}
              />
              <h4>REFRESH</h4>
              <p>Give your look a fresh touch.</p>
            </div>
            <div className={styles.inspCard}>
              <img
                src={glowImgSrc}
                alt="Glow"
                className={styles.inspImg}
                onError={() => setGlowImgSrc(fallbackGlow)}
              />
              <h4>GLOW</h4>
              <p>Feel confident in your own glow.</p>
            </div>
          </div>

          <button
            onClick={handleExploreServices}
            className={styles.secondaryBtn}
            disabled={loadingServices}
          >
            {loadingServices ? 'Loading...' : 'Explore Services →'}
          </button>
          {servicesError && <p className={styles.fieldErr}>{servicesError}</p>}
        </section>
        <div className={styles.bottomPad} />
      </main>
    </div>
  );
};

export default CustomerHome;

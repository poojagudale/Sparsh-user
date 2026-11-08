import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getServices } from '../../services/serviceApi';
import CustomerPageContainer from '../../components/CustomerPageContainer';
import BookingModal from '../../components/BookingModal';
import Toast from '../../components/Toast';
import styles from './CustomerServiceView.module.scss';

const API_BASE = '';

// ─────────────────────────────────────────────────────────────────
// Per-category placeholder SVGs — unique icon per service type
// ─────────────────────────────────────────────────────────────────
const categoryIcons = {
  hair: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3c0 4.97 3 9 3 9s3-4.03 3-9" />
      <path d="M6 21c0-3 1.5-6 6-6s6 3 6 6" />
      <line x1="12" y1="12" x2="12" y2="15" />
    </svg>
  ),
  skin: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9c0 1.66 1.34 3 3 3s3-1.34 3-3" />
      <path d="M9 15h6" />
    </svg>
  ),
  nail: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="10" height="14" rx="3" />
      <path d="M7 14c0 3.31 2.24 6 5 6s5-2.69 5-6" />
    </svg>
  ),
  makeup: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
      <circle cx="12" cy="9" r="2" />
    </svg>
  ),
  spa: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4-4 8-8 8-12a8 8 0 1 0-16 0c0 4 4 8 8 12z" />
      <path d="M12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  ),
  default: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

function pickIcon(serviceName = '') {
  const n = serviceName.toLowerCase();
  if (n.includes('hair') || n.includes('cut') || n.includes('colour') || n.includes('color') || n.includes('keratin')) return categoryIcons.hair;
  if (n.includes('skin') || n.includes('facial') || n.includes('face') || n.includes('glow') || n.includes('peel')) return categoryIcons.skin;
  if (n.includes('nail') || n.includes('manicure') || n.includes('pedicure')) return categoryIcons.nail;
  if (n.includes('makeup') || n.includes('bridal') || n.includes('party')) return categoryIcons.makeup;
  if (n.includes('spa') || n.includes('massage') || n.includes('relax') || n.includes('body')) return categoryIcons.spa;
  return categoryIcons.default;
}

// ─────────────────────────────────────────────────────────────────
// ServiceCard — portrait 3:4 card
// ─────────────────────────────────────────────────────────────────
const ServiceCard = memo(({ service, index, onUnavailableClick, onBookNowClick }) => {
  const imageSrc = service.imageUrl
    ? (service.imageUrl.startsWith('http') || service.imageUrl.startsWith('/') ? service.imageUrl : `/${service.imageUrl}`)
    : null;
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !imageSrc || imgError;

  const handleBookNow = (e) => {
    e.stopPropagation();
    if (!service.isActive) {
      if (onUnavailableClick) onUnavailableClick(service);
      return;
    }
    if (onBookNowClick) {
      onBookNowClick(service);
    }
  };

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
    >
      {/* ── Image block (top ~72% via flex:1) ─────────────────── */}
      <div className={styles.imageWrapper}>
        {!showPlaceholder ? (
          <>
            <img
              src={imageSrc}
              alt={service.serviceName}
              className={styles.image}
              onError={() => setImgError(true)}
            />
            <div className={styles.imageGradient} aria-hidden="true" />
          </>
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            <span className={styles.placeholderIcon}>
              {pickIcon(service.serviceName)}
            </span>
            <span className={styles.placeholderLabel}>{service.serviceName}</span>
          </div>
        )}

        {service.isActive && (
          <span className={styles.activeBadge}>Available</span>
        )}
      </div>

      {/* ── Info block (bottom ~28% via flex:0) ───────────────── */}
      <div className={styles.cardBody}>
        <h3 className={styles.serviceName}>{service.serviceName}</h3>
        {service.description && (
          <p className={styles.serviceDesc}>{service.description}</p>
        )}
        <div className={styles.cardFooter}>
          {service.price != null && (
            <span className={styles.price}>
              ₹{Number(service.price).toLocaleString('en-IN')}
            </span>
          )}
          {service.duration && (
            <span className={styles.duration}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {service.duration} min
            </span>
          )}
        </div>
        <button className={styles.bookNowBtn} onClick={handleBookNow}>
          Book Now
        </button>
      </div>
    </motion.div>
  );
});
ServiceCard.displayName = 'ServiceCard';

// ─────────────────────────────────────────────────────────────────
// SkeletonCard — portrait 3:4 skeleton
// ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className={styles.skeleton} aria-hidden="true">
    <div className={`${styles.skeletonImg} ${styles.shimmer}`} />
    <div className={styles.skeletonBody}>
      <div className={`${styles.skeletonLineWide} ${styles.shimmer}`} />
      <div className={`${styles.skeletonLine} ${styles.shimmer}`} />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────
// CustomerServiceView — main page
// ─────────────────────────────────────────────────────────────────
const CustomerServiceView = () => {
  const navigate = useNavigate();
  const [services, setServices]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState('');
  const [search,   setSearch]     = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [unavailableService, setUnavailableService] = useState(null);
  const [bookingService, setBookingService] = useState(null);
  const [toast, setToast] = useState(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getServices();
      const list = Array.isArray(data) ? data : [];
      setServices(list);
      setFiltered(list);
    } catch (err) {
      console.error('Services load error:', err);
      setError('Something went wrong while loading services. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadServices(); }, [loadServices]);

  // Filter + search
  useEffect(() => {
    let result = [...services];
    if (activeFilter === 'active')   result = result.filter(s => s.isActive);
    if (activeFilter === 'inactive') result = result.filter(s => !s.isActive);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.serviceName?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, activeFilter, services]);

  const activeCount = services.filter(s => s.isActive).length;

  const handleBookingSuccess = (booking) => {
    setToast({
      message: `Appointment for "${booking.serviceName || 'service'}" requested successfully!`,
      type: 'success',
    });
  };

  return (
    <CustomerPageContainer>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* ── Page header ───────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1 className={styles.pageTitle}>Our Services</h1>
          <p className={styles.pageSubtitle}>
            Discover treatments designed to make you feel your best.
          </p>
        </motion.div>

        {!loading && services.length > 0 && (
          <motion.div
            className={styles.searchBar}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <span className={styles.searchIcon} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search services…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
              aria-label="Search services"
            />
            {search && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Filter chips ──────────────────────────────────── */}
      {!loading && services.length > 0 && (
        <div className={styles.filterRow}>
          {[
            { key: 'all',    label: `All (${services.length})` },
            { key: 'active', label: `Available (${activeCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.filterChip} ${activeFilter === key ? styles.chipActive : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────── */}
      {error && (
        <div className={styles.errorBox} role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button className={styles.retryBtn} onClick={loadServices}>Retry</button>
        </div>
      )}

      {/* ── Skeleton grid ─────────────────────────────────── */}
      {loading && (
        <div className={styles.grid} aria-label="Loading services">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────── */}
      {!loading && !error && filtered.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">
            {categoryIcons.default}
          </div>
          <p className={styles.emptyTitle}>
            {search
              ? 'No services match your search.'
              : 'Our services are being refreshed. Please check again soon.'}
          </p>
          {search && (
            <button className={styles.clearSearchBtn} onClick={() => setSearch('')}>
              Clear search
            </button>
          )}
        </div>
      )}

      {/* ── Service cards grid ────────────────────────────── */}
      {!loading && !error && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map((service, i) => (
            <ServiceCard 
              key={service.serviceId} 
              service={service} 
              index={i} 
              onUnavailableClick={setUnavailableService}
              onBookNowClick={setBookingService}
            />
          ))}
        </div>
      )}

      {/* ── Unavailable Modal ────────────────────────────── */}
      {unavailableService && (
        <div className={styles.modalOverlay} onClick={() => setUnavailableService(null)}>
          <motion.div 
            className={styles.modalContent} 
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
          >
            <div className={styles.modalIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className={styles.modalTitle}>Service Unavailable</h3>
            <p className={styles.modalText}>
              Sorry, the <strong>{unavailableService.serviceName}</strong> service is currently unavailable. 
              You can book it later when the service becomes available.
            </p>
            <button 
              className={styles.modalBtn} 
              onClick={() => setUnavailableService(null)}
            >
              OK
            </button>
          </motion.div>
        </div>
      )}

      {/* ── Book Now Confirmation Modal ─────────────────── */}
      <BookingModal
        service={bookingService}
        isOpen={!!bookingService}
        onClose={() => setBookingService(null)}
        onSuccess={handleBookingSuccess}
      />
    </CustomerPageContainer>
  );
};

export default CustomerServiceView;

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerPageContainer from '../components/CustomerPageContainer';
import Toast from '../components/Toast';
import { getMyBookings, cancelBooking } from '../api/bookingApi';
import styles from './Bookings.module.scss';

const FILTER_TABS = [
  { key: 'ALL',       label: 'All' },
  { key: 'REQUESTED', label: 'Requested' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const EMPTY_MESSAGES = {
  ALL:       "You haven't booked any services yet.",
  REQUESTED: "You have no pending booking requests.",
  CONFIRMED: "You have no confirmed appointments.",
  COMPLETED: "Your completed appointments will appear here.",
  CANCELLED: "You have no cancelled appointments.",
};

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [toast, setToast] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelBooking, setConfirmCancelBooking] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError(err.message || 'Failed to load bookings. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Compute live counts per filter tab
  const filterCounts = useMemo(() => {
    const counts = {
      ALL: bookings.length,
      REQUESTED: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    bookings.forEach((b) => {
      const st = (b.status || '').toUpperCase();
      if (st === 'REQUESTED') counts.REQUESTED++;
      else if (st === 'CONFIRMED') counts.CONFIRMED++;
      else if (st === 'COMPLETED') counts.COMPLETED++;
      else if (st === 'CANCELLED' || st === 'REJECTED') counts.CANCELLED++;
    });
    return counts;
  }, [bookings]);

  // Filter bookings list
  const filteredBookings = useMemo(() => {
    if (activeFilter === 'ALL') return bookings;
    if (activeFilter === 'CANCELLED') {
      return bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED');
    }
    return bookings.filter(b => (b.status || '').toUpperCase() === activeFilter);
  }, [bookings, activeFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '');

  const getStatusClass = (status) => {
    const key = (status || '').toLowerCase();
    return styles[`status-${key}`] || '';
  };

  const handleOpenCancelConfirm = (e, b) => {
    e.stopPropagation();
    setConfirmCancelBooking(b);
  };

  const handleConfirmCancel = async () => {
    if (!confirmCancelBooking) return;
    const bookingId = confirmCancelBooking.bookingId;
    setCancellingId(bookingId);

    try {
      await cancelBooking(bookingId);
      setToast({ message: 'Appointment cancelled successfully.', type: 'info' });
      setConfirmCancelBooking(null);
      // Refresh list from backend
      fetchBookings();
    } catch (err) {
      console.error('Cancel booking error:', err);
      setToast({ message: err.message || 'Failed to cancel appointment.', type: 'error' });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <CustomerPageContainer>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className={styles.container}>

        {/* ── Page Header ────────────────────────────────────── */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Bookings</h1>
          <p className={styles.pageSubtitle}>Manage your salon appointments</p>
        </div>

        {/* ── Status Filters ─────────────────────────────────── */}
        <div className={styles.filterRow} role="tablist" aria-label="Booking status filters">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeFilter === tab.key}
              className={`${styles.filterChip} ${activeFilter === tab.key ? styles.chipActive : ''}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              <span>{tab.label}</span>
              <span className={styles.filterCount}>{filterCounts[tab.key] || 0}</span>
            </button>
          ))}
        </div>

        {/* ── Loading State ──────────────────────────────────── */}
        {loading && (
          <div className={styles.loadingCard}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Loading your appointments…</p>
          </div>
        )}

        {/* ── Error State ────────────────────────────────────── */}
        {!loading && error && (
          <div className={styles.errorCard} role="alert">
            <div className={styles.errorIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className={styles.errorTitle}>Unable to Load Bookings</h2>
            <p className={styles.errorText}>{error}</p>
            <button className={styles.retryBtn} onClick={fetchBookings}>
              Retry
            </button>
          </div>
        )}

        {/* ── Empty State ────────────────────────────────────── */}
        {!loading && !error && filteredBookings.length === 0 && (
          <motion.div
            className={styles.emptyCard}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.emptyIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>No Appointments</h2>
            <p className={styles.emptyText}>
              {EMPTY_MESSAGES[activeFilter] || 'No appointments found for this filter.'}
            </p>
            <button className={styles.exploreBtn} onClick={() => navigate('/services_view')}>
              Explore Services
            </button>
          </motion.div>
        )}

        {/* ── Booking Cards List ─────────────────────────────── */}
        {!loading && !error && filteredBookings.length > 0 && (
          <div className={styles.bookingList}>
            {/* Desktop Table Header */}
            <div className={styles.tableHeader}>
              <div>SERVICE</div>
              <div>DATE & TIME</div>
              <div>NOTE</div>
              <div>STATUS</div>
              <div className={styles.headerAction}>ACTION</div>
            </div>

            {/* List of Booking Cards */}
            {filteredBookings.map((b) => {
              const imageSrc = b.serviceImageUrl
                ? (b.serviceImageUrl.startsWith('http') || b.serviceImageUrl.startsWith('/') ? b.serviceImageUrl : `/${b.serviceImageUrl}`)
                : null;

              const isCancellable = b.status === 'REQUESTED' || b.status === 'CONFIRMED';

              return (
                <motion.div
                  key={b.bookingId}
                  className={styles.bookingCard}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Service info */}
                  <div className={styles.colService}>
                    <div className={styles.serviceImgWrap}>
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={b.serviceName || 'Service'}
                          className={styles.serviceImg}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className={styles.placeholderIcon}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className={styles.serviceInfo}>
                      <h3 className={styles.serviceName}>{b.serviceName || 'Salon Service'}</h3>
                      <p className={styles.serviceLabel}>Salon Appointment</p>
                    </div>
                  </div>

                  {/* Date & Period */}
                  <div className={styles.colDateTime}>
                    <span>{formatDate(b.preferredDate)}</span>
                    <span>&bull;</span>
                    <span>{capitalize(b.preferredPeriod)}</span>
                  </div>

                  {/* Special Request / Note */}
                  <div className={styles.colNote}>
                    {b.specialRequest ? (
                      `"${b.specialRequest}"`
                    ) : (
                      <span className={styles.emptyNote}>—</span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className={styles.colStatus}>
                    <span className={`${styles.statusBadge} ${getStatusClass(b.status)}`}>
                      {b.status}
                    </span>
                  </div>

                  {/* Action */}
                  <div className={styles.colAction}>
                    {isCancellable ? (
                      <button
                        className={styles.cancelBtn}
                        onClick={(e) => handleOpenCancelConfirm(e, b)}
                        disabled={cancellingId === b.bookingId}
                      >
                        {cancellingId === b.bookingId ? 'Cancelling…' : 'Cancel'}
                      </button>
                    ) : (
                      <span className={styles.emptyNote}>—</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Cancel Confirmation Modal ────────────────────── */}
        <AnimatePresence>
          {confirmCancelBooking && (
            <div className={styles.modalOverlay} onClick={() => setConfirmCancelBooking(null)}>
              <motion.div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.modalIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className={styles.modalTitle}>Cancel Appointment?</h3>
                <p className={styles.modalText}>
                  Are you sure you want to cancel your appointment for{' '}
                  <strong>{confirmCancelBooking.serviceName}</strong> on{' '}
                  {formatDate(confirmCancelBooking.preferredDate)} ({capitalize(confirmCancelBooking.preferredPeriod)})?
                </p>
                <div className={styles.modalActions}>
                  <button
                    className={styles.modalCancelBtn}
                    onClick={() => setConfirmCancelBooking(null)}
                    disabled={cancellingId !== null}
                  >
                    Keep Booking
                  </button>
                  <button
                    className={styles.modalConfirmBtn}
                    onClick={handleConfirmCancel}
                    disabled={cancellingId !== null}
                  >
                    {cancellingId !== null ? 'Cancelling…' : 'Yes, Cancel'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </CustomerPageContainer>
  );
};

export default Bookings;

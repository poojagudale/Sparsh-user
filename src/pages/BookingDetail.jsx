import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomerNavbar from '../components/CustomerNavbar';
import Toast from '../components/Toast';
import { getBookingById, cancelBooking } from '../api/bookingApi';
import styles from './BookingDetail.module.scss';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingById(id);
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment request?')) return;
    setCancelling(true);
    try {
      const data = await cancelBooking(id);
      setBooking(data);
      setToast({ message: 'Appointment cancelled successfully.', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to cancel appointment.', type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  const handleBookAgain = () => {
    navigate('/bookings/new', {
      state: {
        serviceId: booking.serviceId,
        serviceName: booking.serviceName,
        serviceImageUrl: booking.serviceImageUrl,
      },
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '');

  if (loading) {
    return (
      <div className={styles.page}>
        <CustomerNavbar />
        <main className={styles.main}>
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p>Loading details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.page}>
        <CustomerNavbar />
        <main className={styles.main}>
          <button className={styles.backBtn} onClick={() => navigate('/bookings')}>
            ← Back to Bookings
          </button>
          <div className={styles.errorBox}>{error || 'Booking not found.'}</div>
        </main>
      </div>
    );
  }

  const canCancel = booking.status === 'REQUESTED' || booking.status === 'CONFIRMED';
  const canBookAgain = booking.status === 'COMPLETED' || booking.status === 'CANCELLED' || booking.status === 'REJECTED';

  return (
    <div className={styles.page}>
      <CustomerNavbar />
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <button className={styles.backBtn} onClick={() => navigate('/bookings')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Bookings
          </button>
          <h1 className={styles.pageTitle}>Appointment Details</h1>
        </div>

        <motion.div className={styles.detailCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.statusRow}>
            <span className={`${styles.statusBadge} ${styles['status-' + booking.status.toLowerCase()]}`}>
              {booking.status}
            </span>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionTitle}>Service</p>
            <div className={styles.serviceInfo}>
              <div className={styles.serviceImgWrap}>
                {booking.serviceImageUrl ? (
                  <img src={booking.serviceImageUrl} alt={booking.serviceName} className={styles.serviceImg} />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D8A4A9" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
              </div>
              <h2 className={styles.serviceName}>{booking.serviceName}</h2>
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionTitle}>Customer Details</p>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>{booking.userName || 'Customer'}</span>
            </div>
            {booking.contactNumber && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Contact Number</span>
                <span className={styles.infoValue}>{booking.contactNumber}</span>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <p className={styles.sectionTitle}>When</p>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Date</span>
              <span className={styles.infoValue}>{formatDate(booking.preferredDate)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Preference</span>
              <span className={styles.infoValue}>{capitalize(booking.preferredPeriod)}</span>
            </div>
          </div>

          {booking.specialRequest && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Special Request</p>
              <div className={styles.specialRequest}>
                "{booking.specialRequest}"
              </div>
            </div>
          )}

          <div className={styles.actions}>
            {canCancel && (
              <button 
                className={styles.cancelBtn} 
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Request'}
              </button>
            )}
            
            {canBookAgain && (
              <button className={styles.bookAgainBtn} onClick={handleBookAgain}>
                Book Again
              </button>
            )}
          </div>
        </motion.div>
      </main>
      <div className={styles.bottomPad} />
    </div>
  );
};

export default BookingDetail;

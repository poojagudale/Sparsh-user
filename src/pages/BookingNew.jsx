import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomerNavbar from '../components/CustomerNavbar';
import Toast from '../components/Toast';
import { createBooking } from '../api/bookingApi';
import { getService } from '../services/serviceApi';
import styles from './BookingNew.module.scss';

/**
 * BookingNew — appointment request form.
 *
 * Expects the selected service to be passed via location state:
 *   navigate('/bookings/new', { state: { serviceId, serviceName, serviceImageUrl } })
 *
 * Three steps:
 *   1. Form     → fill in date, period, special request
 *   2. Confirm  → review summary before submitting
 *   3. Success  → booking created
 */
const PERIODS = [
  { key: 'MORNING',   label: 'Morning',   icon: '🌅' },
  { key: 'AFTERNOON', label: 'Afternoon', icon: '☀️' },
  { key: 'EVENING',   label: 'Evening',   icon: '🌙' },
];

const BookingNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceId, serviceName, serviceImageUrl } = location.state || {};

  // If no service was passed, redirect back to services
  useEffect(() => {
    if (!serviceId) {
      navigate('/services_view', { replace: true });
    }
  }, [serviceId, navigate]);

  // Load service details as fallback
  const [serviceData, setServiceData] = useState({
    serviceId,
    serviceName: serviceName || '',
    serviceImageUrl: serviceImageUrl || null,
  });
  const [loadingService, setLoadingService] = useState(!serviceName);

  useEffect(() => {
    if (serviceId && !serviceName) {
      setLoadingService(true);
      getService(serviceId)
        .then((data) => {
          setServiceData({
            serviceId: data.serviceId,
            serviceName: data.serviceName,
            serviceImageUrl: data.imageUrl,
          });
        })
        .catch(() => {})
        .finally(() => setLoadingService(false));
    }
  }, [serviceId, serviceName]);

  // Form state
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredPeriod, setPreferredPeriod] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [errors, setErrors] = useState({});

  // Step: 'form' | 'confirm' | 'success'
  const [step, setStep] = useState('form');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Today's date in YYYY-MM-DD for the min attribute
  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const errs = {};
    if (!preferredDate) errs.preferredDate = 'Please select a preferred date.';
    else if (preferredDate < today) errs.preferredDate = 'Date cannot be in the past.';
    if (!preferredPeriod) errs.preferredPeriod = 'Please select a preferred period.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (validate()) {
      setStep('confirm');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const booking = await createBooking({
        serviceId: serviceData.serviceId,
        preferredDate,
        preferredPeriod,
        specialRequest: specialRequest.trim() || null,
      });
      setCreatedBooking(booking);
      setStep('success');
    } catch (err) {
      setToast({ message: err.message || 'Failed to create booking.', type: 'error' });
      // Go back to form so user can fix issues
      setStep('form');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const periodLabel = PERIODS.find((p) => p.key === preferredPeriod)?.label || preferredPeriod;

  if (!serviceId) return null;

  return (
    <div className={styles.page}>
      <CustomerNavbar />
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <main className={styles.main}>
        {/* ── Page header ───────────────────────────────────── */}
        <div className={styles.pageHeader}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          {step === 'form' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h1 className={styles.pageTitle}>Book Appointment</h1>
              <p className={styles.pageSubtitle}>Fill in your preferences and we'll get back to you.</p>
            </motion.div>
          )}
        </div>

        {/* ── Loading service ───────────────────────────────── */}
        {loadingService && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading service…</p>
          </div>
        )}

        {/* ── STEP 1: Form ─────────────────────────────────── */}
        {!loadingService && step === 'form' && (
          <motion.div
            className={styles.horizontalCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className={styles.leftPane}>
              <h2 className={styles.paneTitle}>Selected Service</h2>
              <div className={styles.serviceDisplay}>
                <div className={styles.serviceImgWrap}>
                  {serviceData.serviceImageUrl ? (
                    <img
                      src={serviceData.serviceImageUrl}
                      alt={serviceData.serviceName}
                      className={styles.serviceImg}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className={styles.servicePlaceholder}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className={styles.serviceInfo}>
                  <p className={styles.serviceLabel}>Service</p>
                  <h3 className={styles.serviceName}>{serviceData.serviceName}</h3>
                </div>
              </div>
            </div>

            <div className={styles.rightPane}>
              <h2 className={styles.paneTitle}>Appointment Details</h2>
              <form onSubmit={handleReview} noValidate>
                {/* Preferred Date */}
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="booking-date">
                    Preferred Date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    className={styles.dateInput}
                    value={preferredDate}
                    min={today}
                    onChange={(e) => { setPreferredDate(e.target.value); setErrors((p) => ({ ...p, preferredDate: '' })); }}
                  />
                  {errors.preferredDate && <p className={styles.fieldError}>{errors.preferredDate}</p>}
                </div>

                {/* Preferred Period */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Preferred Period</label>
                  <div className={styles.periodOptions}>
                    {PERIODS.map(({ key, label, icon }) => (
                      <button
                        key={key}
                        type="button"
                        className={`${styles.periodBtn} ${preferredPeriod === key ? styles.periodActive : ''}`}
                        onClick={() => { setPreferredPeriod(key); setErrors((p) => ({ ...p, preferredPeriod: '' })); }}
                      >
                        <span className={styles.periodIcon}>{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors.preferredPeriod && <p className={styles.fieldError}>{errors.preferredPeriod}</p>}
                </div>

                {/* Special Request */}
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="booking-request">
                    Special Request <span style={{ fontWeight: 400, color: '#9C8285' }}>(optional)</span>
                  </label>
                  <textarea
                    id="booking-request"
                    className={styles.textarea}
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="Tell us anything you'd like us to know…"
                    maxLength={500}
                    rows={3}
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Review Appointment
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Confirmation ─────────────────────────── */}
        {step === 'confirm' && (
          <motion.div
            className={styles.horizontalCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.leftPane}>
              <h2 className={styles.paneTitle}>Appointment Summary</h2>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Service</span>
                <span className={styles.summaryValue}>{serviceData.serviceName}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Preferred Period</span>
                <span className={styles.summaryValue}>{periodLabel}</span>
              </div>
            </div>

            <div className={styles.rightPane}>
              <h2 className={styles.paneTitle}>Selected Details</h2>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Date</span>
                <span className={styles.summaryValue}>{formatDate(preferredDate)}</span>
              </div>
              {specialRequest.trim() && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Special Request</span>
                  <span className={styles.summaryValue}>{specialRequest.trim()}</span>
                </div>
              )}

              <div className={styles.summaryActions}>
                <button
                  className={styles.backButton}
                  onClick={() => setStep('form')}
                  disabled={submitting}
                >
                  Back
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : 'Request Appointment'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Success ──────────────────────────────── */}
        {step === 'success' && createdBooking && (
          <motion.div
            className={styles.successCard}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.successIcon}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 className={styles.successTitle}>Appointment Request Sent!</h2>
            <p className={styles.successText}>
              Your appointment request has been sent to the salon.
              We'll review it and get back to you.
            </p>
            <span className={`${styles.statusBadge} ${styles.statusRequested}`}>
              Status: Requested
            </span>

            <div>
              <button
                className={styles.viewBookingsBtn}
                onClick={() => navigate('/bookings')}
              >
                View My Bookings
              </button>
            </div>
          </motion.div>
        )}
      </main>

      <div className={styles.bottomPad} />
    </div>
  );
};

export default BookingNew;

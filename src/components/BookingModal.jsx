import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBooking } from '../api/bookingApi';
import styles from './BookingModal.module.scss';

const PERIOD_OPTIONS = [
  { key: 'MORNING',   label: 'Morning',   icon: '🌅', time: '9 AM - 12 PM' },
  { key: 'AFTERNOON', label: 'Afternoon', icon: '☀️', time: '12 PM - 4 PM' },
  { key: 'EVENING',   label: 'Evening',   icon: '🌙', time: '4 PM - 8 PM' },
];

const BookingModal = ({ service, isOpen, onClose, onSuccess }) => {
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredPeriod, setPreferredPeriod] = useState('MORNING');
  const [specialRequest, setSpecialRequest] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Today in YYYY-MM-DD for min date attribute
  const today = new Date().toISOString().split('T')[0];

  // Set default preferredDate to tomorrow on open
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setPreferredDate(tomorrow.toISOString().split('T')[0]);
      setPreferredPeriod('MORNING');
      setSpecialRequest('');
      setErrors({});
      setApiError('');
      setSubmitting(false);

      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen || !service) return null;

  const validate = () => {
    const errs = {};
    if (!preferredDate) {
      errs.preferredDate = 'Please select an appointment date.';
    } else if (preferredDate < today) {
      errs.preferredDate = 'Appointment date cannot be in the past.';
    }
    if (!preferredPeriod) {
      errs.preferredPeriod = 'Please select a preferred time of day.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    setApiError('');

    try {
      const payload = {
        serviceId: service.serviceId,
        preferredDate,
        preferredPeriod,
        specialRequest: specialRequest.trim() || null,
      };

      const result = await createBooking(payload);
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err) {
      console.error('Booking submission error:', err);
      setApiError(err.message || 'Failed to submit appointment request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const imageSrc = service.imageUrl
    ? (service.imageUrl.startsWith('http') || service.imageUrl.startsWith('/') ? service.imageUrl : `/${service.imageUrl}`)
    : null;

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}>
        <motion.div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.22 }}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 id="booking-modal-title" className={styles.title}>Book Appointment</h2>
              <p className={styles.subtitle}>Select your preferred appointment date and time</p>
            </div>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              disabled={submitting}
              aria-label="Close dialog"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleConfirm}>
            <div className={styles.content}>

              {/* Service Preview */}
              <div className={styles.servicePreview}>
                <div className={styles.serviceImgWrap}>
                  {imageSrc ? (
                    <img src={imageSrc} alt={service.serviceName} className={styles.serviceImg} />
                  ) : (
                    <span className={styles.placeholderIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className={styles.serviceDetails}>
                  <h3 className={styles.serviceName}>{service.serviceName}</h3>
                  {service.description && (
                    <p className={styles.serviceDesc}>{service.description}</p>
                  )}
                  <div className={styles.serviceMeta}>
                    {service.price != null && (
                      <span className={styles.price}>
                        ₹{Number(service.price).toLocaleString('en-IN')}
                      </span>
                    )}
                    {service.duration && (
                      <span className={styles.duration}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        {service.duration} mins
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* API Error Message */}
              {apiError && (
                <div className={styles.errorBanner} role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{apiError}</span>
                </div>
              )}

              {/* Date Selection */}
              <div className={styles.formGroup}>
                <label htmlFor="preferredDate" className={styles.label}>
                  Preferred Date <span className={styles.required}>*</span>
                </label>
                <input
                  id="preferredDate"
                  type="date"
                  min={today}
                  value={preferredDate}
                  onChange={(e) => {
                    setPreferredDate(e.target.value);
                    if (errors.preferredDate) setErrors((p) => ({ ...p, preferredDate: '' }));
                  }}
                  className={`${styles.input} ${errors.preferredDate ? styles.inputError : ''}`}
                  disabled={submitting}
                />
                {errors.preferredDate && (
                  <span className={styles.errorText}>{errors.preferredDate}</span>
                )}
              </div>

              {/* Period Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Preferred Time Slot <span className={styles.required}>*</span>
                </label>
                <div className={styles.periodGroup} role="radiogroup" aria-label="Preferred time slot">
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.key}
                      className={`${styles.periodBtn} ${preferredPeriod === opt.key ? styles.periodBtnActive : ''}`}
                      onClick={() => setPreferredPeriod(opt.key)}
                      disabled={submitting}
                      role="radio"
                      aria-checked={preferredPeriod === opt.key}
                    >
                      <span className={styles.periodIcon}>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
                {errors.preferredPeriod && (
                  <span className={styles.errorText}>{errors.preferredPeriod}</span>
                )}
              </div>

              {/* Special Request */}
              <div className={styles.formGroup}>
                <label htmlFor="specialRequest" className={styles.label}>
                  Special Requests or Notes <span style={{ fontWeight: 400, color: '#9C8285' }}>(Optional)</span>
                </label>
                <textarea
                  id="specialRequest"
                  rows="3"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="e.g. skin sensitivity, styling preference, or any other notes..."
                  className={styles.textarea}
                  disabled={submitting}
                />
              </div>

              {/* Confirmation Info */}
              <div className={styles.infoNote}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  Your appointment request will be submitted as <strong>Requested</strong>. Our salon team will review and confirm your slot.
                </span>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.confirmBtn}
                disabled={submitting}
              >
                {submitting ? (
                  <span className={styles.btnLoader}>
                    <span className={styles.spinner} />
                    Submitting…
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;

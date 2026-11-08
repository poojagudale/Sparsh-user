import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  updateMyCustomerProfile,
  createMyCustomerProfile,
  getMyCustomerProfile,
} from '../api/CustomerApi';
import CustomerPageContainer from '../components/CustomerPageContainer';
import Toast from '../components/Toast';
import styles from './Profile.module.scss';

// ── Validation ─────────────────────────────────────────────────────
const validate = (form) => {
  const errs = {};
  if (!form.fName.trim()) errs.fName = 'First name is required.';
  if (!form.mobile.trim()) {
    errs.mobile = 'Contact number is required.';
  } else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
    errs.mobile = 'Enter a valid 10-digit mobile number.';
  }
  return errs;
};

const customerToForm = (c) => ({
  fName:     c?.fName    || '',
  lName:     c?.lName    || '',
  email:     c?.email    || '',
  mobile:    c?.mobile   || '',
  dob:       c?.dob      || '',
  doa:       c?.doa      || '',
  isMarried: c?.isMarried ?? 0,
});

const EMPTY_FORM = (email = '') => ({
  fName: '', lName: '', email, mobile: '',
  dob: '', doa: '', isMarried: 0,
});

// ── FieldLabel helper ──────────────────────────────────────────────
const FieldLabel = ({ children, required }) => (
  <div className={styles.labelRow}>
    <span className={styles.label}>
      {children}
      {required && <span className={styles.required}> *</span>}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────
// ProfilePage
// ─────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const navigate  = useNavigate();
  const { user } = useAuth();

  /**
   * profileState values:
   *   'loading'    — fetching from backend
   *   'found'      — customer record exists; display it (view / edit mode)
   *   'not_found'  — no customer record (Case B); display registration prompt + empty form
   *   'error'      — server / network connection error
   */
  const [profileState, setProfileState] = useState('loading');
  const [customer,     setCustomer]     = useState(null);
  const [editMode,     setEditMode]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState(null);
  const [errors,       setErrors]       = useState({});
  const [avatarErr,    setAvatarErr]    = useState(false);

  const buildEmptyForm = useCallback(() => EMPTY_FORM(user?.email || ''), [user?.email]);

  const [form, setForm] = useState(buildEmptyForm);
  const [formSnapshot, setFormSnapshot] = useState(buildEmptyForm);

  // ── Fetch customer profile ───────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!user?.email) {
      setProfileState('error');
      return;
    }

    setProfileState('loading');
    setErrors({});
    try {
      // Use the JWT-protected /me endpoint — email is strictly enforced by backend
      const found = await getMyCustomerProfile();

      if (found && found.custId) {
        // Case A: customer record exists
        localStorage.setItem('customer', JSON.stringify(found));
        setCustomer(found);
        const f = customerToForm(found);
        setForm(f);
        setFormSnapshot(f);
        setProfileState('found');
        setEditMode(false);
      } else {
        // Case B: no customer record in database for this authenticated user
        localStorage.removeItem('customer');
        setCustomer(null);
        const emptyF = buildEmptyForm();
        setForm(emptyF);
        setFormSnapshot(emptyF);
        setProfileState('not_found');
        setEditMode(true); // Form is editable for registration
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setProfileState('error');
    }
  }, [user?.email, buildEmptyForm]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const showToast = (msg, type = 'info') => setToast({ message: msg, type });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleEdit = () => {
    setFormSnapshot(form);
    setErrors({});
    setEditMode(true);
  };

  const handleCancel = () => {
    setForm(formSnapshot);
    setErrors({});
    if (profileState === 'found') {
      setEditMode(false);
    } else {
      // If cancelling during initial registration, navigate to Home
      navigate('/home');
    }
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        fName:      form.fName.trim(),
        lName:      form.lName.trim(),
        // email is always verified and enforced by backend from JWT
        email:      user?.email || form.email.trim(),
        mobile:     form.mobile.trim(),
        dob:        form.dob  || null,
        doa:        Number(form.isMarried) === 1 ? (form.doa || null) : null,
        isMarried:  Number(form.isMarried),
        smsEnabled: 1,
        isEnabled:  1,
      };

      let result;
      if (customer?.custId) {
        // Existing customer — update via JWT-protected endpoint
        result = await updateMyCustomerProfile(customer.custId, payload);
      } else {
        // New registration — create via JWT-protected endpoint
        result = await createMyCustomerProfile(payload);
      }

      if (!result || result.error) throw new Error(result?.error || 'Unexpected server response.');

      localStorage.setItem('customer', JSON.stringify(result));
      setCustomer(result);
      const updated = customerToForm(result);
      setForm(updated);
      setFormSnapshot(updated);
      setEditMode(false);
      setProfileState('found');
      showToast(
        customer?.custId
          ? 'Profile updated successfully!'
          : 'Welcome to Sparsh! Your profile has been created.',
        'success'
      );
    } catch (err) {
      console.error('Profile save error:', err);
      showToast(
        err?.message?.toLowerCase().includes('fetch')
          ? 'Unable to reach the server. Please check your connection.'
          : err?.message || 'Something went wrong. Please try again.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Read-only field for "found" view mode ─────────────────────────
  const ReadField = ({ value, placeholder = '—' }) => (
    <input
      type="text"
      readOnly
      tabIndex={-1}
      value={value || ''}
      placeholder={placeholder}
      className={styles.inputReadOnly}
      aria-readonly="true"
    />
  );

  return (
    <CustomerPageContainer>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className={styles.container}>

        {/* ══ Page Header — always visible and aligned across all states ══ */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Sparsh Profile</h1>
          <p className={styles.pageSubtitle}>
            {profileState === 'not_found'
              ? 'Complete your profile to personalise your Sparsh experience.'
              : 'Manage your personal information.'}
          </p>
        </div>

        {/* ══ STATE 1: Loading ══════════════════════════════════════ */}
        {profileState === 'loading' && (
          <div className={styles.loadingCard}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Loading your profile…</p>
          </div>
        )}

        {/* ══ STATE 2: Network / Server Error ═══════════════════════ */}
        {profileState === 'error' && (
          <motion.div
            className={styles.errorCard}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className={styles.errorIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className={styles.errorTitle}>Unable to Load Profile</h2>
            <p className={styles.errorText}>
              There was a problem connecting to the server. Please check your connection and try again.
            </p>
            <div className={styles.errorActions}>
              <button className={styles.primaryBtn} onClick={fetchProfile}>
                Try Again
              </button>
              <button className={styles.cancelBtn} onClick={() => navigate('/home')}>
                Go Home
              </button>
            </div>
          </motion.div>
        )}

        {/* ══ STATE 3: Not Found Banner (Case B — 404) ═════════════ */}
        {profileState === 'not_found' && (
          <motion.div
            className={styles.notFoundBanner}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.bannerIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className={styles.bannerContent}>
              <h3 className={styles.bannerTitle}>Customer profile not found. Please register to create your profile.</h3>
              <p className={styles.bannerText}>
                No profile exists for <strong>{user?.email}</strong>. Fill in your details below and click Register Now to get started.
              </p>
            </div>
          </motion.div>
        )}

        {/* ══ STATE 3 & 4: Form & Profile Card (found or registering) ══ */}
        {(profileState === 'found' || profileState === 'not_found') && (
          <motion.div
            className={styles.profileCard}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Identity Card Header */}
            {(() => {
              const customerName = customer
                ? (`${customer.fName || ''} ${customer.lName || ''}`).trim() || user?.fullName || 'Sparsh Customer'
                : user?.fullName || 'New Customer';

              const avatarInitials = customerName
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'U';

              const hasProfilePic = Boolean(user?.profilePicture && !avatarErr);

              return (
                <div className={styles.cardHeader}>
                  <div className={styles.avatarLarge}>
                    {hasProfilePic ? (
                      <img
                        src={user.profilePicture}
                        alt={customerName}
                        className={styles.avatarLargeImg}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarErr(true)}
                      />
                    ) : avatarInitials && avatarInitials !== 'U' ? (
                      <span className={styles.avatarLargeInitials}>{avatarInitials}</span>
                    ) : (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    )}
                  </div>
                  <div className={styles.cardHeaderInfo}>
                    <h2 className={styles.customerName}>
                      {customerName}
                    </h2>
                    {customer?.mobile ? (
                      <p className={styles.customerMobile}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                          style={{ marginRight: 5, flexShrink: 0 }}>
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {customer.mobile}
                      </p>
                    ) : (
                      <p className={styles.customerMobile}>{user?.email}</p>
                    )}
                  </div>

                  {/* Edit Profile Button — view mode only for existing customer */}
                  {!editMode && customer?.custId && (
                    <button className={styles.editBtn} onClick={handleEdit}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit Profile
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Field Sections */}
            <div className={styles.fieldSections}>

              {/* SECTION: Personal Information */}
              <div className={styles.sectionGroup}>
                <h3 className={styles.sectionTitle}>Personal Information</h3>
                <div className={styles.fieldsGridThreeCol}>

                  {/* First Name */}
                  <div className={styles.fieldGroup}>
                    <FieldLabel required>First Name</FieldLabel>
                    {editMode ? (
                      <>
                        <input
                          id="fName"
                          name="fName"
                          value={form.fName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          className={`${styles.input} ${errors.fName ? styles.inputError : ''}`}
                        />
                        {errors.fName && <span className={styles.errorMsg}>{errors.fName}</span>}
                      </>
                    ) : (
                      <ReadField value={customer?.fName} />
                    )}
                  </div>

                  {/* Last Name */}
                  <div className={styles.fieldGroup}>
                    <FieldLabel>Last Name</FieldLabel>
                    {editMode ? (
                      <input
                        id="lName"
                        name="lName"
                        value={form.lName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className={styles.input}
                      />
                    ) : (
                      <ReadField value={customer?.lName} />
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className={styles.fieldGroup}>
                    <FieldLabel>Date of Birth</FieldLabel>
                    {editMode ? (
                      <input
                        id="dob"
                        name="dob"
                        type="date"
                        value={form.dob || ''}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    ) : (
                      <ReadField value={customer?.dob} />
                    )}
                  </div>

                </div>
              </div>

              {/* SECTION: Contact Information */}
              <div className={styles.sectionGroup}>
                <h3 className={styles.sectionTitle}>Contact Information</h3>
                <div className={styles.fieldsGridTwoCol}>

                  {/* Contact Number */}
                  <div className={styles.fieldGroup}>
                    <FieldLabel required>Contact Number</FieldLabel>
                    {editMode ? (
                      <>
                        <input
                          id="mobile"
                          name="mobile"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={form.mobile}
                          onChange={(e) =>
                            handleChange({ target: { name: 'mobile', value: e.target.value.replace(/\D/g, '') } })
                          }
                          placeholder="10-digit mobile number"
                          className={`${styles.input} ${errors.mobile ? styles.inputError : ''}`}
                        />
                        {errors.mobile && <span className={styles.errorMsg}>{errors.mobile}</span>}
                        {customer?.custId && (
                          <span className={styles.fieldNote}>Used to identify your salon appointments.</span>
                        )}
                      </>
                    ) : (
                      <ReadField value={customer?.mobile} />
                    )}
                  </div>

                  {/* Email — always read-only, linked to authenticated account */}
                  <div className={styles.fieldGroup}>
                    <FieldLabel>Email Address</FieldLabel>
                    <ReadField value={customer?.email || user?.email} />
                    {editMode && (
                      <span className={styles.fieldNote}>Linked to your authenticated login account.</span>
                    )}
                  </div>

                </div>
              </div>

              {/* SECTION: Relationship Status */}
              <div className={styles.sectionGroup}>
                <h3 className={styles.sectionTitle}>Relationship Status</h3>
                <div className={styles.fieldsGridTwoCol}>

                  {/* Marital Status */}
                  <div className={styles.fieldGroup}>
                    <FieldLabel>Marital Status</FieldLabel>
                    {editMode ? (
                      <div className={styles.pillGroup} role="group" aria-label="Marital status">
                        <button
                          type="button"
                          className={`${styles.pillBtn} ${Number(form.isMarried) === 0 ? styles.pillBtnActive : ''}`}
                          onClick={() => setForm((p) => ({ ...p, isMarried: 0, doa: '' }))}
                        >
                          Single
                        </button>
                        <button
                          type="button"
                          className={`${styles.pillBtn} ${Number(form.isMarried) === 1 ? styles.pillBtnActive : ''}`}
                          onClick={() => setForm((p) => ({ ...p, isMarried: 1 }))}
                        >
                          Married
                        </button>
                      </div>
                    ) : (
                      <ReadField
                        value={customer?.isMarried === 1 ? 'Married' : customer?.isMarried === 0 ? 'Single' : ''}
                      />
                    )}
                  </div>

                  {/* Anniversary Date */}
                  {editMode && Number(form.isMarried) === 1 && (
                    <div className={styles.fieldGroup}>
                      <FieldLabel>Anniversary Date</FieldLabel>
                      <input
                        id="doa"
                        name="doa"
                        type="date"
                        value={form.doa || ''}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    </div>
                  )}
                  {!editMode && customer?.isMarried === 1 && (
                    <div className={styles.fieldGroup}>
                      <FieldLabel>Anniversary Date</FieldLabel>
                      <ReadField value={customer?.doa} />
                    </div>
                  )}

                </div>
              </div>

            </div>{/* /fieldSections */}

            {/* Action buttons (in edit or registration mode) */}
            <AnimatePresence>
              {editMode && (
                <motion.div
                  className={styles.actionRow}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
                >
                  <button className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
                    {customer?.custId ? 'Cancel' : 'Go Home'}
                  </button>
                  <button
                    id="register-now-btn"
                    className={styles.primaryBtn}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <span className={styles.btnLoader}>
                        <span className={styles.spinner} />
                        {customer?.custId ? 'Saving…' : 'Registering…'}
                      </span>
                    ) : customer?.custId ? 'Save Changes' : 'Register Now'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </div>
    </CustomerPageContainer>
  );
};

export default ProfilePage;

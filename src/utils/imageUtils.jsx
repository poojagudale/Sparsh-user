import React from 'react';

/**
 * Normalizes an image path from the backend so it properly loads via Vite / web server.
 * E.g., 'uploads/services/xyz.jpg' -> '/uploads/services/xyz.jpg'
 */
export function getServiceImageUrl(path) {
  if (!path || typeof path !== 'string') return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}`;
}

/**
 * Returns a human-friendly category label based on service name keywords.
 */
export function getServiceCategory(serviceName = '') {
  const n = String(serviceName).toLowerCase();
  if (n.includes('hair') || n.includes('cut') || n.includes('colour') || n.includes('color') || n.includes('keratin')) {
    return 'Hair Care';
  }
  if (n.includes('skin') || n.includes('facial') || n.includes('face') || n.includes('glow') || n.includes('peel')) {
    return 'Skin & Facial';
  }
  if (n.includes('nail') || n.includes('manicure') || n.includes('pedicure')) {
    return 'Nail Care';
  }
  if (n.includes('makeup') || n.includes('bridal') || n.includes('party')) {
    return 'Makeup & Styling';
  }
  if (n.includes('spa') || n.includes('massage') || n.includes('relax') || n.includes('body')) {
    return 'Spa & Wellness';
  }
  return 'Salon Service';
}

/**
 * Returns a graceful SVG icon for fallback service images.
 */
export function getCategoryIcon(serviceName = '', size = 24) {
  const n = String(serviceName).toLowerCase();
  
  if (n.includes('hair') || n.includes('cut') || n.includes('colour') || n.includes('color') || n.includes('keratin')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    );
  }
  if (n.includes('skin') || n.includes('facial') || n.includes('face') || n.includes('glow') || n.includes('peel')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    );
  }
  if (n.includes('nail') || n.includes('manicure') || n.includes('pedicure')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="2" width="10" height="14" rx="3" />
        <path d="M7 14c0 3.31 2.24 6 5 6s5-2.69 5-6" />
      </svg>
    );
  }
  if (n.includes('makeup') || n.includes('bridal') || n.includes('party')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  if (n.includes('spa') || n.includes('massage') || n.includes('relax') || n.includes('body')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c4-4 8-8 8-12a8 8 0 1 0-16 0c0 4 4 8 8 12z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }
  // Default salon sparkle icon
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </svg>
  );
}

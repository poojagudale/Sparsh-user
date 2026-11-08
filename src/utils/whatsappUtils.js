/**
 * whatsappUtils.js
 *
 * Client-side utilities for WhatsApp URL generation, phone validation,
 * and clipboard copying. Isolates messaging link logic so future API changes
 * or WhatsApp Cloud API integrations require zero refactoring in page components.
 */

/**
 * Strips all non-digit characters and extracts clean 10-digit Indian mobile.
 * Handles numbers with +91, 91, or leading 0.
 * Returns null if invalid.
 */
export function cleanIndianMobile(rawMobile) {
  if (!rawMobile || typeof rawMobile !== 'string') return null;
  let digits = rawMobile.replace(/\D/g, '');

  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  // Must be 10 digits starting with 6, 7, 8, or 9
  if (/^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }
  return null;
}

/**
 * Validates whether a given mobile number is valid.
 */
export function isValidIndianMobile(rawMobile) {
  return cleanIndianMobile(rawMobile) !== null;
}

/**
 * Pretty-prints a mobile number for display: "+91 99642 10706"
 */
export function formatPhoneDisplay(rawMobile) {
  const clean = cleanIndianMobile(rawMobile);
  if (!clean) return rawMobile || '—';
  return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
}

/**
 * Builds the standard WhatsApp URL.
 * Format: https://api.whatsapp.com/send?phone=91XXXXXXXXXX&text=...
 */
export function buildWhatsAppLink(rawMobile, message = '') {
  const clean = cleanIndianMobile(rawMobile);
  if (!clean) return null;

  const phone = `91${clean}`;
  const encoded = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`;
}

/**
 * Safely opens WhatsApp in a new tab without window opener vulnerabilities.
 * Returns true if opened, false if number was invalid.
 */
export function openWhatsApp(rawMobile, message = '') {
  const url = buildWhatsAppLink(rawMobile, message);
  if (!url) return false;

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * Copy text to clipboard safely.
 */
export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for non-secure contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

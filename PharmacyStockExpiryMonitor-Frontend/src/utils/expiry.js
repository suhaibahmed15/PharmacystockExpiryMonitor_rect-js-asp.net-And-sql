// Expiry calculations and color coding helper

export function getDaysToExpiry(expiryDate) {
  if (!expiryDate) return null;
  const now = new Date();
  const exp = new Date(expiryDate);
  if (isNaN(exp.getTime())) return null;
  
  // Set both to midnight UTC for clean calendar day difference
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utcExp = Date.UTC(exp.getFullYear(), exp.getMonth(), exp.getDate());
  
  return Math.ceil((utcExp - utcNow) / (1000 * 60 * 60 * 24));
}

/**
 * Returns expiry status, label, color classification (red/amber/green), and badge variant
 * @param {string|Date} expiryDate
 */
export function getExpiryStatus(expiryDate) {
  const days = getDaysToExpiry(expiryDate);
  if (days === null) {
    return {
      status: "unknown",
      label: "Unknown",
      color: "#6b7280",
      variant: "neutral",
      days: null
    };
  }

  if (days <= 0) {
    return {
      status: "expired",
      label: days === 0 ? "Expires Today" : `Expired (${Math.abs(days)}d ago)`,
      color: "#dc2626", // Red
      variant: "danger",
      days
    };
  }

  if (days <= 90) {
    return {
      status: "near-expiry",
      label: `Expiring Soon (${days}d left)`,
      color: "#d97706", // Amber
      variant: "warning",
      days
    };
  }

  return {
    status: "safe",
    label: `Safe (${days}d left)`,
    color: "#16a34a", // Green
    variant: "success",
    days
  };
}

// Date and currency formatters

export function formatDate(dateString, options = {}) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options
    });
  } catch {
    return "-";
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "-";
  }
}

export function formatCurrency(amount, currency = "PKR") {
  const numeric = Number(amount);
  if (isNaN(numeric)) return `${currency} 0.00`;
  return `${currency} ${numeric.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatNumber(value) {
  const numeric = Number(value);
  if (isNaN(numeric)) return "0";
  return numeric.toLocaleString();
}

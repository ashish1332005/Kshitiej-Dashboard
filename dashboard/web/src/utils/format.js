export function formatNumber(value, suffix = '', decimals = 1) {
  if (!Number.isFinite(value)) {
    return 'No data';
  }
  return `${value.toFixed(decimals)}${suffix}`;
}

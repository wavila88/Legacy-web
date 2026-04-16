/** Returns tomorrow's date as YYYY-MM-DD (minimum allowed delivery date) */
export const minDeliveryDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

/** Returns one year from today as YYYY-MM-DD (default delivery date) */
export const defaultDeliveryDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

/** Formats an ISO date string to long Spanish locale string */
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

/** Formats seconds to MM:SS */
export const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

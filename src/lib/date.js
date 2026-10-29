// Release dates are stored as 'YYYY', 'YYYY-MM' or 'YYYY-MM-DD' — the
// precision that is actually known. Render whichever we have, in the
// current language, so the site stops mixing "MAY 2026" with "30 MAY 2026"
// with "2024" by accident.
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export function formatDate(date, lang = 'en') {
  if (!date) return null;
  const [y, m, d] = String(date).split('-').map(Number);
  if (lang === 'zh') {
    if (!m) return `${y}年`;
    if (!d) return `${y}年${m}月`;
    return `${y}年${m}月${d}日`;
  }
  if (!m) return String(y);
  if (!d) return `${MONTHS[m - 1]} ${y}`;
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`;
}

// ISO-8601 for schema.org (whatever precision we have is valid there).
export const isoDate = date => (date ? String(date) : undefined);

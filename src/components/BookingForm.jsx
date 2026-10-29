import { useState, useRef, useEffect } from 'react';
import { useLang } from '../hooks/useLang';
import { copyText } from '../lib/copyText';
import { press } from '../data/siteData';
import styles from './BookingForm.module.css';

// No backend. By default the form builds a structured mailto: and opens it,
// and offers COPY MESSAGE for people without a configured mail client. If
// VITE_FORM_ENDPOINT is set at build time it POSTs JSON there instead
// (Formspree-style). See README, "Forms & newsletter".
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || '';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// zh: draft, needs native check
const TYPES = [
  { id: 'booking', tag: 'BOOKING', en: 'Booking', zh: '演出邀約' },
  { id: 'remix',   tag: 'REMIX',   en: 'Remix request', zh: '混音邀請' },
  { id: 'press',   tag: 'PRESS',   en: 'Press', zh: '媒體' },
  { id: 'other',   tag: 'OTHER',   en: 'Other', zh: '其他' },
];

const EMPTY = { type: 'booking', name: '', email: '', message: '', date: '', venue: '', city: '', website: '' };

function build(v) {
  const type = TYPES.find(x => x.id === v.type) ?? TYPES[3];
  const booking = v.type === 'booking';
  const where = booking ? [v.city.trim(), v.date].filter(Boolean).join(' ') : '';
  const name = v.name.trim() || 'unnamed';
  const subject = `[${type.tag}] ${name}${where ? ` — ${where}` : ''}`;
  const lines = [
    `Type: ${type.en}`,
    `Name: ${v.name.trim()}`,
    `Email: ${v.email.trim()}`,
  ];
  if (booking) {
    if (v.date) lines.push(`Date: ${v.date}`);
    if (v.venue.trim()) lines.push(`Venue: ${v.venue.trim()}`);
    if (v.city.trim()) lines.push(`City: ${v.city.trim()}`);
  }
  lines.push('', v.message.trim());
  return { subject, body: lines.join('\n'), type: type.id, booking };
}

export default function BookingForm() {
  const { t } = useLang();
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  // idle | sending | sent | error | opened (mailto handed off)
  const [status, setStatus] = useState('idle');
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const set = key => e => setV(prev => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!v.name.trim()) next.name = t('Required', '必填');
    if (!v.email.trim()) next.email = t('Required', '必填');
    else if (!EMAIL_RE.test(v.email.trim())) next.email = t('Check the address', '請檢查電子郵件');
    if (!v.message.trim()) next.message = t('Required', '必填');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async e => {
    e.preventDefault();
    // Honeypot: a human never sees this field. Pretend it worked.
    if (v.website) { setStatus('sent'); return; }
    if (!validate()) return;
    const { subject, body, type, booking } = build(v);

    if (ENDPOINT) {
      setStatus('sending');
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            _subject: subject,
            type,
            name: v.name.trim(),
            email: v.email.trim(),
            message: v.message.trim(),
            ...(booking ? { date: v.date, venue: v.venue.trim(), city: v.city.trim() } : {}),
          }),
        });
        if (!res.ok) throw new Error(String(res.status));
        setStatus('sent');
        setV(EMPTY);
      } catch {
        setStatus('error');
      }
      return;
    }

    window.location.href =
      `mailto:${press.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g, '\r\n'))}`;
    setStatus('opened');
  };

  const onCopy = async () => {
    const { subject, body } = build(v);
    const ok = await copyText(`To: ${press.email}\nSubject: ${subject}\n\n${body}`);
    if (!ok) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  const field = (key, label, props = {}) => (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={`bf-${key}`}>{label}</label>
      <input
        id={`bf-${key}`}
        className={styles.input}
        value={v[key]}
        onChange={set(key)}
        aria-invalid={errors[key] ? 'true' : undefined}
        aria-describedby={errors[key] ? `bf-${key}-err` : undefined}
        {...props}
      />
      {errors[key] && <span id={`bf-${key}-err`} className={styles.error}>{errors[key]}</span>}
    </div>
  );

  if (status === 'sent') {
    return (
      <div className={styles.done} role="status">
        <span className={styles.doneTag}>{t('TRANSMISSION RECEIVED', '傳輸已收到')}</span>
        <p>{t('Thanks. A reply will come from skixO directly.', '謝謝。skixO 會親自回覆。')}</p>
        <button type="button" className={styles.ghost} onClick={() => { setStatus('idle'); setV(EMPTY); }}>
          {t('SEND ANOTHER', '再傳一則')}
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.header}>
        <span className={styles.headerLabel}>{t('INBOUND', '來訊')}</span>
        <span className={styles.headerId}>FILE // PRESS // IN</span>
      </div>

      <div className={styles.body}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="bf-type">{t('TYPE', '類型')}</label>
          <select id="bf-type" className={styles.input} value={v.type} onChange={set('type')}>
            {TYPES.map(x => <option key={x.id} value={x.id}>{t(x.en, x.zh)}</option>)}
          </select>
        </div>

        <div className={styles.row}>
          {field('name', t('NAME', '姓名'), { autoComplete: 'name', required: true })}
          {field('email', t('EMAIL', '電子郵件'), { type: 'email', autoComplete: 'email', required: true })}
        </div>

        {v.type === 'booking' && (
          <div className={styles.row3}>
            {field('date', t('DATE (OPTIONAL)', '日期（選填）'), { type: 'date' })}
            {field('venue', t('VENUE (OPTIONAL)', '場地（選填）'), { autoComplete: 'off' })}
            {field('city', t('CITY (OPTIONAL)', '城市（選填）'), { autoComplete: 'off' })}
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="bf-message">{t('MESSAGE', '訊息')}</label>
          <textarea
            id="bf-message"
            className={`${styles.input} ${styles.textarea}`}
            rows={6}
            value={v.message}
            onChange={set('message')}
            required
            aria-invalid={errors.message ? 'true' : undefined}
            aria-describedby={errors.message ? 'bf-message-err' : undefined}
          />
          {errors.message && <span id="bf-message-err" className={styles.error}>{errors.message}</span>}
        </div>

        {/* Honeypot */}
        <div className={styles.trap} aria-hidden="true">
          <label htmlFor="bf-website">Website</label>
          <input id="bf-website" name="website" tabIndex={-1} autoComplete="off" value={v.website} onChange={set('website')} />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.primary} disabled={status === 'sending'}>
            {status === 'sending'
              ? t('SENDING…', '傳送中…')
              : ENDPOINT ? t('SEND TRANSMISSION', '傳送') : t('OPEN IN MAIL APP', '用郵件程式開啟')}
          </button>
          <button type="button" className={styles.ghost} onClick={onCopy}>
            {copied ? t('COPIED', '已複製') : t('COPY MESSAGE', '複製訊息')}
          </button>
        </div>

        <div className={styles.status} role="status" aria-live="polite">
          {status === 'opened' && (
            <span>
              {t(
                `Your mail app should open. If it did not, copy the message and send it to ${press.email}.`,
                `郵件程式應已開啟。若沒有，請複製訊息並寄至 ${press.email}。`
              )}
            </span>
          )}
          {status === 'error' && (
            <span className={styles.statusError}>
              {t(
                `Could not send. Copy the message and email ${press.email} instead.`,
                `傳送失敗。請複製訊息並寄至 ${press.email}。`
              )}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}

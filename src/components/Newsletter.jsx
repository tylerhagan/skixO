import { useState } from 'react';
import { useLang } from '../hooks/useLang';
import { press } from '../data/siteData';
import styles from './Newsletter.module.css';

// Email capture. With VITE_NEWSLETTER_ENDPOINT set at build time it POSTs
// { email } as JSON there; otherwise it opens a mailto: to the press
// address with the subject SUBSCRIBE. See README, "Forms & newsletter".
// Drop-in: <Newsletter /> works anywhere inside LangProvider.
const ENDPOINT = import.meta.env.VITE_NEWSLETTER_ENDPOINT || '';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Newsletter({ className = '' }) {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  // idle | invalid | sending | sent | error | opened
  const [status, setStatus] = useState('idle');

  const onSubmit = async e => {
    e.preventDefault();
    if (trap) { setStatus('sent'); return; }
    const value = email.trim();
    if (!EMAIL_RE.test(value)) { setStatus('invalid'); return; }

    if (ENDPOINT) {
      setStatus('sending');
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email: value }),
        });
        if (!res.ok) throw new Error(String(res.status));
        setStatus('sent');
        setEmail('');
      } catch {
        setStatus('error');
      }
      return;
    }

    const body = `Please add me to the list: ${value}`;
    window.location.href =
      `mailto:${press.email}?subject=${encodeURIComponent('SUBSCRIBE')}&body=${encodeURIComponent(body)}`;
    setStatus('opened');
  };

  return (
    <form className={`${styles.wrap} ${className}`} onSubmit={onSubmit} noValidate>
      <h3 className={styles.title}>{t('GET THE NEXT TRANSMISSION', '接收下一次傳輸')}</h3>
      <p className={styles.sub}>
        {t('New releases and remixes, nothing else.', '只有新作品與混音，沒有別的。')}
      </p>

      <div className={styles.row}>
        <label className={styles.srOnly} htmlFor="nl-email">{t('Email address', '電子郵件')}</label>
        <input
          id="nl-email"
          className={styles.input}
          type="email"
          autoComplete="email"
          placeholder={t('you@domain.com', 'you@domain.com')}
          value={email}
          onChange={e => { setEmail(e.target.value); if (status === 'invalid') setStatus('idle'); }}
          aria-invalid={status === 'invalid' ? 'true' : undefined}
          aria-describedby="nl-status"
        />
        <div className={styles.trap} aria-hidden="true">
          <label htmlFor="nl-website">Website</label>
          <input id="nl-website" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} />
        </div>
        <button type="submit" className={styles.btn} disabled={status === 'sending'}>
          {status === 'sending' ? t('SENDING…', '傳送中…') : t('SUBSCRIBE', '訂閱')}
        </button>
      </div>

      <div id="nl-status" className={styles.status} role="status" aria-live="polite">
        {status === 'invalid' && t('Check the address.', '請檢查電子郵件。')}
        {status === 'sent' && t('Signal locked. You are on the list.', '訊號鎖定。你已在名單上。')}
        {status === 'error' && t(`Could not subscribe. Email ${press.email} with the subject SUBSCRIBE.`, `訂閱失敗。請以「SUBSCRIBE」為主旨寄信至 ${press.email}。`)}
        {status === 'opened' && t('Your mail app should open. Send the message to finish.', '郵件程式應已開啟。送出郵件即完成訂閱。')}
      </div>
    </form>
  );
}

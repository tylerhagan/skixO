import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navLinks } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import { useScrollSpy } from '../hooks/useScrollSpy';
import styles from './Nav.module.css';

const sectionIds = ['prove', 'artist', 'signal', 'dossier', 'catalogue', 'tune-in'];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, toggle } = useLang();
  const active = useScrollSpy(sectionIds);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <button
          className={styles.logo}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          sk<span className={styles.logoI}>i</span>x<span className={styles.logoO}>O</span>
        </button>

        <ul className={styles.links}>
          {navLinks.map(({ label, href }) => {
            const id = href.replace('#', '');
            return (
              <li key={href}>
                <button
                  className={`${styles.link} ${active === id ? styles.linkActive : ''}`}
                  onClick={() => handleNavClick(href)}
                >
                  {label}
                  {active === id && (
                    <motion.span
                      className={styles.linkUnderline}
                      layoutId="nav-underline"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className={styles.controls}>
          <button className={styles.langToggle} onClick={toggle} aria-label="Toggle language">
            <span className={lang === 'en' ? styles.langActive : ''}>EN</span>
            <span className={styles.langSep}>/</span>
            <span className={lang === 'zh' ? styles.langActive : ''}>中文</span>
          </button>

          <button
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.645, 0.045, 0.355, 1] }}
          >
            <div className={styles.mobileMenuInner}>
              {navLinks.map(({ label, href }, i) => (
                <motion.button
                  key={href}
                  className={styles.mobileLink}
                  onClick={() => handleNavClick(href)}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 + 0.1 }}
                >
                  <span className={styles.mobileLinkNum}>0{i + 1}</span>
                  {label}
                </motion.button>
              ))}
              <motion.button
                className={styles.mobileLang}
                onClick={toggle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {lang === 'en' ? '切换到中文' : 'Switch to English'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

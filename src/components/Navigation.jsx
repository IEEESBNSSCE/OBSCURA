import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { decrypt } from '../constants';
import obscuraLogo from '../assets/logo.png';

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleToggleMenu = (forceState) => {
    const nextState = typeof forceState === 'boolean' ? forceState : !menuOpen;
    setMenuOpen(nextState);
    const mn = menuRef.current;
    if (!mn) return;

    if (nextState) {
      mn.style.visibility = 'visible';
    }

    anime({
      targets: mn,
      clipPath: nextState ? 'circle(150% at 100% 0)' : 'circle(0% at 100% 0)',
      duration: 700,
      easing: 'easeInOutQuart',
      complete: () => {
        if (!nextState && mn) {
          mn.style.visibility = 'hidden';
        }
      }
    });

    if (nextState) {
      anime({
        targets: '#ml a span',
        translateY: ['100%', 0],
        delay: anime.stagger(60, { start: 300 }),
        duration: 600,
        easing: 'easeOutExpo'
      });
    }
  };

  const handleMouseEnter = (e) => {
    const span = e.currentTarget.querySelector('span');
    if (!span) return;
    const original = span.dataset.original || span.textContent;
    span.dataset.original = original;
    let n = 0;
    const iv = setInterval(() => {
      span.textContent = decrypt(original, n / 10);
      if (++n > 10) {
        clearInterval(iv);
        span.textContent = original;
      }
    }, 35);
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        handleToggleMenu(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header>
        <a href="#" className="nav-logo-link" aria-label="OBSCURA">
          <img src={obscuraLogo} alt="OBSCURA" className="nav-logo-img" />
        </a>
        <span>
          <button id="mb" aria-expanded={menuOpen} aria-controls="menu" onClick={() => handleToggleMenu()}>
            {menuOpen ? '[ CLOSE × ]' : '[ MENU + ]'}
          </button>
        </span>
      </header>

      <nav id="menu" ref={menuRef} aria-label="Main">
        <div id="ml">
          {[
            ['The Mission', 'about'],
            ['About Us', 'aboutus'],
            ['Challenges', 'ch'],
            ['Protocol', 'protocol'],
            ['Timeline', 'tl'],
            ['Prizes', 'prizes'],
            ['Sponsor', 'sponsor'],
            ['FAQ', 'faq'],
            ['Register', 'reg']
          ].map(([title, hash]) => (
            <a
              key={hash}
              href={`#${hash}`}
              onClick={() => handleToggleMenu(false)}
              onMouseEnter={handleMouseEnter}
            >
              <span>{title}</span>
            </a>
          ))}
        </div>
        <div className="mo">
          <i style={{ color: 'var(--n)' }}>●</i> SYSTEM ONLINE &nbsp; 10.2339°N 76.3900°E &nbsp; ESC TO CLOSE
        </div>
      </nav>
    </>
  );
}


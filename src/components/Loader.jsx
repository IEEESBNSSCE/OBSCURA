import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { sc } from '../constants';

export default function Loader({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const ldRef = useRef(null);
  const logRef = useRef(null);
  const barRef = useRef(null);
  const percentRef = useRef(null);

  useEffect(() => {
    const RM = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    let done = false;
    const endLoad = () => {
      if (done) return;
      done = true;
      if (ldRef.current) {
        anime({
          targets: ldRef.current,
          opacity: 0,
          duration: 500,
          easing: 'linear',
          complete: () => {
            setVisible(false);
            if (onComplete) onComplete();
          }
        });
      } else {
        setVisible(false);
        if (onComplete) onComplete();
      }
    };

    if (RM) {
      setVisible(false);
      if (onComplete) onComplete();
      done = true;
    } else {
      const L = [
        'INITIALIZING OBSCURA PROTOCOL...',
        'ESTABLISHING SECURE CONNECTION...',
        'SCANNING ENCRYPTED NETWORK...',
        'IDENTIFYING OPERATIVE...',
        'ACCESS LEVEL: UNKNOWN',
        'CONNECTION ESTABLISHED.'
      ];
      let i = 0;
      let nextTimeout;
      const nx = () => {
        if (done || i >= L.length) return;
        if (logRef.current) {
          logRef.current.insertAdjacentHTML(
            'beforeend',
            `<div>&gt; ${L[i]} <span class="mo">0x${sc(6)}</span></div>`
          );
        }
        i++;
        if (barRef.current) {
          barRef.current.style.width = (i / L.length) * 100 + '%';
        }
        if (percentRef.current) {
          percentRef.current.textContent = Math.round((i / L.length) * 100) + '%';
        }
        if (i === L.length) {
          nextTimeout = setTimeout(endLoad, 500);
        } else {
          nextTimeout = setTimeout(nx, 380);
        }
      };
      nx();

      const flickerInterval = setInterval(() => {
        if (!done && ldRef.current) {
          ldRef.current.style.opacity = Math.random() > 0.9 ? '0.8' : '1';
        }
      }, 120);

      const skipBtn = document.getElementById('sk');
      if (skipBtn) skipBtn.onclick = endLoad;

      return () => {
        clearTimeout(nextTimeout);
        clearInterval(flickerInterval);
      };
    }
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div id="ld" role="status" ref={ldRef}>
      <div id="lg" ref={logRef}></div>
      <div className="pb">
        <i ref={barRef}></i>
      </div>
      <div className="mo" id="lp" ref={percentRef}>
        0%
      </div>
      <button id="sk">SKIP</button>
    </div>
  );
}


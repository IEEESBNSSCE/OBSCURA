import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import anime from 'animejs';
import { CONFIG, TI, SPONSOR_DELIVERABLES, sc, decrypt } from './constants';
import { beep } from './utils/audio';
import Navigation from './components/Navigation';
import Loader from './components/Loader';
import Telemetry from './components/Telemetry';
import Countdown from './components/Countdown';
import RegisterForm from './components/RegisterForm';
import nssceLogo from './assets/logos/nssce-logo.png';
import ieeeSbNssceLogo from './assets/logos/ieee-sb-nssce-logo.png';
import ieeeLogo from './assets/logos/ieee-logo.png';
import ieeeCsLogo from './assets/logos/ieee-cs-logo.png';
import obscuraLogo from './assets/logo.png';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export default function App() {
  const cursorRef = useRef(null);
  const spotRef = useRef(null);
  const heroCanvasRef = useRef(null);
  const monitorSvgRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const tunnelCanvasRef = useRef(null);
  const mouseCoords = useRef({ x: 0, y: 0 });
  // Hero entrance animation
  const handleHeroIn = useCallback(() => {
    const RM = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (RM) return;

    anime
      .timeline({
        easing: 'easeOutExpo',
        complete: () => {
          ScrollTrigger.refresh();
        }
      })
      .add({
        targets: '.hero-logo-img',
        translateY: ['40px', 0],
        opacity: [0, 1],
        duration: 900,
        easing: 'easeOutExpo'
      })
      .add(
        {
          targets: '#hero h1 .l2 .ch',
          translateY: ['110%', 0],
          opacity: [0, 1],
          delay: anime.stagger(28),
          duration: 900
        },
        '-=650'
      )
      .add(
        {
          targets: '.hrow>*, .hx',
          opacity: [0, 1],
          translateY: [20, 0],
          delay: anime.stagger(120),
          duration: 800
        },
        '-=600'
      );
  }, []);

  // Global Pointer Events (Cursor, Spotlight, Magnetic buttons, Click sound, Konami code)
  useEffect(() => {
    const onPointerMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      const hero = document.getElementById('hero');
      if (hero && spotRef.current) {
        const h = hero.getBoundingClientRect();
        spotRef.current.style.setProperty('--x', `${e.clientX}px`);
        spotRef.current.style.setProperty('--y', `${e.clientY - h.top}px`);
      }
      mouseCoords.current.x = e.clientX / window.innerWidth - 0.5;
      mouseCoords.current.y = e.clientY / window.innerHeight - 0.5;
    };

    const onClick = (e) => {
      if (e.target.closest('a, button')) {
        beep(400);
      }
    };

    // Konami code
    const K = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a';
    let ki = [];
    const onKey = (e) => {
      ki.push(e.key);
      ki = ki.slice(-10);
      if (ki.join(',') === K) {
        document.body.classList.add('sk');
        const termOut = document.getElementById('to');
        if (termOut) {
          termOut.textContent += '\n> SECRET OPERATIVE MODE. 0xDEADC0DE';
        }
        anime({
          targets: 'body',
          filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'],
          duration: 1500,
          easing: 'linear'
        });
        beep(220, 0.3);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);

    // Magnetic buttons setup
    const magButtons = document.querySelectorAll('.mag');
    const magCleanups = [];
    magButtons.forEach((b) => {
      const onMove = (e) => {
        const r = b.getBoundingClientRect();
        anime({
          targets: b,
          translateX: (e.clientX - r.left - r.width / 2) * 0.3,
          translateY: (e.clientY - r.top - r.height / 2) * 0.4,
          duration: 200,
          easing: 'easeOutQuad'
        });
      };
      const onLeave = () => {
        anime({
          targets: b,
          translateX: 0,
          translateY: 0,
          duration: 700,
          easing: 'easeOutElastic(1,.5)'
        });
      };
      b.addEventListener('pointermove', onMove);
      b.addEventListener('pointerleave', onLeave);
      magCleanups.push(() => {
        b.removeEventListener('pointermove', onMove);
        b.removeEventListener('pointerleave', onLeave);
      });
    });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      magCleanups.forEach((c) => c());
    };
  }, []);

  // Main GSAP and Canvas Orchestration
  useEffect(() => {
    const RM = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const MOB = window.innerWidth < 800;
    const M = mouseCoords.current;

    /* 1. Hero Canvas: particle field + wireframe rings */
    const hc = heroCanvasRef.current;
    let cancelHeroLoop = false;
    if (hc) {
      const hx = hc.getContext('2d');
      let W = 0, H = 0, P = [];
      const rs = () => {
        W = hc.width = hc.clientWidth;
        H = hc.height = hc.clientHeight;
        P = Array.from({ length: MOB ? 60 : 140 }, () => ({
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
          z: Math.random()
        }));
      };
      rs();
      window.addEventListener('resize', rs);

      let vis = true;
      const obs = new IntersectionObserver((entries) => {
        vis = entries[0].isIntersecting;
      });
      obs.observe(hc);

      const loop = (t) => {
        if (cancelHeroLoop) return;
        requestAnimationFrame(loop);
        if (!vis || (RM && t > 100)) return;
        hx.clearRect(0, 0, W, H);
        hx.strokeStyle = 'rgba(182,255,74,.35)';
        for (let i = 0; i < 9; i++) {
          const z = (t / 4000 + i / 9) % 1;
          const s = z * z * W * 0.7;
          const cx = W * 0.65 + M.x * 60 * z;
          const cy = H * 0.4 + M.y * 40 * z;
          hx.globalAlpha = 1 - z * 0.2;
          hx.strokeRect(cx - s / 2, cy - s / 2, s, s);
        }
        hx.globalAlpha = 1;
        hx.fillStyle = '#B6FF4A';
        P.forEach((p) => {
          p.z -= 0.0015;
          if (p.z <= 0) p.z = 1;
          const k = 1 / p.z;
          hx.fillRect(
            W * 0.65 + p.x * k * W * 0.12 - M.x * 30 * k,
            H * 0.4 + p.y * k * H * 0.12 - M.y * 20 * k,
            1.5,
            1.5
          );
        });
      };
      requestAnimationFrame(loop);
    }

    /* 2. Hero Monitor SVG & Particle Canvas (#dm & #pc) */
    const D = monitorSvgRef.current;
    const C = particleCanvasRef.current;
    const HK = { t: 0, draw() {} };

    if (D && C) {
      const cx = C.getContext('2d');
      let s = `<defs><linearGradient id='wp' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#12351f'/><stop offset='1' stop-color='#0B100C'/></linearGradient><clipPath id='sc'><rect x='138' y='78' width='524' height='344'/></clipPath><linearGradient id='bz' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#1b241b'/><stop offset='1' stop-color='#0a0e0a'/></linearGradient><linearGradient id='sd' x1='0' x2='1'><stop offset='0' stop-color='#0a0e0a'/><stop offset='.5' stop-color='#222c22'/><stop offset='1' stop-color='#0a0e0a'/></linearGradient><linearGradient id='rf' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#fff' stop-opacity='.1'/><stop offset='.35' stop-color='#fff' stop-opacity='0'/></linearGradient><radialGradient id='vg' cx='.5' cy='.5' r='.75'><stop offset='.6' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#000' stop-opacity='.55'/></radialGradient><radialGradient id='gl'><stop offset='0' stop-color='#B6FF4A' stop-opacity='.18'/><stop offset='1' stop-color='#B6FF4A' stop-opacity='0'/></radialGradient><pattern id='sl' width='4' height='3' patternUnits='userSpaceOnUse'><rect width='4' height='1' fill='#000' opacity='.18'/></pattern></defs>`;
      s += `<g id='mon'><ellipse cx='400' cy='270' rx='430' ry='310' fill='url(#gl)'/><ellipse cx='400' cy='520' rx='240' ry='12' fill='#000' opacity='.6'/><path d='M372 448h56l10 48h-76z' fill='url(#sd)'/><rect x='296' y='494' width='208' height='16' rx='6' fill='url(#sd)' stroke='#2a352a'/><rect x='112' y='52' width='576' height='396' rx='16' fill='url(#bz)' stroke='#3a4a38' stroke-width='2'/><rect x='116' y='56' width='568' height='388' rx='13' fill='none' stroke='#fff' stroke-opacity='.06'/><rect x='134' y='74' width='532' height='352' rx='3' fill='#000'/><circle cx='650' cy='438' r='2.5' fill='#B6FF4A'/><text x='400' y='441' fill='#536B48' font-size='8' font-family='monospace' text-anchor='middle' letter-spacing='3'>OBSCURA</text><g id='scr' clip-path='url(#sc)'><rect x='138' y='78' width='524' height='344' fill='url(#wp)'/>`;
      s += ['Files', 'Mail', 'Web', 'Notes']
        .map(
          (n, i) =>
            `<rect x='158' y='${98 + i * 64}' width='34' height='34' rx='6' fill='none' stroke='#8BCA37'/><text x='175' y='${146 + i * 64}' fill='#858D81' font-size='9' font-family='monospace' text-anchor='middle'>${n}</text>`
        )
        .join('');
      s +=
        `<rect x='250' y='120' width='320' height='200' rx='6' fill='#0B100C' stroke='#536B48'/><rect x='250' y='120' width='320' height='22' rx='6' fill='#1d281a'/><circle cx='264' cy='131' r='4' fill='#FF4545'/><circle cx='278' cy='131' r='4' fill='#B6FF4A'/>` +
        [0, 1, 2, 3, 4, 5, 6]
          .map(
            (i) =>
              `<rect x='268' y='${160 + i * 20}' width='${180 + ((i * 37) % 110)}' height='6' rx='3' fill='#536B48'/>`
          )
          .join('') +
        `<rect x='138' y='396' width='524' height='26' fill='#050706'/><circle cx='154' cy='409' r='6' fill='#B6FF4A'/><text x='640' y='413' fill='#858D81' font-size='10' font-family='monospace' text-anchor='end'>12:04</text><rect x='590' y='140' width='56' height='56' rx='8' fill='#12351f' stroke='#8BCA37' opacity='.7'/><polygon points='520,250 520,274 526,268 531,279 535,277 530,266 538,266' fill='#E9EDE5' stroke='#000' stroke-width='.8'/>`;
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 13; j++) {
          if (Math.random() < 0.65) {
            s += `<rect class='pxl' x='${138 + i * 26.2}' y='${78 + j * 26.5}' width='27' height='27' fill='#050706' opacity='0'/>`;
          }
        }
      }
      s += [
        [430, 250, 380, 200, 350, 150, 300, 90],
        [430, 250, 500, 190, 560, 170, 640, 100],
        [430, 250, 460, 320, 430, 380, 470, 420],
        [430, 250, 360, 290, 290, 300, 200, 340],
        [430, 250, 520, 280, 600, 330, 650, 400],
        [380, 200, 320, 210, 260, 180],
        [500, 190, 520, 140, 540, 90]
      ]
        .map(
          (p) =>
            `<polyline class='ck' pathLength='1' stroke-dasharray='1' stroke-dashoffset='1' points='${p}' fill='none' stroke='#B6FF4A' stroke-width='2'/>`
        )
        .join('');
      s +=
        `<rect class='tc' x='168' y='100' width='310' height='160' fill='#000' stroke='#B6FF4A' opacity='0'/>` +
        [
          '&gt; nmap -sV 10.0.0.1',
          '&gt; exploit --target OBSCURA',
          '&gt; bypass auth ........ OK',
          '&gt; sudo rm -rf /trust',
          '&gt; inject 0xDEADC0DE',
          '&gt; ROOT ACCESS: GRANTED'
        ]
          .map(
            (t, i) =>
              `<text class='tc' x='180' y='${124 + i * 22}' fill='#B6FF4A' font-size='11' font-family='monospace' opacity='0'>${t}</text>`
          )
          .join('');
      s +=
        Array.from(
          { length: 8 },
          (_, i) =>
            `<rect class='gb' x='${150 + ((i * 53) % 200)}' y='${95 + ((i * 41) % 240)}' width='${120 + ((i * 61) % 260)}' height='${6 + ((i * 7) % 14)}' fill='${['#FF4545', '#B6FF4A', '#E9EDE5'][i % 3]}' opacity='0'/>`
        ).join('') +
        `</g><rect x='138' y='78' width='524' height='344' fill='url(#vg)'/><rect x='138' y='78' width='524' height='344' fill='url(#rf)'/><rect x='138' y='78' width='524' height='344' fill='url(#sl)'/></g>`;

      D.innerHTML = s;

      let G = [], cw = 0, ch = 0;
      const K = ['#B6FF4A', '#8BCA37', '#536B48', '#E9EDE5', '#1d281a'];
      const ss = (x) => x * x * (3 - 2 * x);

      const setupParticles = () => {
        cw = C.width = C.clientWidth;
        ch = C.height = C.clientHeight;
        if (!cw) return;
        const k = Math.min(cw / 800, ch / 600);
        const ox = (cw - 800 * k) / 2;
        const oy = (ch - 600 * k) / 2;
        const o = document.createElement('canvas');
        o.width = cw;
        o.height = ch;
        const o2 = o.getContext('2d');
        o2.fillStyle = '#fff';
        o2.textAlign = 'center';
        o2.textBaseline = 'middle';
        o2.font = `${cw * 0.2}px Anton,Impact,sans-serif`;
        o2.fillText('OBSCURA', cw / 2, ch * 0.42);
        o2.font = `${cw * 0.058}px Anton,Impact,sans-serif`;
        o2.fillText('// ACCESS GRANTED', cw / 2, ch * 0.62);

        const d = o2.getImageData(0, 0, cw, ch).data;
        const g = Math.max(3, Math.round(cw / 170));
        const T = [];
        for (let y = 0; y < ch; y += g) {
          for (let x = 0; x < cw; x += g) {
            if (d[(y * cw + x) * 4 + 3] > 128) {
              T.push([x, y]);
            }
          }
        }
        T.sort(() => Math.random() - 0.5);

        G = [K.map(() => []), K.map(() => [])];
        let n = 0;
        for (let i = 0; i < 70; i++) {
          for (let j = 0; j < 46; j++) {
            const sx = ox + (138 + (i * 524) / 70) * k;
            const sy = oy + (78 + (j * 344) / 46) * k;
            const a = Math.random() * 6.28;
            const r = cw * (0.15 + Math.random() * 0.5);
            const t = T[n++];
            const c = (Math.random() * 5) | 0;
            G[t ? 0 : 1][c].push({
              sx,
              sy,
              mx: sx + Math.cos(a) * r,
              my: sy + Math.sin(a) * r - ch * 0.1,
              tx: t ? t[0] : sx + Math.cos(a) * r * 1.3,
              ty: t ? t[1] : sy + Math.sin(a) * r * 1.3
            });
          }
        }
        HK.draw();
      };

      HK.draw = () => {
        if (!cw) return;
        const t = HK.t;
        const a = ss(Math.min(1, t / 0.45));
        const b = ss(Math.max(0, (t - 0.45) / 0.55));
        const ga = Math.min(1, t * 14);
        const z = Math.max(2, cw / 300);
        cx.clearRect(0, 0, cw, ch);

        G.forEach((gr, pass) => {
          cx.globalAlpha = pass ? ga * (1 - b) : ga;
          gr.forEach((arr, c) => {
            cx.fillStyle = K[c];
            arr.forEach((p) => {
              cx.fillRect(
                p.sx + (p.mx - p.sx) * a + (p.tx - p.mx) * b,
                p.sy + (p.my - p.sy) * a + (p.ty - p.my) * b,
                z,
                z
              );
            });
          });
        });
        cx.globalAlpha = 1;
      };

      setupParticles();
      window.addEventListener('resize', setupParticles);
      if (document.fonts) document.fonts.ready.then(setupParticles);
    }

    /* 3. Helper for Pinned Timelines */
    const pinT = (sel, fn, end = '+=100%') => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sel,
          start: 'top top',
          end: end,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1
        }
      });
      fn(tl);
      return tl;
    };

    /* 4. GSAP Animations */
    const ctx = gsap.context(() => {
      if (!RM) {
        // Scroll progress bar
        gsap.to('#bar', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { scrub: true, start: 0, end: 'max' }
        });

        // Hero disassembly timeline
        gsap.set('#dm,#pc', {
          xPercent: -50,
          yPercent: -50,
          x: () => (window.innerWidth < 800 ? 0 : window.innerWidth * 0.18)
        });
        const heroTl = gsap.timeline({
          defaults: { ease: 'power1.inOut' },
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: '+=280%',
            pin: true,
            scrub: 0.7,
            anticipatePin: 1
          }
        });

        heroTl
          .to('#hero .l1', { xPercent: -30, opacity: 0, duration: 0.6, ease: 'none' }, 0)
          .to('#hero .l2', { xPercent: 30, opacity: 0, duration: 0.6, ease: 'none' }, 0)
          .to('.hrow,.hx', { y: 80, opacity: 0, duration: 0.6, ease: 'none' }, 0)
          .to('#spot', { opacity: 0 }, 0)
          .to('#pF', { scale: 1.2, opacity: 0, svgOrigin: '400 300' }, 1)
          .to('#pL', { x: -280, rotation: -20, opacity: 0, svgOrigin: '124 300' }, 2)
          .to('#pR', { x: 280, rotation: 20, opacity: 0, svgOrigin: '676 300' }, 2)
          .to('#pT', { y: -220, opacity: 0 }, 2)
          .to('#bd', { scale: 0.92, opacity: 0.3, svgOrigin: '400 300' }, 3)
          .to('#cpu', { y: -50, scale: 1.25, svgOrigin: '400 290' }, 3)
          .to('#ram', { x: 110, y: -30 }, 3)
          .to('#fan', { x: -120, y: -70 }, 3)
          .to('#gpu', { y: 90 }, 3)
          .to('#nt', { opacity: 1 }, 3.4)
          .to('.nl', { strokeDashoffset: 0, stagger: 0.04 }, 3.4)
          .from('.nn', { scale: 0, transformOrigin: '50% 50%', stagger: 0.05 }, 3.5)
          .to('#dm,#pc', { x: 0, duration: 0.9, ease: 'power2.inOut' }, 0)
          .to('#dm', { opacity: 1, duration: 0.5, ease: 'none' }, 0.4)
          .to('#scr', { opacity: 0.25, duration: 0.1, ease: 'none' }, 0.8)
          .to('#scr', { opacity: 1, duration: 0.1, ease: 'none' }, 0.9)
          .to('#scr', { opacity: 0.4, duration: 0.1, ease: 'none' }, 1)
          .to('#scr', { opacity: 1, duration: 0.1, ease: 'none' }, 1.1)
          .to('.pxl', { opacity: 1, duration: 0.05, ease: 'none', stagger: { amount: 1.2, from: 'random' } }, 1.4)
          .to('.ck', { strokeDashoffset: 0, duration: 0.6, stagger: 0.12 }, 2.4)
          .to('.tc', { opacity: 1, duration: 0.1, ease: 'none', stagger: 0.2 }, 3.2)
          .to(
            '.gb',
            {
              opacity: 0.9,
              x: () => gsap.utils.random(-60, 60),
              duration: 0.1,
              ease: 'none',
              stagger: 0.06,
              repeat: 3,
              yoyo: true
            },
            4.4
          )
          .to('#mon', { x: 8, skewX: -3, svgOrigin: '400 250', duration: 0.08, ease: 'none', repeat: 5, yoyo: true }, 4.4)
          .to('#mon', { opacity: 0, duration: 0.5 }, 5.7)
          .set('#pc', { opacity: 1 }, 5.6)
          .to(HK, { t: 1, duration: 3, ease: 'none', onUpdate: () => HK.draw() }, 5.7)
          .to('#pc', { opacity: 1, duration: 0.8 }, 8.7);

        // Tiers & About stagger entrance
        gsap.from('.tier', { y: 80, opacity: 0, stagger: 0.15, duration: 0.8, scrollTrigger: { trigger: '#tiers', start: 'top 80%' } });
        gsap.from('.au>*', { y: 60, opacity: 0, stagger: 0.2, duration: 0.9, scrollTrigger: { trigger: '#aboutus', start: 'top 75%' } });

        // 1. File Section Decryption
        const fpEl = document.getElementById('fp');
        const fsEl = document.getElementById('fs');
        const ft = fpEl ? fpEl.dataset.t : '';
        if (fpEl && !fpEl.textContent) fpEl.textContent = decrypt(ft, 0);
        const fo = { p: 0 };
        pinT('#file', (tl) => {
          tl.to(fo, {
            p: 1,
            ease: 'none',
            onUpdate: () => {
              if (fpEl) fpEl.textContent = decrypt(ft, fo.p);
              if (fsEl) fsEl.textContent = fo.p > 0.95 ? 'DECRYPTED' : 'ENCRYPTED';
            }
          }).to('.red', { scaleX: 0, transformOrigin: 'right', stagger: 0.15 }, 0.2);
        });

        // 2. Breach Rings
        pinT(
          '#breach',
          (tl) => {
            tl.to('#rg circle', { strokeDashoffset: 0, stagger: 0.2, ease: 'none' })
              .to('#rg circle', { opacity: 0, scale: 1.6, transformOrigin: 'center', stagger: 0.1 })
              .to('#core', { attr: { r: 70 }, opacity: 1 }, '<')
              .to('#bt', { opacity: 1 });
          },
          '+=150%'
        );

        // 3. 3D Tunnel Canvas
        const tn = tunnelCanvasRef.current;
        if (tn) {
          const tx = tn.getContext('2d');
          const tp = { v: 0 };
          let tw = 0, th = 0;
          const trs = () => {
            tw = tn.width = tn.clientWidth;
            th = tn.height = tn.clientHeight;
          };
          trs();
          window.addEventListener('resize', trs);
          const tdraw = () => {
            tx.clearRect(0, 0, tw, th);
            tx.strokeStyle = '#B6FF4A';
            for (let i = 0; i < 24; i++) {
              const z = (i / 24 + tp.v * 3) % 1;
              const s = Math.pow(z, 3) * tw * 1.6 + 4;
              tx.globalAlpha = Math.min(1, z * 2) * 0.8;
              tx.save();
              tx.translate(tw / 2 + M.x * 40 * z, th / 2 + M.y * 30 * z);
              tx.rotate(tp.v * 2);
              tx.strokeRect(-s / 2, -s / 2, s, s);
              tx.restore();
            }
            tx.globalAlpha = 0.7;
            tx.fillStyle = '#B6FF4A';
            tx.font = '11px JetBrains Mono';
            for (let i = 0; i < 14; i++) {
              const z = (i / 14 + tp.v * 4) % 1;
              tx.fillText(
                '0x' + ((i * 2654435761) >>> 0).toString(16).slice(0, 6),
                tw / 2 + Math.cos(i * 2) * z * tw * 0.45,
                th / 2 + Math.sin(i * 2) * z * th * 0.45
              );
            }
          };
          pinT(
            'section:has(#tn)',
            (tl) => {
              tl.to(tp, { v: 1, ease: 'none', onUpdate: tdraw });
            },
            '+=200%'
          );
          tdraw();
        }

        // 4. Kinetic Typography
        pinT(
          'section:has(#kin)',
          (tl) => {
            tl.to('#kin .ch', {
              x: () => gsap.utils.random(-300, 300),
              y: () => gsap.utils.random(-200, 200),
              rotation: () => gsap.utils.random(-90, 90),
              skewX: () => gsap.utils.random(-40, 40),
              opacity: 0.15,
              ease: 'none',
              stagger: 0.03
            });
          },
          '+=120%'
        );

        // 5. Encrypted Text
        const ep = document.getElementById('ep');
        if (ep) {
          const et = ep.dataset.t;
          if (!ep.textContent) ep.textContent = decrypt(et, 0);
          const eo = { p: 0 };
          pinT('#enc', (tl) =>
            tl.to(eo, {
              p: 1,
              ease: 'none',
              onUpdate: () => {
                ep.textContent = decrypt(et, eo.p);
              }
            })
          );
        }

        // Marquees: skew container on scroll velocity
        ScrollTrigger.create({
          onUpdate: (s) =>
            gsap.to('.mq', {
              skewX: Math.max(-12, Math.min(12, s.getVelocity() / -200)),
              duration: 0.3,
              overwrite: 'auto'
            })
        });

        // 7. Horizontal Scroll Stages
        const tr = document.getElementById('tr');
        if (tr) {
          gsap.to(tr, {
            x: () => -(tr.scrollWidth - window.innerWidth),
            ease: 'none',
            scrollTrigger: {
              trigger: '#hz',
              start: 'top top',
              end: () => '+=' + (tr.scrollWidth - window.innerWidth),
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true
            }
          });
        }

        // 8. Challenges Cards ClipPath
        ScrollTrigger.create({
          trigger: '#cg',
          start: 'top 75%',
          once: true,
          onEnter: () =>
            anime({
              targets: '.cc',
              clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
              delay: anime.stagger(140),
              duration: 900,
              easing: 'easeOutExpo'
            })
        });

        // 9. Timeline Progress Line
        gsap.to('#tp', {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.tm', start: 'top 60%', end: 'bottom 70%', scrub: true }
        });
        document.querySelectorAll('.ev').forEach((e) =>
          gsap.from(e, {
            opacity: 0.1,
            x: 35,
            scrollTrigger: { trigger: e, start: 'top 85%', end: 'top 55%', scrub: true }
          })
        );

        if (document.querySelector('.protocol-mobile-flow')) {
          gsap.from('.pm-step', {
            opacity: 0.1,
            x: 25,
            stagger: 0.12,
            duration: 0.6,
            scrollTrigger: { trigger: '.protocol-mobile-flow', start: 'top 80%' }
          });
        }

        // 10. Prizes Section
        gsap.from('#p1', {
          yPercent: 60,
          opacity: 0,
          scrollTrigger: { trigger: '#prizes', start: 'top 60%', end: 'top 20%', scrub: true }
        });
      }
    });

    /* 5. Protocol Diagram Animation */
    const pp = document.getElementById('pp');
    if (pp) {
      const path = anime.path('#pp');
      anime({
        targets: '#pk',
        translateX: path('x'),
        translateY: path('y'),
        duration: 6000,
        easing: 'linear',
        loop: true
      });
      anime({
        targets: '#pn circle',
        r: [14, 18, 14],
        delay: anime.stagger(500),
        duration: 1200,
        loop: true,
        easing: 'easeInOutSine'
      });
    }

    /* 6. FAQ Accordion Event Setup */
    const faqButtons = document.querySelectorAll('.fq button');
    faqButtons.forEach((b) => {
      b.onclick = () => {
        const a = b.nextElementSibling;
        const o = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', !o);
        if (b.lastChild) {
          b.lastChild.textContent = o ? '+' : '−';
        }
        anime({
          targets: a,
          height: o ? 0 : a.scrollHeight,
          duration: 350,
          easing: 'easeOutQuart'
        });
      };
    });

    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    const onResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelHeroLoop = true;
      ctx.revert();
    };
  }, []);

  return (
    <>
      {/* Scroll indicator bar */}
      <div id="bar"></div>

      {/* Mouse cursor dot */}
      <div id="cdot" ref={cursorRef}></div>

      {/* Loading Screen */}
      <Loader onComplete={handleHeroIn} />

      {/* Top Header & Navigation Menu */}
      <Navigation />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section id="hero">
          <canvas id="hc" ref={heroCanvasRef} aria-hidden="true"></canvas>
          <svg id="dm" ref={monitorSvgRef} viewBox="0 0 800 600" aria-hidden="true"></svg>
          <canvas id="pc" ref={particleCanvasRef} aria-hidden="true"></canvas>
          <div id="spot" ref={spotRef}></div>
          <Telemetry />
          <h1 className="hero-title d" aria-label="OBSCURA. Unveil the unknown.">
            <span className="l1 hero-logo-wrap">
              <img
                src={obscuraLogo}
                alt="OBSCURA"
                className="hero-logo-img"
                width="669"
                height="175"
              />
            </span>
            <span className="l2">
              {[...'UNVEIL THE UNKNOWN'].map((c, i) => (
                <span className="ch" aria-hidden="true" key={i}>
                  {c === ' ' ? '\u00a0' : c}
                </span>
              ))}
            </span>
          </h1>
          <div className="hrow">
            <p>
              <b>THE TRUTH IS HIDDEN IN THE CODE.</b>An underground cybersecurity arena. One network. Countless secrets.
            </p>
            <div className="hrow-cd">
              <Countdown />
            </div>
            <div className="hero-cta-btns">
              <a className="btn p mag" href="#reg">
                ENTER OBSCURA →
              </a>
              <a className="btn mag" href="#file">
                EXPLORE THE MISSION ↓
              </a>
            </div>
          </div>
        </section>

        {/* Top Marquee */}
        <div className="mq" aria-hidden="true">
          <div className="mq-track" id="m1">
            <div className="mq-item">
              NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS ·&nbsp;
            </div>
            <div className="mq-item">
              NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS · NOTHING IS AS IT SEEMS ·&nbsp;
            </div>
          </div>
        </div>

        {/* File Classified Section */}
        <section id="file" className="pin">
          <div className="doc">
            <div className="mo">
              FILE: OBSCURA_001 &nbsp;|&nbsp;{' '}
              <span style={{ color: 'var(--r)' }}>CLASSIFICATION: TOP SECRET</span> &nbsp;|&nbsp; STATUS:{' '}
              <b id="fs">ENCRYPTED</b>
            </div>
            <h2 className="d">The classified file</h2>
            <p
              id="fp"
              data-t="Operatives are invited to a closed network. Every service hides a flag. Every flag hides a story. Nobody here is who they claim to be. Find what was buried. Break what was sealed."
            ></p>
            <div className="red" style={{ left: '4vw', top: '46%', width: '30%' }}></div>
            <div className="red" style={{ left: '40%', top: '56%', width: '26%' }}></div>
            <div className="red" style={{ left: '12%', top: '66%', width: '40%' }}></div>
          </div>
        </section>

        {/* Perimeter Breach Section */}
        <section id="breach" className="pin">
          <svg viewBox="-200 -200 400 400" fill="none" stroke="#B6FF4A" aria-label="Firewall rings dissolving">
            <g id="rg">
              {[170, 140, 110, 80, 50].map((r) => (
                <circle key={r} r={r} strokeWidth="2" strokeDasharray={r * 6.28} strokeDashoffset={r * 6.28} />
              ))}
              {Array.from({ length: 12 }, (_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1="0"
                  x2={Math.cos((i / 12) * 6.28) * 170}
                  y2={Math.sin((i / 12) * 6.28) * 170}
                  strokeOpacity=".3"
                />
              ))}
            </g>
            <circle id="core" r="14" fill="#B6FF4A" stroke="none" opacity=".15" />
          </svg>
          <div className="t d" id="bt">
            PERIMETER BREACHED.
          </div>
        </section>

        {/* 3D Tunnel Canvas Section */}
        <section className="pin" style={{ padding: 0 }}>
          <canvas id="tn" ref={tunnelCanvasRef} aria-hidden="true"></canvas>
          <div className="tl d" id="tt">
            ENTERING THE NETWORK
          </div>
        </section>

        {/* Kinetic Typography Section */}
        <section className="pin">
          <div id="kin" className="d" aria-label="Trust nothing.">
            {[...'TRUST NOTHING.'].map((c, i) => (
              <span className="ch" aria-hidden="true" key={i}>
                {c === ' ' ? '\u00a0' : c}
              </span>
            ))}
          </div>
        </section>

        {/* Encrypted Flag Section */}
        <section id="enc" className="pin">
          <p
            id="ep"
            data-t="THE FLAG IS CLOSER THAN YOU THINK."
            aria-label="The flag is closer than you think."
          ></p>
        </section>

        {/* The Mission Section */}
        <section id="about">
          <div className="ab">
            <div>
              <div className="mo">THE MISSION</div>
              <h2 className="h d">The unknown is your playground.</h2>
              <p>
                OBSCURA is a cybersecurity battlefield for curious minds, problem solvers and digital explorers. Work
                through complex challenges, uncover hidden clues, decode secrets and prove your skills where every
                detail matters.
              </p>
            </div>
            <div className="dos" id="dos">
              <b>MISSION ID</b> OBS-001<br />
              <b>DIFFICULTY</b> Beginner → Expert<br />
              <b>STATUS</b> Recruiting<br />
              <b>FORMAT</b> Jeopardy CTF, online<br />
              <b>TEAM SIZE</b> {CONFIG.teamSize}<br />
              <b>ELIGIBILITY</b> {CONFIG.eligibility}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="aboutus">
          <div className="au">
            <div>
              <div className="mo">ABOUT US</div>
              <h2 className="h d">The people behind the signal.</h2>
              <p>
                IEEE CS SBC NSSCE is a vibrant community promoting computing and emerging technologies through workshops, hackathons, technical sessions, and coding competitions. It empowers students with practical skills, innovation, and collaboration across diverse tech domains.
              </p>
              <p>
                OBSCURA is a CTF competition organized by IEEE CS SBC NSSCE, challenging participants to solve cybersecurity puzzles in cryptography, web exploitation, forensics, and reverse engineering while testing their skills and problem-solving abilities.
              </p>
            </div>
            <figure className="ph">
              <img
                id="aimg"
                alt="The OBSCURA organizing team"
                src={CONFIG.aboutPhoto || undefined}
                hidden={!CONFIG.aboutPhoto}
              />
              <figcaption className="mo" id="pht" hidden={!!CONFIG.aboutPhoto}>
                
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Horizontal Scroll Stages Section */}
        <section id="hz">
          <div className="tr" id="tr">
            {CONFIG.stages.map((s, i) => (
              <div className="st" key={i}>
                <div className="big d">0{i + 1}</div>
                <svg
                  viewBox="0 0 90 90"
                  fill="none"
                  stroke="#B6FF4A"
                  strokeWidth="2"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{
                    __html: [
                      '<circle cx="45" cy="45" r="30"/><path d="M45 5v80M5 45h80"/>',
                      '<path d="M10 20h70M10 45h50M10 70h30"/>',
                      '<path d="M10 80L80 10M50 10h30v30"/>',
                      '<circle cx="38" cy="38" r="24"/><path d="M56 56l24 24"/>',
                      '<path d="M15 80V10l60 15-60 15"/>'
                    ][i]
                  }}
                />
                <h3 className="d">{s[0]}</h3>
                <p>{s[1]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Challenges Grid Section */}
        <section id="ch">
          <div className="mo">CHALLENGES</div>
          <h2 className="h d">Every domain hides a secret.</h2>
          <div className="cg" id="cg">
            {CONFIG.domains.map((d, i) => (
              <article className="cc" tabIndex="0" key={i}>
                <span className="n">0{i + 1}</span>
                <svg viewBox="0 0 70 70" aria-hidden="true">
                  <path d={d[2]} />
                </svg>
                <div>
                  <h3>
                    {[...d[0]].map((c, j) => (
                      <span key={j}>{c === ' ' ? '\u00a0' : c}</span>
                    ))}
                  </h3>
                  <div className="ds">{d[1]}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Protocol Section */}
        <section id="protocol">
          <div className="mo">PROTOCOL</div>
          <h2 className="h d">Think. Decode. Capture.</h2>
          <div className="protocol-svg-wrap">
            <svg
              id="pv"
              viewBox="0 0 900 140"
              style={{ width: '100%', marginTop: '6vh' }}
              aria-label="Six step flow: discover, analyze, investigate, solve, submit, earn"
            >
              <path id="pp" d="M30 70 H870" stroke="#536B48" strokeWidth="2" fill="none" />
              <g id="pn">
                {['Discover', 'Analyze', 'Investigate', 'Solve', 'Submit flag', 'Earn points'].map((s, i) => (
                  <g tabIndex="0" data-i={i} key={i}>
                    <circle cx={30 + i * 168} cy="70" r="14" fill="#050706" stroke="#B6FF4A" strokeWidth="2" />
                    <text
                      x={30 + i * 168}
                      y="112"
                      fill="#E9EDE5"
                      fontSize="13"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                    >
                      {s}
                    </text>
                  </g>
                ))}
              </g>
              <circle id="pk" r="6" fill="#B6FF4A" />
            </svg>
          </div>
          <div className="protocol-mobile-flow" aria-label="Six step protocol">
            {['Discover', 'Analyze', 'Investigate', 'Solve', 'Submit flag', 'Earn points'].map((s, i) => (
              <div className="pm-step" key={i}>
                <div className="pm-indicator">
                  <span className="pm-dot"></span>
                  {i < 5 && <span className="pm-line"></span>}
                </div>
                <div className="pm-info">
                  <span className="pm-num mo">0{i + 1} // STEP</span>
                  <div className="pm-title">{s}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mo" id="pinfo" style={{ marginTop: '20px' }}>
            FORMAT: Jeopardy CTF · TEAM SIZE: {CONFIG.teamSize} · SCORING: {CONFIG.scoring} · ELIGIBILITY:{' '}
            {CONFIG.eligibility}
          </p>
        </section>

        {/* Operation Schedule / Timeline */}
        <section id="tl">
          <div className="mo">OPERATION SCHEDULE</div>
          <h2 className="h d">Mission timeline</h2>
          <div className="tm">
            <div className="ln">
              <i id="tp"></i>
            </div>
            <div id="ev">
              {CONFIG.timeline.map((e, idx) => (
                <div className="ev" key={idx}>
                  <div className="mo">{new Date(e[1]).toDateString().toUpperCase()}</div>
                  <h3>{e[0]}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rewards / Prizes Section */}
        <section id="prizes">
          <div className="mo">REWARDS</div>
          <h2 className="h d">Glory is earned. Not given.</h2>
          <div className="pr" style={{ marginTop: '6vh' }}>
            <div>
              <div className="one d" id="p1">
                {CONFIG.prizes[0][1]}
              </div>
              <div className="mo" id="p1d">
                FIRST PRIZE · THE CONQUEROR
              </div>
            </div>
            <ol id="pl">
              {CONFIG.prizes.slice(1).map((p, i) => (
                <li key={i}>
                  <span>{p[0]}</span>
                  <span>{p[1]}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Sponsors Marquee */}
        <div className="mq" aria-label="Sponsors (placeholders)">
          <div className="mq-track mq-track-slow sp" id="sp">
            <div className="mq-item" style={{ display: 'inline-flex', gap: '60px', paddingRight: '60px' }}>
              {[...CONFIG.sponsors, ...CONFIG.sponsors].map((s, i) => (
                <span key={`sp1-${i}`}>{s}</span>
              ))}
            </div>
            <div className="mq-item" style={{ display: 'inline-flex', gap: '60px', paddingRight: '60px' }}>
              {[...CONFIG.sponsors, ...CONFIG.sponsors].map((s, i) => (
                <span key={`sp2-${i}`}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Sponsorship Tiers Section */}
        <section id="sponsor">
          <div className="mo">SPONSORSHIP</div>
          <h2 className="h d">Back the next generation of operatives.</h2>
          <p style={{ maxWidth: '520px', marginTop: '20px', color: 'var(--mt)' }}>
            Put your company in front of the people who break systems for fun. Review the deliverables and packages below.
          </p>
          <div className="tiers" id="tiers">
            {TI.map((t, idx) => (
              <article className={`tier ${t[2]}`} key={idx}>
                <h3>{t[0]}</h3>
                <div className="pr2">{t[1]}</div>
                <ul>
                  {t[3].map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
                <a
                  className={`btn ${t[2] ? 'p' : ''}`}
                  href={`mailto:${CONFIG.contact}?subject=${t[0]}%20sponsorship%20-%20OBSCURA`}
                >
                  BECOME {t[0].toUpperCase()}
                </a>
              </article>
            ))}
          </div>

          {/* Deliverables Comparison Matrix */}
          <div className="sponsor-table-card">
            <div className="sp-scroll-hint mo" aria-hidden="true">
              <span>← SWIPE TO VIEW ALL PACKAGES →</span>
            </div>
            <table className="sp-table">
              <thead>
                <tr>
                  <th>DELIVERABLES</th>
                  <th>PLATINUM</th>
                  <th>GOLD</th>
                  <th>SILVER</th>
                </tr>
              </thead>
              <tbody>
                {SPONSOR_DELIVERABLES.map((row, i) =>
                  row.isPackage ? (
                    <tr key={i} className="sp-pkg">
                      <td>{row.item}</td>
                      <td>{row.platinum}</td>
                      <td>{row.gold}</td>
                      <td>{row.silver}</td>
                    </tr>
                  ) : (
                    <tr key={i}>
                      <td>{row.item}</td>
                      <td>{row.platinum ? <span className="sp-check">✓</span> : <span className="sp-empty">—</span>}</td>
                      <td>{row.gold ? <span className="sp-check">✓</span> : <span className="sp-empty">—</span>}</td>
                      <td>{row.silver ? <span className="sp-check">✓</span> : <span className="sp-empty">—</span>}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq">
          <div className="mo">KNOWLEDGE BASE</div>
          <h2 className="h d">Ask the archive.</h2>
          <div id="fqs" style={{ marginTop: '5vh', maxWidth: '900px' }}>
            {CONFIG.faq.map((f, i) => (
              <div className="fq" key={i}>
                <button aria-expanded="false" aria-controls={`a${i}`}>
                  <span>{f[0]}</span>
                  <b className="mo" style={{ fontSize: '22px' }}>
                    +
                  </b>
                </button>
                <div className="a" id={`a${i}`}>
                  <p>
                    {f[1].replace(/CONFIG\.(\w+)/, (_, k) => CONFIG[k])}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Request Access Registration Form */}
        <section id="reg">
          <div className="mo">REQUEST ACCESS</div>
          <h2 className="h d">You found the entrance.</h2>
          <p style={{ marginTop: '20px' }}>Now prove you belong here.</p>
          <RegisterForm />
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-simple">
        <div className="footer-simple-top">
          <div className="footer-simple-brand">
            <a href="#" className="footer-simple-logo-link" aria-label="OBSCURA">
              <img
                src={obscuraLogo}
                alt="OBSCURA"
                className="footer-simple-logo-brand"
              />
            </a>
            <span className="footer-simple-tagline mo">CYBERSECURITY ARENA</span>
          </div>

          <div className="footer-simple-orgs">
            <span className="mo footer-simple-label">HOSTED BY</span>
            <div className="footer-simple-logos">
              <a
                href="https://www.ieee.org"
                target="_blank"
                rel="noopener noreferrer"
                title="IEEE"
              >
                <img
                  src={ieeeLogo}
                  alt="IEEE"
                  className="footer-simple-logo-img logo-ieee"
                />
              </a>
              <a
                href="https://www.nssce.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                title="NSS College of Engineering"
              >
                <img
                  src={nssceLogo}
                  alt="NSS College of Engineering"
                  className="footer-simple-logo-img logo-nssce"
                />
              </a>
              <a
                href="https://www.ieeesbnssce.in"
                target="_blank"
                rel="noopener noreferrer"
                title="IEEE SB NSSCE"
              >
                <img
                  src={ieeeSbNssceLogo}
                  alt="IEEE SB NSSCE"
                  className="footer-simple-logo-img logo-ieee-sb"
                />
              </a>
              <a
                href="https://www.ieeesbnssce.in"
                target="_blank"
                rel="noopener noreferrer"
                title="IEEE Computer Society SBC NSSCE"
              >
                <img
                  src={ieeeCsLogo}
                  alt="IEEE CS SBC NSSCE"
                  className="footer-simple-logo-img logo-ieee-cs"
                />
              </a>
              
            </div>
          </div>
        </div>

        <div className="footer-simple-bottom mo">
          <div className="footer-simple-links">
            <a href={`mailto:${CONFIG.contact}`}>{CONFIG.contact}</a>
            <a href="https://www.nssce.ac.in" target="_blank" rel="noopener noreferrer">
              NSSCE ↗
            </a>
            <a href="https://www.ieeesbnssce.in" target="_blank" rel="noopener noreferrer">
              IEEE SB NSSCE ↗
            </a>
            <a href="https://www.linkedin.com/company/ieeesbnssce" target="_blank" rel="noopener noreferrer">
              LinkedIn ↗
            </a>
            <a href="#hero">Back to top ↑</a>
          </div>
          <div className="footer-simple-copy">
            © {new Date().getFullYear()} OBSCURA · IEEE CS SBC NSSCE
          </div>
        </div>
      </footer>
    </>
  );
}

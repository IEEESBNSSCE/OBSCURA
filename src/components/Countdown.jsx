import React, { useEffect, useState } from 'react';
import { CONFIG } from '../constants';

export default function Countdown() {
  const [cd, setCd] = useState({ d: '00', h: '00', m: '00', s: '00' });

  useEffect(() => {
    const update = () => {
      const s = Math.max(0, ((new Date(CONFIG.date).getTime() - Date.now()) / 1000) | 0);
      const v = [
        String((s / 86400) | 0).padStart(2, '0'),
        String(((s / 3600) % 24) | 0).padStart(2, '0'),
        String(((s / 60) % 60) | 0).padStart(2, '0'),
        String(s % 60).padStart(2, '0')
      ];
      setCd({ d: v[0], h: v[1], m: v[2], s: v[3] });
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div id="cd" aria-label="Countdown to competition">
      <div>
        {cd.d}
        <small>D</small>
      </div>
      <div>
        {cd.h}
        <small>H</small>
      </div>
      <div>
        {cd.m}
        <small>M</small>
      </div>
      <div>
        {cd.s}
        <small>S</small>
      </div>
    </div>
  );
}


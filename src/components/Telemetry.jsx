import React, { useEffect, useState } from 'react';
import { sc } from '../constants';

export default function Telemetry() {
  const [telemetry, setTelemetry] = useState('');

  useEffect(() => {
    const update = () => {
      setTelemetry(
        `LAT ${(10 + Math.random()).toFixed(4)}\nLON ${(76 + Math.random()).toFixed(4)}\n0x${sc(8)}\n0x${sc(8)}`
      );
    };
    update();
    const iv = setInterval(update, 400);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="hx mo" id="hx" aria-hidden="true">
      {telemetry}
    </div>
  );
}


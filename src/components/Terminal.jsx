import React, { useRef, useState } from 'react';
import { CONFIG } from '../constants';

export default function Terminal() {
  const [output, setOutput] = useState('Type HELP. Commands: HELP ABOUT STATUS DOMAINS ACCESS CLEAR');
  const [input, setInput] = useState('');
  const outRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.trim().toLowerCase();
    setInput('');

    if (cmd === 'clear') {
      setOutput('');
      return;
    }

    const CM = {
      help: 'HELP ABOUT STATUS DOMAINS ACCESS CLEAR',
      about: 'OBSCURA: an underground CTF arena. Nothing is as it seems.',
      status: () =>
        `Network: ONLINE · Registration: ${
          CONFIG.registerEndpoint || CONFIG.externalRegisterUrl ? 'OPEN' : 'NOT CONFIGURED'
        } · Starts: ${new Date(CONFIG.date).toDateString()}`,
      domains: () => CONFIG.domains.map((d) => d[0]).join(' | '),
      access: () => {
        window.location.hash = '#reg';
        return 'Opening access terminal...';
      }
    };

    const response = CM[cmd]
      ? typeof CM[cmd] === 'function'
        ? CM[cmd]()
        : CM[cmd]
      : 'Unknown command. Type HELP.';

    setOutput((prev) => prev + '\n> ' + cmd + '\n');
    let idx = 0;
    const iv = setInterval(() => {
      setOutput((prev) => {
        const char = response[idx++];
        return char !== undefined ? prev + char : prev;
      });
      if (outRef.current) {
        outRef.current.scrollTop = 1e9;
      }
      if (idx >= response.length) {
        clearInterval(iv);
      }
    }, 12);
  };

  return (
    <div id="term">
      <div id="to" ref={outRef} aria-live="polite">
        {output}
      </div>
      <label className="term-input-row">
        <span>&gt;</span>
        <input
          id="ti"
          autoComplete="off"
          spellCheck="false"
          aria-label="Terminal command"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </label>
    </div>
  );
}


import React, { useRef, useState } from 'react';
import { CONFIG } from '../constants';
import { beep } from '../utils/audio';

export default function RegisterForm() {
  const formRef = useRef(null);
  const [output, setOutput] = useState({ text: '', isError: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const bad = ['name', 'email', 'inst'].filter((k) => !form[k]?.checkValidity() || !data[k]?.trim());

    if (bad.length) {
      setOutput({
        text: '> ACCESS DENIED: check ' + bad.join(', ') + '.',
        isError: true
      });
      form[bad[0]]?.focus();
      return;
    }

    setOutput({ text: '> VERIFYING OPERATIVE...', isError: false });

    if (!CONFIG.registerEndpoint) {
      setOutput({
        text:
          '> NO REGISTRATION BACKEND CONFIGURED. Nothing was sent.' +
          (CONFIG.externalRegisterUrl ? ' Use the external link.' : ' Set CONFIG.registerEndpoint.'),
        isError: true
      });
      return;
    }

    const submitBtn = document.getElementById('rs');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(CONFIG.registerEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
      setOutput({
        text: '> ACCESS GRANTED. Registration confirmed by server.',
        isError: false
      });
      form.reset();
      beep(900, 0.2);
    } catch {
      setOutput({
        text: '> CONNECTION FAILED. Registration was not confirmed. Try again.',
        isError: true
      });
    }

    if (submitBtn) submitBtn.disabled = false;
  };

  return (
    <form id="rf" ref={formRef} noValidate onSubmit={handleSubmit}>
      <label>
        Full name
        <input name="name" required minLength="2" autoComplete="name" placeholder=" " />
      </label>
      <label>
        Email address
        <input name="email" type="email" required autoComplete="email" placeholder=" " />
      </label>
      <label>
        Team name
        <input name="team" placeholder=" " />
      </label>
      <label>
        Institution
        <input name="inst" required placeholder=" " />
      </label>
      <label className="full">
        Participation type
        <select name="type">
          <option>Individual</option>
          <option>Team</option>
        </select>
      </label>
      <div className="full form-actions">
        <button className="btn p" id="rs" type="submit">
          REQUEST ACCESS →
        </button>{' '}
        {CONFIG.externalRegisterUrl ? (
          <a className="btn" id="ext" href={CONFIG.externalRegisterUrl} rel="noopener">
            OR REGISTER EXTERNALLY
          </a>
        ) : (
          <a className="btn" id="ext" href="#" style={{ display: 'none' }} rel="noopener">
            OR REGISTER EXTERNALLY
          </a>
        )}
      </div>
      <div
        className="full"
        id="out"
        role="status"
        aria-live="polite"
        style={{ color: output.isError ? 'var(--r)' : 'var(--n)' }}
      >
        {output.text}
      </div>
    </form>
  );
}


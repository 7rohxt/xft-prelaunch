import { useState } from "react";

// Deployed Apps Script Web App URL — set VITE_SIGNUP_ENDPOINT in .env (see README).
// Empty = preview mode: the form works but saves nothing.
const ENDPOINT = import.meta.env.VITE_SIGNUP_ENDPOINT || "";

const svg = (paths) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
);
const GiftIcon = svg(<><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v7.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V12" /><path d="M12 8v12.5" /><path d="M12 8C11 5 9 4.2 8 5.2 7 6.2 9 8 12 8zM12 8c1-3 3-3.8 4-2.8 1 1-1 2.8-4 2.8z" /></>);
const PersonIcon = svg(<><circle cx="12" cy="8" r="3.4" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>);
const PhoneIcon = svg(<path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3z" />);
const MailIcon = svg(<><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m4 7 8 6 8-6" /></>);
const LockIcon = svg(<><rect x="4.5" y="10" width="15" height="10" rx="2.4" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>);
const CupIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8h12l-1 11a2 2 0 0 1-2 1.8H9A2 2 0 0 1 7 19z" />
    <path d="M6 8l1-3h10l1 3" />
    <circle cx="10" cy="16" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="17" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export default function App() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState(null);

  function validate() {
    const e = {};
    if (name.trim().length < 2) e.name = "Please enter your name.";
    if (phone.length !== 10) e.phone = "Enter a valid 10-digit mobile number.";
    const em = email.trim();
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) e.email = "That email looks off.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const payload = { name: name.trim(), phone, email: email.trim(), source: "qr" };
    try {
      if (ENDPOINT) {
        await fetch(ENDPOINT, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
      } else {
        console.warn("[XFT] VITE_SIGNUP_ENDPOINT not set — preview mode, nothing saved.");
      }
    } catch (err) {
      console.error("[XFT] submit error", err);
    }
    setCode(true);
    setBusy(false);
    setName(""); setPhone(""); setEmail(""); setErrors({});
  }

  return (
    <div className="app-shell">
      <div className="screen">
        <img className="brand-logo" src="/logo.png" alt="Xing Fu Tang — Taiwan No.1" />
        <div className="hero-wrap">
          <img className="hero" src="/hero.png" alt="Bobaosaur with Xing Fu Tang signature brown sugar boba drinks" />
        </div>

        <h1 className="hero-title">Something <em>sweet</em> is on its way.</h1>
        <div className="rule" aria-hidden="true">
          <span className="ln" /><span className="dots">• • •</span><span className="ln" />
        </div>
        <p className="hero-sub">VR Mall Chennai · opening soon</p>

        <div className="offer">
          <span className="offer-ic">{GiftIcon}</span>
          <div className="offer-txt">
            <b className="offer-title">Unlock your welcome gift</b>
            <span className="offer-sub">Register to reveal your Early Bird offer.</span>
          </div>
        </div>

        <form className="card" onSubmit={submit} noValidate>
          <span className="eyebrow">Early Bird</span>
          <div className="frow">
            <span className="chip">{PersonIcon}</span>
            <div className="fcol">
              <label className="label" htmlFor="name">Your name</label>
              <input className="input" id="name" type="text" autoComplete="name"
                placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <div className="err">{errors.name}</div>}
            </div>
          </div>

          <div className="frow">
            <span className="chip">{PhoneIcon}</span>
            <div className="fcol">
              <label className="label" htmlFor="phone">Mobile number</label>
              <div className="phone-row">
                <select className="cc" aria-label="Country code" defaultValue="+91">
                  <option>+91</option>
                </select>
                <input className="input" id="phone" type="tel" inputMode="numeric"
                  autoComplete="tel-national" maxLength={10} placeholder="98765 43210"
                  value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} />
              </div>
              {errors.phone && <div className="err">{errors.phone}</div>}
            </div>
          </div>

          <div className="frow">
            <span className="chip">{MailIcon}</span>
            <div className="fcol">
              <label className="label" htmlFor="email">Email <span className="opt">(optional)</span></label>
              <input className="input" id="email" type="email" autoComplete="email"
                placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              {errors.email && <div className="err">{errors.email}</div>}
            </div>
          </div>

          <button className="btn" type="submit" disabled={busy}>
            {GiftIcon}
            {busy ? "Saving…" : "Reveal my gift →"}
          </button>
        </form>

        <div className="spacer" />
        <p className="foot">Xing Fu Tang · VR Mall, Chennai</p>
      </div>

      {code && (
        <div className="sheet-overlay" onClick={(e) => { if (e.target.classList.contains("sheet-overlay")) setCode(null); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="You're all set">
            <img className="modal-mascot" src="/love.png" alt="" />
            <h2>You&rsquo;ve unlocked it!</h2>
            <div className="reveal">
              <div className="reveal-title">Buy 1 Get 1 FREE</div>
              <div className="reveal-sub">on any drink of your choice</div>
            </div>
            <p>Reserved for you &mdash; when we open, it applies automatically at the counter. Just come in with this mobile number.</p>
            <button className="done" onClick={() => setCode(null)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

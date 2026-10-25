"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { buildWhatsAppLink } from "../../../src/config/site";
import { homeTypes, isValidIndianMobile } from "../../../src/lib/pricing";

export function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.5A9.94 9.94 0 1 0 12.04 2Zm0 18.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.08.89.9-3-.2-.31a8.1 8.1 0 1 1 6.8 3.73Zm4.45-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06a6.6 6.6 0 0 1-1.95-1.2 7.3 7.3 0 0 1-1.35-1.68c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.47-.4-.4-.55-.41h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.1 3.64.57.25 1.02.4 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

type Errors = Partial<Record<"name" | "mobile" | "location", string>>;

function validate(values: { name: string; mobile: string; location?: string }, needsLocation: boolean) {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = "Enter your name (at least 2 characters).";
  if (!isValidIndianMobile(values.mobile)) errors.mobile = "Enter a valid 10-digit Indian mobile number starting with 6–9.";
  if (needsLocation && (values.location ?? "").trim().length < 2) errors.location = "Enter your locality (at least 2 characters).";
  return errors;
}

function Field({
  label,
  error,
  id,
  children,
}: {
  label: string;
  error?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// Keeps digits only and drops a pasted +91 / 91 / 0 prefix so a pasted number still fits 10 digits.
function normaliseMobile(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length > 10 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

function MobileInput({
  id,
  value,
  onChange,
  error,
  compact,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  compact?: boolean;
}) {
  return (
    <div className={`mobile-input${error ? " has-error" : ""}${compact ? " compact" : ""}`}>
      <span aria-hidden="true">+91</span>
      <input
        id={id}
        name="mobile"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="10-digit mobile number"
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(normaliseMobile(event.target.value))}
      />
    </div>
  );
}

function Confirmation({
  title,
  children,
  message,
  onReset,
}: {
  title: string;
  children: React.ReactNode;
  message: string;
  onReset: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="confirmation" ref={ref} tabIndex={-1} role="status">
      <h3>{title}</h3>
      <p>{children}</p>
      <div className="confirmation-actions">
        <a className="btn btn-whatsapp" href={buildWhatsAppLink(message)} target="_blank" rel="noopener noreferrer">
          <WhatsAppMark /> Send details on WhatsApp
        </a>
        <button type="button" className="btn-link" onClick={onReset}>
          Edit details
        </button>
      </div>
    </div>
  );
}

export function LeadForm() {
  const uid = useId();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = validate({ name, mobile }, false);
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done) {
    return (
      <Confirmation
        title={`Thanks, ${name.trim()}`}
        message={`Hello Leor Design, I'm ${name.trim()} (${mobile}). I'd like a free consultation about my home interiors.`}
        onReset={() => setDone(false)}
      >
        Your details are valid, but this website is not connected to a database yet, so nothing has been sent or saved. To reach Leor now, send them on WhatsApp.
      </Confirmation>
    );
  }

  return (
    <form className="lead-form" onSubmit={submit} noValidate>
      <h2>Begin your interior journey</h2>
      <Field label="Full name" id={`${uid}-name`} error={errors.name}>
        <input
          id={`${uid}-name`}
          name="name"
          autoComplete="name"
          placeholder="Enter your full name"
          value={name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${uid}-name-error` : undefined}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field label="Mobile number" id={`${uid}-mobile`} error={errors.mobile}>
        <MobileInput id={`${uid}-mobile`} value={mobile} onChange={setMobile} error={errors.mobile} />
      </Field>
      <button className="btn btn-gold btn-block" type="submit">
        Get a free consultation <span aria-hidden="true">→</span>
      </button>
      <p className="form-note">No database is connected yet, so nothing is saved. You can hand your details to us on WhatsApp.</p>
    </form>
  );
}

export function ConsultationForm() {
  const uid = useId();
  const [values, setValues] = useState({ name: "", mobile: "", location: "", home: "2 BHK", notes: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const set = (key: keyof typeof values) => (value: string) => setValues((v) => ({ ...v, [key]: value }));

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = validate(values, true);
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done) {
    const message = `Hello Leor Design, I'm ${values.name.trim()} (${values.mobile}) from ${values.location.trim()}. Home type: ${values.home}.${values.notes.trim() ? ` Notes: ${values.notes.trim()}` : ""} I'd like to book a consultation.`;
    return (
      <Confirmation title={`Thanks, ${values.name.trim()}`} message={message} onReset={() => setDone(false)}>
        Your details look valid, but the website is not connected to a database yet. Nothing has been sent or stored; use WhatsApp to share them with Leor.
      </Confirmation>
    );
  }

  return (
    <form className="consult-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <Field label="Full name" id={`${uid}-name`} error={errors.name}>
          <input
            id={`${uid}-name`}
            autoComplete="name"
            value={values.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
            onChange={(e) => set("name")(e.target.value)}
          />
        </Field>
        <Field label="Mobile number" id={`${uid}-mobile`} error={errors.mobile}>
          <MobileInput id={`${uid}-mobile`} value={values.mobile} onChange={set("mobile")} error={errors.mobile} />
        </Field>
        <Field label="Locality in Bangalore" id={`${uid}-loc`} error={errors.location}>
          <input
            id={`${uid}-loc`}
            autoComplete="address-level2"
            placeholder="e.g. Hebbal, Yelahanka"
            value={values.location}
            aria-invalid={errors.location ? true : undefined}
            aria-describedby={errors.location ? `${uid}-loc-error` : undefined}
            onChange={(e) => set("location")(e.target.value)}
          />
        </Field>
        <Field label="Home type" id={`${uid}-home`}>
          <select id={`${uid}-home`} value={values.home} onChange={(e) => set("home")(e.target.value)}>
            {[...homeTypes, "Office or other"].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Anything we should know? (optional)" id={`${uid}-notes`}>
        <textarea id={`${uid}-notes`} rows={3} value={values.notes} onChange={(e) => set("notes")(e.target.value)} />
      </Field>
      <button className="btn btn-gold" type="submit">
        Book my consultation <span aria-hidden="true">→</span>
      </button>
      <p className="form-note">
        Front-end preview: no database is connected yet, so submitting only checks your details and offers a WhatsApp hand-off.
      </p>
    </form>
  );
}

export function RegisterForm({
  onDone,
  compact,
  estimateText,
  buttonLabel = "Register for 10% off",
}: {
  onDone?: () => void;
  compact?: boolean;
  estimateText?: string;
  buttonLabel?: string;
}) {
  const uid = useId();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const canSubmit = consent && Object.keys(validate({ name, mobile }, false)).length === 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = validate({ name, mobile }, false);
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setDone(true);
      onDone?.();
    }
  }

  if (done) {
    return (
      <Confirmation
        title="Almost there"
        message={`Hello Leor Design, I'm ${name.trim()} (${mobile}). I'd like to claim the 10% offer.${estimateText ? ` ${estimateText}` : ""}`}
        onReset={() => setDone(false)}
      >
        Registration is not stored yet and no code has been issued. Message Leor on WhatsApp and the team can confirm the offer terms.
      </Confirmation>
    );
  }

  return (
    <form className={`register-form${compact ? " compact" : ""}`} onSubmit={submit} noValidate>
      <div className="register-fields">
        <Field label="Name" id={`${uid}-name`} error={errors.name}>
          <input
            id={`${uid}-name`}
            autoComplete="name"
            value={name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Mobile" id={`${uid}-mobile`} error={errors.mobile}>
          <MobileInput id={`${uid}-mobile`} compact value={mobile} onChange={setMobile} error={errors.mobile} />
        </Field>
      </div>
      <label className="consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          I agree to be contacted about this offer. See the <a href="/privacy">privacy notice</a>.
        </span>
      </label>
      <button className="btn btn-gold btn-block" type="submit" disabled={!canSubmit}>
        {buttonLabel}
      </button>
    </form>
  );
}

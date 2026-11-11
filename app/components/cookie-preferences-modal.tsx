"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { getConsentPreferences, setConsentPreferences } from "../../src/lib/cookies";

interface CookiePreferencesModalProps {
  onClose: () => void;
  onSaved?: () => void;
  onRejected?: () => void;
}

export function CookiePreferencesModal({ onClose, onSaved, onRejected }: CookiePreferencesModalProps) {
  const uid = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => getConsentPreferences().analytics);
  const titleId = `${uid}-title`;
  const descriptionId = `${uid}-description`;
  const analyticsTitleId = `${uid}-analytics-title`;
  const analyticsDescriptionId = `${uid}-analytics-description`;

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusableSelector = "button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])";
    const focusFirst = () => dialog?.querySelector<HTMLElement>(focusableSelector)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focusable = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    focusFirst();
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  const dispatchConsentChange = (analytics: boolean) => {
    window.dispatchEvent(new CustomEvent("consent-changed", { detail: { analytics } }));
  };

  const handleSave = () => {
    setConsentPreferences({ analytics: analyticsEnabled, essential: true, timestamp: Date.now() });
    dispatchConsentChange(analyticsEnabled);
    onSaved?.();
    onClose();
  };

  const handleReject = () => {
    setConsentPreferences({ analytics: false, essential: true, timestamp: Date.now() });
    dispatchConsentChange(false);
    onRejected?.();
    onClose();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="cookie-consent-overlay" onClick={handleBackdropClick}>
      <div
        className="cookie-consent-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <button className="cookie-consent-close" onClick={onClose} aria-label="Close cookie preferences" type="button">
          <span aria-hidden="true">×</span>
        </button>

        <p className="cookie-consent-kicker">Leor Design <span aria-hidden="true">/</span> Privacy choices</p>
        <h2 className="cookie-consent-dialog-title" id={titleId}>Choose what you share.</h2>
        <p className="cookie-consent-dialog-intro" id={descriptionId}>
          Essential storage is always on so the website can work. Analytics are optional and stay off unless you enable them.
        </p>

        <div className="cookie-consent-preferences">
          <section className="cookie-consent-preference" aria-labelledby={`${uid}-essential-title`}>
            <div className="cookie-consent-preference-heading">
              <div>
                <h3 id={`${uid}-essential-title`}>Essential storage</h3>
                <p>Needed for core site functions and remembering your privacy choice.</p>
              </div>
              <span className="cookie-consent-status">Always on</span>
            </div>
          </section>

          <section className="cookie-consent-preference" aria-labelledby={analyticsTitleId}>
            <div className="cookie-consent-preference-heading">
              <div>
                <h3 id={analyticsTitleId}>Analytics</h3>
                <p id={analyticsDescriptionId}>Allows visit and interaction tracking to help us improve the website.</p>
              </div>
              <label className="cookie-consent-switch">
                <input
                  type="checkbox"
                  role="switch"
                  checked={analyticsEnabled}
                  onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                  aria-labelledby={analyticsTitleId}
                  aria-describedby={analyticsDescriptionId}
                />
                <span className="cookie-consent-switch-track" aria-hidden="true"><span /></span>
                <span className="cookie-consent-switch-state" aria-hidden="true">{analyticsEnabled ? "On" : "Off"}</span>
              </label>
            </div>
          </section>
        </div>

        <p className="cookie-consent-privacy-link"><a href="/privacy">Read the privacy notice</a></p>
        <div className="cookie-consent-dialog-actions">
          <button className="cookie-action cookie-action-quiet" onClick={handleReject} type="button">Reject all</button>
          <button className="cookie-action cookie-action-outline" onClick={onClose} type="button">Cancel</button>
          <button className="cookie-action cookie-action-primary" onClick={handleSave} type="button">Save preferences</button>
        </div>
      </div>
    </div>
  );
}

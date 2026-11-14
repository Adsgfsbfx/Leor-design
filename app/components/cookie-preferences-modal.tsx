"use client";

import { useEffect, useId, useRef, type MouseEvent } from "react";
import { setConsentPreferences } from "../../src/lib/cookies";

interface CookiePreferencesModalProps {
  onClose: () => void;
  onSaved?: () => void;
  onRejected?: () => void;
}

export function CookiePreferencesModal({ onClose, onSaved, onRejected }: CookiePreferencesModalProps) {
  const uid = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `${uid}-title`;
  const descriptionId = `${uid}-description`;

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

  const handleSave = () => {
    setConsentPreferences({ essential: true, timestamp: Date.now() });
    onSaved?.();
    onClose();
  };

  const handleReject = () => {
    setConsentPreferences({ essential: true, timestamp: Date.now() });
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
          Essential storage remembers your privacy choice and supports core site functions. This website does not collect visit analytics.
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

          <section className="cookie-consent-preference" aria-labelledby={`${uid}-analytics-title`}>
            <div className="cookie-consent-preference-heading">
              <div>
                <h3 id={`${uid}-analytics-title`}>Visit analytics</h3>
                <p>No visit or interaction activity is collected.</p>
              </div>
              <span className="cookie-consent-status">Not collected</span>
            </div>
          </section>
        </div>

        <p className="cookie-consent-privacy-link"><a href="/privacy">Read the privacy notice</a></p>
        <div className="cookie-consent-dialog-actions">
          <button className="cookie-action cookie-action-quiet" onClick={handleReject} type="button">Essential only</button>
          <button className="cookie-action cookie-action-outline" onClick={onClose} type="button">Cancel</button>
          <button className="cookie-action cookie-action-primary" onClick={handleSave} type="button">Save preferences</button>
        </div>
      </div>
    </div>
  );
}

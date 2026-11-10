"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { hasBannerBeenDismissed, setConsentPreferences } from "../../src/lib/cookies";
import { CookiePreferencesModal } from "./cookie-preferences-modal";
import "./cookie-banner.css";

function subscribeToConsentChanges(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("consent-changed", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("consent-changed", onChange);
  };
}

const getBannerSnapshot = () => !hasBannerBeenDismissed();
const getServerBannerSnapshot = () => false;

export function CookieBanner() {
  const shouldShowBanner = useSyncExternalStore(subscribeToConsentChanges, getBannerSnapshot, getServerBannerSnapshot);
  const [dismissedInView, setDismissedInView] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const handleCloseCustomize = useCallback(() => setShowCustomize(false), []);
  const handlePreferencesDone = useCallback(() => {
    setDismissedInView(true);
    setShowCustomize(false);
  }, []);

  const saveConsent = (analytics: boolean) => {
    setConsentPreferences({ analytics, essential: true, timestamp: Date.now() });
    window.dispatchEvent(new CustomEvent("consent-changed", { detail: { analytics } }));
  };

  const handleAcceptAll = () => {
    saveConsent(true);
    setDismissedInView(true);
  };

  const handleRejectAll = () => {
    saveConsent(false);
    setDismissedInView(true);
  };

  if (showCustomize) {
    return (
      <CookiePreferencesModal
        onClose={handleCloseCustomize}
        onSaved={handlePreferencesDone}
        onRejected={handlePreferencesDone}
      />
    );
  }

  if (!shouldShowBanner || dismissedInView) return null;

  return (
    <div className="cookie-consent-banner" role="region" aria-labelledby="cookie-consent-title">
      <div className="cookie-consent-inner">
        <div className="cookie-consent-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M25 7c-.5 4.7 2.7 8.2 8 8.2 0 5.3 3.3 8.5 8 8-.8 10.2-8.8 17.8-19 17.8A18.9 18.9 0 0 1 3 22C3 11.5 11.5 4 22 4c1.1 0 2.1.1 3 .3" />
            <circle cx="16" cy="18" r="1.5" /><circle cx="25" cy="28" r="1.5" /><circle cx="14" cy="31" r="1.5" />
          </svg>
        </div>
        <div className="cookie-consent-copy">
          <p className="cookie-consent-kicker">Leor Design <span aria-hidden="true">/</span> Your privacy</p>
          <h2 id="cookie-consent-title">Your privacy, your choice.</h2>
          <p className="cookie-consent-description">
            Essential storage keeps the site working. Optional analytics help us understand visits and are only enabled if you choose them. Read our <a href="/privacy">privacy notice</a>.
          </p>
        </div>
        <div className="cookie-consent-actions" role="group" aria-label="Cookie consent choices">
          <button className="cookie-action cookie-action-quiet" onClick={handleRejectAll} type="button">Reject all</button>
          <button className="cookie-action cookie-action-outline" onClick={() => setShowCustomize(true)} type="button">Customize</button>
          <button className="cookie-action cookie-action-primary" onClick={handleAcceptAll} type="button">Accept all</button>
        </div>
      </div>
    </div>
  );
}

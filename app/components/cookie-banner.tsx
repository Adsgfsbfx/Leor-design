"use client";

import { useState, useId } from "react";
import {
  getConsentPreferences,
  setConsentPreferences,
  hasBannerBeenDismissed,
} from "../../src/lib/cookies";
import "./cookie-banner.css";

export function CookieBanner() {
  const uid = useId();
  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window === "undefined") return false;
    return !hasBannerBeenDismissed();
  });
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => {
    const prefs = getConsentPreferences();
    return prefs.analytics;
  });

  // Don't render anything until hydrated
  if (!showBanner && !showCustomize) {
    return null;
  }

  const handleAcceptAll = () => {
    setConsentPreferences({ analytics: true, essential: true, timestamp: Date.now() });
    setShowBanner(false);
    setShowCustomize(false);
    // Reload tracking if needed
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("consent-changed", { detail: { analytics: true } }));
    }
  };

  const handleRejectAll = () => {
    setConsentPreferences({ analytics: false, essential: true, timestamp: Date.now() });
    setShowBanner(false);
    setShowCustomize(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("consent-changed", { detail: { analytics: false } }));
    }
  };

  const handleCustomize = () => {
    setShowCustomize(true);
  };

  const handleSaveCustom = () => {
    setConsentPreferences({
      analytics: analyticsEnabled,
      essential: true,
      timestamp: Date.now(),
    });
    setShowBanner(false);
    setShowCustomize(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("consent-changed", { detail: { analytics: analyticsEnabled } }));
    }
  };

  const handleCloseCustomize = () => {
    setShowCustomize(false);
  };

  if (showCustomize) {
    return (
      <div className="cookie-overlay">
        <div className="cookie-customize-modal">
          <button className="cookie-close-btn" onClick={handleCloseCustomize} aria-label="Close" type="button">
            ✕
          </button>

          <h2 className="cookie-modal-title">Customize Your Preferences</h2>

          <div className="cookie-preferences-list">
            <div className="cookie-preference-item">
              <div className="cookie-preference-header">
                <h3 className="cookie-preference-title">Essential Storage</h3>
                <span className="cookie-badge-essential">Always Active</span>
              </div>
              <p className="cookie-preference-description">
                Required for core website functionality. These cannot be disabled.
              </p>
            </div>

            <div className="cookie-preference-item">
              <div className="cookie-preference-header">
                <h3 className="cookie-preference-title">Analytics & Tracking</h3>
                <label className="cookie-toggle">
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                    aria-describedby={`${uid}-analytics-desc`}
                  />
                  <span className="cookie-toggle-slider"></span>
                </label>
              </div>
              <p className="cookie-preference-description" id={`${uid}-analytics-desc`}>
                Helps us understand how you use our site and improve your experience. Non-essential and can be disabled.
              </p>
            </div>
          </div>

          <div className="cookie-modal-actions">
            <button className="btn btn-secondary" onClick={handleRejectAll} type="button">
              Reject All
            </button>
            <button className="btn btn-gold" onClick={handleSaveCustom} type="button">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showBanner) {
    return (
      <div className="cookie-banner">
        <div className="cookie-banner-content">
          <div className="cookie-banner-text">
            <h2 className="cookie-banner-title">Your Privacy Matters</h2>
            <p className="cookie-banner-description">
              We use cookies to enhance your browsing experience and understand how you interact with our site.
              You can choose your preferences below.
            </p>
          </div>

          <div className="cookie-banner-actions">
            <button className="btn btn-secondary" onClick={handleRejectAll} type="button">
              Reject All
            </button>
            <button className="btn btn-secondary" onClick={handleCustomize} type="button">
              Customize
            </button>
            <button className="btn btn-gold" onClick={handleAcceptAll} type="button">
              Accept All
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

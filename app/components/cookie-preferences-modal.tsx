"use client";

import { useId, useState } from "react";
import {
  getConsentPreferences,
  setConsentPreferences,
} from "../../src/lib/cookies";

interface CookiePreferencesModalProps {
  onClose: () => void;
}

export function CookiePreferencesModal({ onClose }: CookiePreferencesModalProps) {
  const uid = useId();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => {
    const prefs = getConsentPreferences();
    return prefs.analytics;
  });

  const handleSave = () => {
    setConsentPreferences({
      analytics: analyticsEnabled,
      essential: true,
      timestamp: Date.now(),
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("consent-changed", { detail: { analytics: analyticsEnabled } }));
    }
    onClose();
  };

  return (
    <div className="cookie-overlay">
      <div className="cookie-customize-modal">
        <button className="cookie-close-btn" onClick={onClose} aria-label="Close" type="button">
          ✕
        </button>

        <h2 className="cookie-modal-title">Cookie Preferences</h2>

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
          <button className="btn btn-secondary" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="btn btn-gold" onClick={handleSave} type="button">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

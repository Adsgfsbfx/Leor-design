"use client";

import { useState } from "react";
import { CookiePreferencesModal } from "./cookie-preferences-modal";

export function CookieSettingsButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="cookie-settings-btn"
        type="button"
      >
        Cookie Settings
      </button>
      {showModal && <CookiePreferencesModal onClose={() => setShowModal(false)} />}
    </>
  );
}

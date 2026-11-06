"use client";

import { useEffect } from "react";
import { captureUtmParameters, initializeWhatsAppClickTracking } from "../../src/lib/tracking";

/**
 * TrackingInitializer: Initializes campaign and engagement tracking.
 * Must be used in a client component and placed early in the app (e.g., in layout or page).
 *
 * - Captures UTM parameters from the landing page URL on first load
 * - Sets up click tracking for WhatsApp links across the entire page
 *
 * This component does not render anything; it only sets up event listeners and storage.
 */
export function TrackingInitializer() {
  useEffect(() => {
    // Capture UTM on page load (only if not already captured)
    captureUtmParameters();

    // Initialize WhatsApp click tracking
    const cleanup = initializeWhatsAppClickTracking();

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, []);

  return null;
}

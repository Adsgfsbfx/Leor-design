"use client";

import { useEffect } from "react";
import { captureUtmParameters, initializeWhatsAppLeadClickCapture } from "../../src/lib/enquiryAttribution";

/** Keeps attribution and WhatsApp click data available to customer lead forms. */
export function EnquiryAttributionInitializer() {
  useEffect(() => {
    captureUtmParameters();
    const stopWhatsAppClickCapture = initializeWhatsAppLeadClickCapture();
    return () => stopWhatsAppClickCapture?.();
  }, []);

  return null;
}

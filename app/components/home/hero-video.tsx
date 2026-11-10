"use client";

import { useEffect, useRef } from "react";
import { subscribeMediaQuery } from "../../../src/lib/media-query";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (motionPreference.matches) {
        video.pause();
        return;
      }

      void video.play().catch(() => undefined);
    };

    // Let the page content paint before downloading the decorative background video.
    const playbackTimer = window.setTimeout(syncPlayback, 1_200);
    const unsubscribeMotionPreference = subscribeMediaQuery(motionPreference, syncPlayback);
    return () => {
      window.clearTimeout(playbackTimer);
      unsubscribeMotionPreference();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="hero-video"
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src="/videos/1000350774.mp4" type="video/mp4" />
    </video>
  );
}

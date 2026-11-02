"use client";

import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "../../../components/ui/button";
import { Magnetic } from "../../../components/ui/motion";

const heroVideos = [
  "/videos/hero-new.mp4",
  "/videos/VID_20261031_002956.mp4",
] as const;

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const retryListenersRef = useRef(false);
  const failedVideoSourcesRef = useRef(new Set<string>());
  const warnedVideosRef = useRef(new Set<string>());
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoFailures, setVideoFailures] = useState<string[]>([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let mounted = true;

    const removeRetryListeners = () => {
      if (!retryListenersRef.current) return;
      retryListenersRef.current = false;
      window.removeEventListener("pointerdown", retryPlayback);
      window.removeEventListener("touchstart", retryPlayback);
      window.removeEventListener("scroll", retryPlayback);
      window.removeEventListener("keydown", retryPlayback);
    };
    const addRetryListeners = () => {
      if (!mounted || retryListenersRef.current) return;
      retryListenersRef.current = true;
      window.addEventListener("pointerdown", retryPlayback, { passive: true });
      window.addEventListener("touchstart", retryPlayback, { passive: true });
      window.addEventListener("scroll", retryPlayback, { passive: true });
      window.addEventListener("keydown", retryPlayback);
    };
    const retryPlayback = () => {
      if (!mounted) return;
      if (failedVideoSourcesRef.current.has(video.dataset.heroSource ?? "")) return;
      video.muted = true;
      video.defaultMuted = true;
      try {
        void video.play().then(removeRetryListeners).catch(addRetryListeners);
      } catch {
        addRetryListeners();
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") retryPlayback();
    };

    video.muted = true;
    video.defaultMuted = true;
    video.addEventListener("canplay", retryPlayback);
    video.addEventListener("stalled", retryPlayback);
    video.addEventListener("waiting", retryPlayback);
    video.addEventListener("pause", retryPlayback);
    document.addEventListener("visibilitychange", onVisibilityChange);
    retryPlayback();

    return () => {
      mounted = false;
      removeRetryListeners();
      video.removeEventListener("canplay", retryPlayback);
      video.removeEventListener("stalled", retryPlayback);
      video.removeEventListener("waiting", retryPlayback);
      video.removeEventListener("pause", retryPlayback);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const advanceVideo = (currentSource: string) => {
    const currentIndex = Math.max(0, heroVideos.indexOf(currentSource as (typeof heroVideos)[number]));
    for (let offset = 1; offset <= heroVideos.length; offset += 1) {
      const nextSource = heroVideos[(currentIndex + offset) % heroVideos.length];
      if (failedVideoSourcesRef.current.has(nextSource)) continue;
      if (nextSource === currentSource) {
        const video = videoRef.current;
        if (video) {
          video.currentTime = 0;
          void video.play().catch(() => undefined);
        }
        return;
      }
      setVideoIndex(heroVideos.indexOf(nextSource));
      return;
    }
  };

  const onVideoError = (source: string) => {
    failedVideoSourcesRef.current.add(source);
    setVideoFailures((failures) => failures.includes(source) ? failures : [...failures, source]);
    if (!warnedVideosRef.current.has(source)) {
      console.warn(`Leor Design hero video '${source}' is unavailable.`);
      warnedVideosRef.current.add(source);
    }
    advanceVideo(source);
  };

  const currentVideo = heroVideos[videoIndex];

  return <section id="top" className="cinematic-hero" aria-labelledby="hero-heading">
    <div className="cinematic-image-reveal">
      <div className="cinematic-image-surface">
        <video ref={videoRef} data-hero-source={currentVideo} src={currentVideo} className={`cinematic-video-layer${videoFailures.includes(currentVideo) ? " is-failed" : ""}`} width={1920} height={1080} autoPlay muted playsInline preload="auto" disablePictureInPicture disableRemotePlayback controls={false} aria-hidden="true" tabIndex={-1} onEnded={() => advanceVideo(currentVideo)} onError={() => onVideoError(currentVideo)} />
      </div>
    </div>
    <div className="cinematic-shade" aria-hidden="true" />


    <div className="cinematic-copy">
      <p className="cinematic-eyebrow">Hebbal, Bangalore <span>·</span> Home interior</p>
      <h1 id="hero-heading" aria-label="Thoughtful homes, shaped around the way you live."><span className="cinematic-line-mask"><span>Thoughtful homes,</span></span><span className="cinematic-line-mask"><span>shaped around</span></span><span className="cinematic-line-mask"><span className="cinematic-last-line">the way you live.</span></span></h1>
      <p className="cinematic-subtext">Space planning, modular kitchens, wardrobes and finishes, designed for Bangalore homes. Start with a free conversation.</p>
      <div className="cinematic-actions">
        <Magnetic><ButtonLink href="#enquire" className="cinematic-primary">Get a free consultation</ButtonLink></Magnetic>
        <ButtonLink href="#estimator" variant="link" className="cinematic-estimate">Estimate your budget</ButtonLink>
      </div>
    </div>

  </section>;
}

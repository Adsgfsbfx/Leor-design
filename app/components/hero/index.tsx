"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "../../../components/ui/button";
import { Magnetic } from "../../../components/ui/motion";

const heroVideos = [
  "/videos/hero-new.mp4",
  "/videos/VID_20261031_002956.mp4",
] as const;

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const retryListenersRef = useRef(false);
  const failedVideoSourcesRef = useRef(new Set<string>());
  const warnedVideosRef = useRef(new Set<string>());
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoFailures, setVideoFailures] = useState<string[]>([]);
  const [touchDevice, setTouchDevice] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const scrollY = useTransform(scrollYProgress, [0, 1], reduce || touchDevice ? [0, 0] : [0, 18]);

  useEffect(() => {
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const updateTouchMode = () => setTouchDevice(coarsePointer.matches || navigator.maxTouchPoints > 0);
    updateTouchMode();
    coarsePointer.addEventListener("change", updateTouchMode);
    return () => coarsePointer.removeEventListener("change", updateTouchMode);
  }, []);

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

  return <section ref={heroRef} id="top" className="cinematic-hero" aria-labelledby="hero-heading">
    <motion.div className="cinematic-image-reveal" initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} transition={{ duration: reduce ? 0 : 1.08, delay: reduce ? 0 : .72, ease: [.22, 1, .36, 1] }}>
      <motion.div className="cinematic-image-surface" style={{ y: scrollY }}>
        <video ref={videoRef} data-hero-source={currentVideo} src={currentVideo} poster="/images/hero-living-room-marble-wall.jpg" className={`cinematic-video-layer${videoFailures.includes(currentVideo) ? " is-failed" : ""}`} width={1920} height={1080} autoPlay muted playsInline preload="auto" disablePictureInPicture disableRemotePlayback controls={false} aria-hidden="true" tabIndex={-1} onEnded={() => advanceVideo(currentVideo)} onError={() => onVideoError(currentVideo)} />
      </motion.div>
    </motion.div>
    <div className="cinematic-shade" aria-hidden="true" />

    <motion.div className="cinematic-curtain" aria-hidden="true" initial={reduce ? false : { opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: reduce ? 0 : .58, delay: reduce ? 0 : .36, ease: [.22, 1, .36, 1] }}><span>LEOR</span><i>Hebbal Â· Bangalore</i></motion.div>

    <div className="cinematic-copy">
      <motion.p className="cinematic-eyebrow" initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : .65, delay: reduce ? 0 : 1.26, ease: [.22, 1, .36, 1] }}>Hebbal, Bangalore <span>·</span> Home interior</motion.p>
      <h1 id="hero-heading" aria-label="Thoughtful homes, shaped around the way you live."><span className="cinematic-line-mask"><motion.span initial={reduce ? false : { y: "110%" }} animate={{ y: "0%" }} transition={{ duration: reduce ? 0 : .7, delay: reduce ? 0 : 1.34, ease: [.22, 1, .36, 1] }}>Thoughtful homes,</motion.span></span><span className="cinematic-line-mask"><motion.span initial={reduce ? false : { y: "110%" }} animate={{ y: "0%" }} transition={{ duration: reduce ? 0 : .7, delay: reduce ? 0 : 1.5, ease: [.22, 1, .36, 1] }}>shaped around</motion.span></span><span className="cinematic-line-mask"><motion.span className="cinematic-last-line" initial={reduce ? false : { y: "110%" }} animate={{ y: "0%" }} transition={{ duration: reduce ? 0 : .7, delay: reduce ? 0 : 1.66, ease: [.22, 1, .36, 1] }}>the way you live.</motion.span></span></h1>
      <motion.p className="cinematic-subtext" initial={reduce ? false : { opacity: 0, y: 13 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : .68, delay: reduce ? 0 : 2.02, ease: [.22, 1, .36, 1] }}>Space planning, modular kitchens, wardrobes and finishes, designed for Bangalore homes. Start with a free conversation.</motion.p>
      <motion.div className="cinematic-actions" initial={reduce ? false : { opacity: 0, y: 13 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : .68, delay: reduce ? 0 : 2.14, ease: [.22, 1, .36, 1] }}>
        <Magnetic><ButtonLink href="#enquire" className="cinematic-primary">Get a free consultation</ButtonLink></Magnetic>
        <ButtonLink href="#estimator" variant="link" className="cinematic-estimate">Estimate your budget</ButtonLink>
      </motion.div>
    </div>

  </section>;
}

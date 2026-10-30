"use client";

import { motion, useReducedMotion, useScroll, useTransform, type HTMLMotionProps } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { editorialEase, motionDistance, motionDuration } from "../../lib/motion";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return <span className={`block overflow-hidden ${className}`}><motion.span className="block" initial={reduce ? false : { y: "110%" }} whileInView={{ y: "0%" }} viewport={{ once: true, amount: .7 }} transition={{ duration: reduce ? 0 : motionDuration.reveal, delay: reduce ? 0 : delay, ease: editorialEase }}>{children}</motion.span></span>;
}

export function FadeUp({ children, className = "", delay = 0, ...props }: HTMLMotionProps<"div"> & { delay?: number }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: motionDistance.fadeUp }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: reduce ? 0 : motionDuration.fade, delay: reduce ? 0 : delay, ease: editorialEase }} {...props}>{children}</motion.div>;
}

export function ImageReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { clipPath: "inset(18% 0 0 0)" }} whileInView={{ clipPath: "inset(0% 0 0 0)" }} viewport={{ once: true, amount: .25 }} transition={{ duration: reduce ? 0 : motionDuration.image, delay: reduce ? 0 : delay, ease: editorialEase }}>{children}</motion.div>;
}

export function Magnetic({ children, className = "", strength = 12 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--magnetic-x", `${(event.clientX - rect.left - rect.width / 2) / rect.width * strength}px`);
    ref.current.style.setProperty("--magnetic-y", `${(event.clientY - rect.top - rect.height / 2) / rect.height * strength}px`);
  };
  const reset = () => { if (ref.current) { ref.current.style.setProperty("--magnetic-x", "0px"); ref.current.style.setProperty("--magnetic-y", "0px"); } };
  return <div ref={ref} onMouseMove={handleMove} onMouseLeave={reset} className={`magnetic-wrap ${className}`}>{children}</div>;
}

export function Parallax({ children, className = "", distance = motionDistance.parallax }: { children: ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-distance, distance]);
  return <motion.div ref={ref} className={className} style={{ y }}>{children}</motion.div>;
}

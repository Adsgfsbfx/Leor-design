"use client";

import Lenis, { type ScrollToOptions } from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

type ScrollTarget = number | string | Element;
type PendingScroll = { target: ScrollTarget; options?: ScrollToOptions };
type ScrollControls = {
  scrollTo: (target: ScrollTarget, options?: ScrollToOptions) => void;
  setScrollLock: (token: symbol, locked: boolean) => void;
};

const ScrollContext = createContext<ScrollControls>({
  scrollTo: () => undefined,
  setScrollLock: () => undefined,
});

const easing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const locksRef = useRef(new Set<symbol>());
  const pendingScrollRef = useRef<PendingScroll | null>(null);
  const previousPathRef = useRef(pathname);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  const scrollTo = useCallback((target: ScrollTarget, options?: ScrollToOptions) => {
    if (locksRef.current.size > 0) {
      pendingScrollRef.current = { target, options };
      return;
    }
    lenisRef.current?.scrollTo(target, options);
  }, []);

  const setScrollLock = useCallback((token: symbol, locked: boolean) => {
    const locks = locksRef.current;
    if (locked) {
      if (locks.has(token)) return;
      const wasUnlocked = locks.size === 0;
      locks.add(token);
      if (wasUnlocked) {
        if (lenisRef.current) lenisRef.current.stop();
        else document.documentElement.classList.add("lenis", "lenis-stopped");
      }
      return;
    }

    if (!locks.delete(token) || locks.size > 0) return;
    if (lenisRef.current) lenisRef.current.start();
    else document.documentElement.classList.remove("lenis", "lenis-stopped");

    const pending = pendingScrollRef.current;
    pendingScrollRef.current = null;
    if (pending) {
      requestAnimationFrame(() => {
        if (locksRef.current.size === 0) lenisRef.current?.scrollTo(pending.target, pending.options);
      });
    }
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const noHover = window.matchMedia("(hover: none)");
    let frameId = 0;

    const destroyLenis = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      const current = lenisRef.current;
      lenisRef.current = null;
      current?.destroy();
      setLenis(null);
      if (locksRef.current.size > 0) document.documentElement.classList.add("lenis", "lenis-stopped");
      else document.documentElement.classList.remove("lenis", "lenis-stopped");
    };

    const createLenis = () => {
      if (lenisRef.current) return;
      const current = new Lenis({
        duration: 1.2,
        easing,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        syncTouch: false,
        autoRaf: false,
      });
      lenisRef.current = current;
      setLenis(current);
      if (locksRef.current.size > 0) current.stop();
      const raf = (time: number) => {
        current.raf(time);
        frameId = requestAnimationFrame(raf);
      };
      frameId = requestAnimationFrame(raf);
    };

    const syncScrollingMode = () => {
      const touchDevice = coarsePointer.matches || (navigator.maxTouchPoints > 0 && noHover.matches);
      if (reducedMotion.matches || touchDevice) destroyLenis();
      else createLenis();
    };

    syncScrollingMode();
    reducedMotion.addEventListener("change", syncScrollingMode);
    coarsePointer.addEventListener("change", syncScrollingMode);
    noHover.addEventListener("change", syncScrollingMode);
    return () => {
      reducedMotion.removeEventListener("change", syncScrollingMode);
      coarsePointer.removeEventListener("change", syncScrollingMode);
      noHover.removeEventListener("change", syncScrollingMode);
      destroyLenis();
    };
  }, []);

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const resetScroll = () => {
      if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
      else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      resetScroll();
    } else {
      resetScroll();
    }

    return () => { window.history.scrollRestoration = previousRestoration; };
  }, [pathname]);

  useEffect(() => {
    const onAnchorClick = (event: MouseEvent) => {
      const current = lenisRef.current;
      if (!current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href^='#']");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      let element: HTMLElement | null = null;
      try { element = document.getElementById(decodeURIComponent(href.slice(1))); }
      catch { return; }
      if (!element) return;

      event.preventDefault();
      if (window.location.hash !== href) window.history.pushState(null, "", href);
      scrollTo(href === "#top" ? 0 : element, { offset: href === "#top" ? 0 : -80, duration: 1.4 });
    };

    document.addEventListener("click", onAnchorClick);
    return () => document.removeEventListener("click", onAnchorClick);
  }, [lenis, scrollTo]);

  const controls = useMemo(() => ({ scrollTo, setScrollLock }), [scrollTo, setScrollLock]);
  return <ScrollContext.Provider value={controls}>{children}</ScrollContext.Provider>;
}

export function useSmoothScroll() {
  return useContext(ScrollContext);
}

export function useScrollLock(locked: boolean) {
  const { setScrollLock } = useSmoothScroll();
  const tokenRef = useRef(Symbol("scroll-lock"));

  useEffect(() => {
    setScrollLock(tokenRef.current, locked);
    return () => setScrollLock(tokenRef.current, false);
  }, [locked, setScrollLock]);
}

"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { subscribeMediaQuery } from "../../../src/lib/media-query";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

export default function TestimonialsCarousel({ reviews }: { reviews: Testimonial[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedUntilRef = useRef(0);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const touchRef = useRef(false);
  const [currentReview, setCurrentReview] = useState(0);
  const [canAutoplay, setCanAutoplay] = useState(false);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateAutoplay = () => setCanAutoplay(!reducedMotionQuery.matches);
    updateAutoplay();
    return subscribeMediaQuery(reducedMotionQuery, updateAutoplay);
  }, []);

  const updateCurrentReview = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || reviews.length === 0) return;

    const firstLoop = track.querySelector<HTMLElement>(".testimonial-loop:not([aria-hidden='true'])");
    const loopWidth = firstLoop?.offsetWidth ?? 0;
    if (!firstLoop || loopWidth === 0) return;
    if (viewport.scrollLeft >= loopWidth) viewport.scrollLeft %= loopWidth;

    const viewportLeft = viewport.getBoundingClientRect().left;
    const cards = firstLoop.querySelectorAll<HTMLElement>(".testimonial-card");
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - viewportLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setCurrentReview((current) => current === nearestIndex ? current : nearestIndex);
  }, [reviews.length]);

  useEffect(() => {
    if (!canAutoplay || reviews.length < 2) return;

    const viewport = viewportRef.current;
    const firstLoop = trackRef.current?.querySelector<HTMLElement>(".testimonial-loop:not([aria-hidden='true'])");
    if (!viewport || !firstLoop) return;

    let frame = 0;
    let previousTime = 0;
    const pixelsPerMillisecond = 0.032;

    const move = (time: number) => {
      if (previousTime === 0) previousTime = time;
      const elapsed = Math.min(time - previousTime, 48);
      previousTime = time;

      const loopWidth = firstLoop.offsetWidth;
      const paused = hoverRef.current || focusRef.current || touchRef.current || document.visibilityState !== "visible" || time < pausedUntilRef.current;
      if (!paused && loopWidth > 0) {
        viewport.scrollLeft += elapsed * pixelsPerMillisecond;
        if (viewport.scrollLeft >= loopWidth) viewport.scrollLeft -= loopWidth;
        updateCurrentReview();
      }

      frame = window.requestAnimationFrame(move);
    };

    frame = window.requestAnimationFrame(move);
    return () => window.cancelAnimationFrame(frame);
  }, [canAutoplay, reviews.length, updateCurrentReview]);

  const goToReview = (reviewIndex: number) => {
    const viewport = viewportRef.current;
    const card = trackRef.current?.querySelectorAll<HTMLElement>(".testimonial-card")[reviewIndex];
    if (!viewport || !card) return;

    pausedUntilRef.current = performance.now() + 5000;
    viewport.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    setCurrentReview(reviewIndex);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToReview((currentReview - 1 + reviews.length) % reviews.length);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToReview((currentReview + 1) % reviews.length);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) focusRef.current = false;
  };

  const cards = (duplicate = false) => (
    <ul
      className="testimonial-grid testimonial-loop"
      aria-hidden={duplicate || undefined}
      key={duplicate ? "duplicate" : "original"}
    >
      {reviews.map((review) => (
        <li className="testimonial-card" key={review.name}>
          <figure className="testimonial-figure">
            <blockquote>{review.quote}</blockquote>
            <figcaption className="testimonial-person">
              <p className="testimonial-name">{review.name}</p>
              <p className="testimonial-role">{review.role}</p>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <div
        ref={viewportRef}
        className="testimonial-slider"
        role="region"
        aria-label="Client testimonials"
        tabIndex={0}
        onScroll={updateCurrentReview}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => { hoverRef.current = true; }}
        onMouseLeave={() => { hoverRef.current = false; }}
        onFocus={() => { focusRef.current = true; }}
        onBlur={handleBlur}
        onTouchStart={() => { touchRef.current = true; pausedUntilRef.current = performance.now() + 5000; }}
        onTouchMove={() => { pausedUntilRef.current = performance.now() + 5000; }}
        onTouchEnd={() => { touchRef.current = false; pausedUntilRef.current = performance.now() + 5000; }}
        onTouchCancel={() => { touchRef.current = false; pausedUntilRef.current = performance.now() + 5000; }}
      >
        <div className="testimonial-track" ref={trackRef}>
          {cards()}
          {cards(true)}
        </div>
      </div>
    </>
  );
}

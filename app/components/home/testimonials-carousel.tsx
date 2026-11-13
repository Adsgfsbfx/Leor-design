"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type FocusEvent } from "react";

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
  const [currentReview, setCurrentReview] = useState(0);
  const [canAutoplay, setCanAutoplay] = useState(false);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateAutoplay = () => setCanAutoplay(!reducedMotionQuery.matches);

    updateAutoplay();
    reducedMotionQuery.addEventListener("change", updateAutoplay);
    return () => {
      reducedMotionQuery.removeEventListener("change", updateAutoplay);
    };
  }, []);

  const updateCurrentReview = useCallback(() => {
    const viewport = viewportRef.current;
    const firstLoop = trackRef.current?.querySelector<HTMLElement>(".testimonial-loop:not([aria-hidden='true'])");
    if (!viewport || !firstLoop || reviews.length === 0) return;

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

    setCurrentReview(nearestIndex);
  }, [reviews.length]);

  useEffect(() => {
    if (!canAutoplay) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    let frame = 0;
    let previousTime = 0;
    const pixelsPerMillisecond = 0.042;

    const move = (time: number) => {
      if (previousTime === 0) previousTime = time;
      const elapsed = Math.min(time - previousTime, 48);
      previousTime = time;

      const firstLoop = track.querySelector<HTMLElement>(".testimonial-loop:not([aria-hidden='true'])");
      const loopWidth = firstLoop?.offsetWidth ?? 0;
      const paused = hoverRef.current || focusRef.current || time < pausedUntilRef.current;

      if (!paused && loopWidth > 0) {
        viewport.scrollLeft += elapsed * pixelsPerMillisecond;
        if (viewport.scrollLeft >= loopWidth) viewport.scrollLeft -= loopWidth;
        updateCurrentReview();
      }

      frame = window.requestAnimationFrame(move);
    };

    frame = window.requestAnimationFrame(move);
    return () => window.cancelAnimationFrame(frame);
  }, [canAutoplay, updateCurrentReview]);

  const goToReview = (reviewIndex: number) => {
    const viewport = viewportRef.current;
    const firstLoop = trackRef.current?.querySelector<HTMLElement>(".testimonial-loop:not([aria-hidden='true'])");
    const card = firstLoop?.querySelectorAll<HTMLElement>(".testimonial-card")[reviewIndex];
    if (!viewport || !card) return;

    pausedUntilRef.current = performance.now() + 2800;
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

  const cards = (duplicate: boolean) => (
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
        onTouchStart={() => { pausedUntilRef.current = performance.now() + 2800; }}
        onTouchMove={() => { pausedUntilRef.current = performance.now() + 2800; }}
        onTouchEnd={() => { pausedUntilRef.current = performance.now() + 2800; }}
      >
        <div className="testimonial-track" ref={trackRef}>
          {cards(false)}
          {cards(true)}
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

export default function TestimonialsCarousel({ reviews }: { reviews: Testimonial[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  const getCurrentReview = () => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || reviews.length === 0) return 0;

    const viewportLeft = viewport.getBoundingClientRect().left;
    const cards = track.querySelectorAll<HTMLElement>(".testimonial-card");
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - viewportLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index % reviews.length;
      }
    });

    return nearestIndex;
  };

  const pauseAutoplay = () => {
    if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = null;
    trackRef.current?.classList.add("is-paused");
    setIsAutoplayPaused(true);
  };

  const resumeAutoplayAfterInteraction = () => {
    if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      trackRef.current?.classList.remove("is-paused");
      resumeTimerRef.current = null;
      setIsAutoplayPaused(false);
    }, 5000);
  };

  useEffect(() => () => {
    if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current);
  }, []);

  const goToReview = (reviewIndex: number, direction: -1 | 1) => {
    if (reviews.length < 2) return;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    pauseAutoplay();
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".testimonial-card"));
    const candidates = cards.filter((_, index) => index % reviews.length === reviewIndex);
    if (candidates.length === 0) return;

    const viewportLeft = viewport.getBoundingClientRect().left;
    const card = direction > 0
      ? candidates.find((candidate) => candidate.getBoundingClientRect().left >= viewportLeft) ?? candidates[candidates.length - 1]
      : [...candidates].reverse().find((candidate) => candidate.getBoundingClientRect().left < viewportLeft) ?? candidates[0];
    const targetLeft = viewport.scrollLeft + card.getBoundingClientRect().left - viewport.getBoundingClientRect().left;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    viewport.scrollTo({ left: targetLeft, behavior });
    resumeAutoplayAfterInteraction();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToReview((getCurrentReview() - 1 + reviews.length) % reviews.length, -1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToReview((getCurrentReview() + 1) % reviews.length, 1);
    }
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
        onKeyDown={handleKeyDown}
        onTouchStart={pauseAutoplay}
        onTouchEnd={resumeAutoplayAfterInteraction}
        onTouchCancel={resumeAutoplayAfterInteraction}
      >
        <div className={`testimonial-track${reviews.length > 1 ? " is-autoplaying" : ""}${isAutoplayPaused ? " is-paused" : ""}`} ref={trackRef}>
          {cards()}
          {cards(true)}
        </div>
      </div>
    </>
  );
}

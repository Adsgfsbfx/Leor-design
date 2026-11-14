"use client";

import { useRef, type KeyboardEvent } from "react";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

export default function TestimonialsCarousel({ reviews }: { reviews: Testimonial[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport || reviews.length < 2) return;

    const cards = Array.from(viewport.querySelectorAll<HTMLElement>(".testimonial-card"));
    if (!cards.length) return;
    const viewportLeft = viewport.getBoundingClientRect().left;
    const currentIndex = cards.reduce((closestIndex, card, index) => {
      const currentDistance = Math.abs(cards[closestIndex].getBoundingClientRect().left - viewportLeft);
      const nextDistance = Math.abs(card.getBoundingClientRect().left - viewportLeft);
      return nextDistance < currentDistance ? index : closestIndex;
    }, 0);
    const nextIndex = (currentIndex + direction + cards.length) % cards.length;
    const target = cards[nextIndex];
    const left = viewport.scrollLeft + target.getBoundingClientRect().left - viewportLeft;
    viewport.scrollTo({
      left,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  };

  return (
    <div className="testimonial-carousel">
      <div
        ref={viewportRef}
        className="testimonial-slider"
        role="region"
        aria-label="Client testimonials"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <ul className="testimonial-grid">
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
      </div>
      <div className="testimonial-controls" role="group" aria-label="Testimonial controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous testimonials">‹</button>
        <button type="button" onClick={() => move(1)} aria-label="Next testimonials">›</button>
      </div>
    </div>
  );
}

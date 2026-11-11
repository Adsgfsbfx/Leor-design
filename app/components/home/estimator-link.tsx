"use client";

import type { MouseEvent, ReactNode } from "react";
import { useSmoothScroll } from "../../../components/smooth-scroll";

export function EstimatorLink({
  label,
  home,
  children,
}: {
  label: string;
  home?: string;
  children: ReactNode;
}) {
  const { scrollTo } = useSmoothScroll();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = document.getElementById("estimator");
    if (!target) return;

    event.preventDefault();
    if (window.location.hash !== "#estimator") window.history.pushState(null, "", "#estimator");
    scrollTo(target, { offset: -96, duration: 1.2 });
  };

  return (
    <a className="compact-budget-cta compact-budget-foot" href="#estimator" data-home={home} aria-label={label} onClick={handleClick}>
      {children}
    </a>
  );
}

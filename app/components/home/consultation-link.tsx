"use client";

import type { MouseEvent, ReactNode } from "react";
import { useSmoothScroll } from "../../../components/smooth-scroll";

export function ConsultationLink({
  href = "#enquire",
  className,
  label,
  children,
}: {
  href?: string;
  className: string;
  label: string;
  children: ReactNode;
}) {
  const { scrollTo } = useSmoothScroll();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (!href.startsWith("#")) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    if (window.location.hash !== href) window.history.pushState(null, "", href);
    scrollTo(target, { offset: -96, duration: 1.2 });
  };

  return <a className={className} href={href} aria-label={label} onClick={handleClick}>{children}</a>;
}

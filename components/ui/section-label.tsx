import type { HTMLAttributes } from "react";

type SectionLabelProps = HTMLAttributes<HTMLParagraphElement> & { children: React.ReactNode };

export function SectionLabel({ children, className = "", ...props }: SectionLabelProps) {
  return <p className={`flex items-center gap-3 text-[10px] font-medium uppercase tracking-[.2em] text-navy/75 ${className}`} {...props}><span aria-hidden="true" className="h-px w-8 bg-gold/70" />{children}</p>;
}

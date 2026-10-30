import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "link";
type Shared = { variant?: Variant; children: ReactNode; className?: string };
type ButtonProps = Shared & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type LinkProps = Shared & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const styles: Record<Variant, string> = {
  primary: "border border-navy bg-navy text-ivory-soft hover:border-b-gold hover:bg-navy-soft",
  outline: "border-2 border-navy/30 text-navy hover:border-gold hover:bg-navy hover:text-ivory-soft",
  link: "border-b border-navy/30 px-0 text-navy hover:border-gold",
};

const base = "group inline-flex min-h-12 items-center justify-center gap-4 px-5 text-sm transition-all duration-300 ease-editorial focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

function Arrow() {
  return <span aria-hidden="true" className="relative inline-flex w-4 overflow-hidden"><span className="transition-transform duration-300 ease-editorial group-hover:translate-x-5">↗</span><span className="absolute -translate-x-5 transition-transform duration-300 ease-editorial group-hover:translate-x-0">↗</span></span>;
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return <button className={`${base} ${styles[variant]} ${className}`} {...props}>{children}<Arrow /></button>;
}

export function ButtonLink({ variant = "primary", className = "", children, ...props }: LinkProps) {
  return <a className={`${base} ${styles[variant]} ${className}`} {...props}>{children}<Arrow /></a>;
}

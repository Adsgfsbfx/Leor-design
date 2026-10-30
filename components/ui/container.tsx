import type { HTMLAttributes } from "react";

export function Container({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mx-auto w-full max-w-shell px-5 sm:px-8 lg:px-12 2xl:px-16 ${className}`} {...props} />;
}

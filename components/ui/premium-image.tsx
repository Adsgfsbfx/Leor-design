"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const blurDataURL = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

type PremiumImageProps = Omit<ImageProps, "fill" | "sizes" | "quality" | "placeholder" | "blurDataURL"> & {
  sizes: string;
  ratio?: string;
  variant?: "default" | "arch";
  overlay?: boolean;
  fit?: "cover" | "contain";
  unconstrained?: boolean;
  children?: React.ReactNode;
};

export function PremiumImage({ src, alt, sizes, ratio = "4 / 5", variant = "default", overlay = false, fit = "cover", unconstrained = false, className = "", children, onLoad, ...props }: PremiumImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={`premium-image-frame premium-image-${variant}${overlay ? " has-bottom-overlay" : ""}${unconstrained ? " premium-image-unconstrained" : ""} ${className}`.trim()}
      style={{ aspectRatio: ratio }}
    >
      <Image
        {...props}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={85}
        placeholder="blur"
        blurDataURL={blurDataURL}
        className={`premium-image${loaded ? " is-loaded" : ""}`}
        style={{ objectFit: fit }}
        onLoad={(event) => { setLoaded(true); onLoad?.(event); }}
      />
      {children ? <div className="premium-image-content">{children}</div> : null}
    </div>
  );
}

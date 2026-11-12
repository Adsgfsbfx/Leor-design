import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { site } from "../src/config/site";
import { SmoothScrollProvider } from "../components/smooth-scroll";
import { TrackingInitializer } from "./components/tracking-initializer";
import { CookieBanner } from "./components/cookie-banner";
import "./globals.css";

const inter = localFont({
  src: "../public/fonts/inter-latin.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const cormorant = localFont({
  src: [
    { path: "../public/fonts/cormorant-garamond-latin.woff2", weight: "300 500", style: "normal" },
    { path: "../public/fonts/cormorant-garamond-italic-latin.woff2", weight: "300 500", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const homepageTitle = `Luxury Interior Designers in Bangalore | ${site.companyName}`;
const homepageDescription =
  "Explore luxury home interiors in Bangalore by Leor Design in Hebbal, from space planning and modular kitchens to wardrobes and considered finishes.";
const socialImage = {
  url: "/images/hero-living-room-marble-wall.jpg",
  alt: "Illustrative stock interior photo; not a completed Leor Design project.",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://leordesign.com"),
  alternates: {
    canonical: "/",
  },
  title: homepageTitle,
  description: homepageDescription,
  openGraph: {
    type: "website",
    url: "https://leordesign.com/",
    siteName: site.companyName,
    title: homepageTitle,
    description: homepageDescription,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: homepageTitle,
    description: homepageDescription,
    images: [socialImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <TrackingInitializer />
        <SmoothScrollProvider>
          {children}
          <CookieBanner />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

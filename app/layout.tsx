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

export const metadata: Metadata = {
  metadataBase: new URL("https://leordesign.com"),
  alternates: {
    canonical: "/",
  },
  title: `${site.companyName} | Luxury Interior Design in Bangalore`,
  description:
    "Explore luxury home interiors in Bangalore, with space planning, modular kitchens, wardrobes, finishes and indicative budget guidance from Leor Design in Hebbal.",
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

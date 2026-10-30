import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { site } from "../src/config/site";
import { SmoothScrollProvider } from "../components/smooth-scroll";
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
  title: `${site.companyName} | Home Interiors in Hebbal, Bangalore`,
  description:
    "Thoughtful home interiors in Bangalore. Explore illustrative spaces, finishes, provisional budget ranges, and design services from Leor Design in Hebbal.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body><SmoothScrollProvider>{children}</SmoothScrollProvider></body>
    </html>
  );
}

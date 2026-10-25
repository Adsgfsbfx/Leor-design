import type { Metadata } from "next";
import { Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { site } from "../src/config/site";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.companyName} | Home Interiors in Hebbal, Bangalore`,
  description:
    "Thoughtful home interiors in Bangalore. Explore illustrative spaces, finishes, provisional budget ranges, and design services from Leor Design in Hebbal.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${hankenGrotesk.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}

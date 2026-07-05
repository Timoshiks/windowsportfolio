import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Vindö | Premium Architectural Glazing & High-End Windows",
  description: "Precision-engineered Scandinavian timber-aluminum windows, panoramic glass facades, and structural glazing for modern luxury residences.",
  keywords: "Vindö, premium windows, custom glazing, sliding glass doors, Scandinavian design, architectural glass, energy-efficient glazing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}>
      <body className="bg-canvas text-ink font-body antialiased selection:bg-brand/20 selection:text-brand-dark">
        {children}
      </body>
    </html>
  );
}

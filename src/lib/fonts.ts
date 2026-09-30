import { IBM_Plex_Sans_Arabic, Inter, Manrope, Space_Grotesk } from "next/font/google";

export const fontInter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-arabic",
  // Loaded on demand: English pages never download it.
  preload: false,
});

export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const fontUi = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
  preload: false,
});

export const fontVariables = [fontInter, fontArabic, fontDisplay, fontUi]
  .map((f) => f.variable)
  .join(" ");

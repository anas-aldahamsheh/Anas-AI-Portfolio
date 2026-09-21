import { Inter, IBM_Plex_Sans_Arabic, Sora, Manrope } from "next/font/google";

export const fontInter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const fontIBMPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-arabic",
});

export const fontSora = Sora({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-sora",
});

export const fontManrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-manrope",
});


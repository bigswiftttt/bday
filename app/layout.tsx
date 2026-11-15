import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter, Great_Vibes } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-greatvibes",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Happy Birthday",
  description: "Something small, made for you.",
};

export const viewport: Viewport = {
  themeColor: "#0d0910",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${inter.variable} ${greatVibes.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
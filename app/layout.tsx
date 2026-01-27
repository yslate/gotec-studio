import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GOTEC Records",
    template: "%s | GOTEC Records",
  },
  description: "Recording Sessions Booking - Buche deinen Platz bei exklusiven Recording Sessions im GOTEC DJ-Studio Karlsruhe",
  keywords: ["GOTEC", "Records", "DJ", "Studio", "Karlsruhe", "Recording", "Booking"],
  authors: [{ name: "GOTEC Records" }],
  openGraph: {
    title: "GOTEC Records",
    description: "Recording Sessions Booking - Buche deinen Platz bei exklusiven Recording Sessions",
    type: "website",
    locale: "de_DE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${jetbrainsMono.variable} dark`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

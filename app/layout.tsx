import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="de" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

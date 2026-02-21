import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GOTEC Records",
    template: "%s | GOTEC Records",
  },
  description: "Recording Sessions Booking - Book your spot at exclusive recording sessions at GOTEC DJ Studio Karlsruhe",
  keywords: ["GOTEC", "Records", "DJ", "Studio", "Karlsruhe", "Recording", "Booking"],
  authors: [{ name: "GOTEC Records" }],
  openGraph: {
    title: "GOTEC Records",
    description: "Recording Sessions Booking - Book your spot at exclusive recording sessions",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

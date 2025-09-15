import type { Metadata } from "next";
import { Literata, PT_Sans } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const ptSans = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pt-sans',
  weight: ['400', '700'],
});

const literata = Literata({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-literata',
  style: ['normal', 'italic'],
  axes: ['opsz']
});

export const metadata: Metadata = {
  title: "BiblioTrack",
  description: "Your personal library assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ptSans.variable} ${literata.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

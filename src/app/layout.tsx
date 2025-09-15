import type { Metadata } from "next";
import { PT_Sans, Literata } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: '--font-pt-sans',
});
const literata = Literata({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: '--font-literata',
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${ptSans.variable} ${literata.variable} font-body antialiased min-h-screen bg-background`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

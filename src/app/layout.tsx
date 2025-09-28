import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: "BiblioTrack",
  description: "Tu asistente personal de biblioteca.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${poppins.className} antialiased min-h-screen bg-background`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

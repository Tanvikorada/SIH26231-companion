import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "NCB Advanced Analytics",
  description: "Next-Gen Field Drug Testing Infrastructure",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0F2862",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} font-sans bg-slate-50 text-slate-900 min-h-screen selection:bg-gov-blue selection:text-white`}>
        {/* Ultra-modern subtle top gradient strip representing India */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gov-orange via-white to-gov-green opacity-90 shadow-sm z-50 fixed top-0" />
        
        <main className="pt-1.5 min-h-screen flex flex-col relative">
          {/* Subtle noise/grid background pattern for depth */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
          
          <div className="relative z-10 flex-1">
            {children}
          </div>
        </main>
        
        <Toaster position="top-center" richColors theme="light" />
        
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}

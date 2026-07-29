import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Serif_Display, Vazirmatn } from "next/font/google";

import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#100c0c",
};

export const metadata: Metadata = {
  // Guest links must never be indexed or crawled.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Farsi / RTL is the default; the toggle updates these attributes at runtime.
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${cormorant.variable} ${dmSerif.variable}`}>
      <head>
        {/*
          Applies ?lang=en before first paint so the page never flashes RTL.
          Static string, no interpolation - nothing user-controlled is injected.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(new URLSearchParams(location.search).get('lang')==='en'){var e=document.documentElement;e.lang='en';e.dir='ltr';}}catch(e){}})();",
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

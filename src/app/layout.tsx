import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Serif_Display, Lalezar, Vazirmatn } from "next/font/google";

import "./globals.css";

/** Body + UI text in Farsi. */
const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-vazirmatn",
  display: "swap",
});

/**
 * Decorative Persian face for the couple's names and the big section titles.
 * To use a different one, swap this import and the `--font-fa-display` value in
 * globals.css - nothing else in the app references it.
 */
const lalezar = Lalezar({
  subsets: ["arabic", "latin"],
  weight: ["400"],
  variable: "--font-lalezar",
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
  themeColor: "#fbf4ec",
};

export const metadata: Metadata = {
  // Guest links must never be indexed or crawled.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Farsi / RTL is the default; the toggle updates these attributes at runtime.
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${lalezar.variable} ${cormorant.variable} ${dmSerif.variable}`}
    >
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

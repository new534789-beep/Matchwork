import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Matchwork — Vos bourses, vos dossiers",
  description:
    "Trouvez des bourses d'études adaptées à votre profil et générez votre dossier de candidature complet et personnalisé.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        {/* Applique le thème avant le premier rendu pour éviter le flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mw-theme')||'dark';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t}catch(e){}})()`
              + `;if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

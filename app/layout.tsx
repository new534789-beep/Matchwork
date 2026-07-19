import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { GenerationProvider } from "@/lib/generation/GenerationContext";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const SITE_URL = getSiteUrl();

// Données structurées Organization — présentes sur tout le site pour ancrer
// l'entité "Matchwork" auprès de Google et des moteurs génératifs (IA).
const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Matchwork",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Plateforme qui trouve des bourses, emplois, stages et appels à projets pour les candidats d'Afrique de l'Ouest et génère leur dossier de candidature (CV, lettre) avec l'IA.",
  areaServed: {
    "@type": "Place",
    name: "Afrique de l'Ouest",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Matchwork — Bourses et emplois en Afrique de l'Ouest",
    template: "%s | Matchwork",
  },
  description:
    "Trouvez bourses, emplois et stages adaptés à votre profil, et générez votre CV et lettre de motivation avec l'IA. Pour l'Afrique de l'Ouest.",
  applicationName: "Matchwork",
  keywords: [
    "bourses d'études", "bourses Afrique de l'Ouest", "offres d'emploi",
    "stages", "appels à projets", "CV IA", "lettre de motivation",
    "Campus France", "candidature", "Bénin", "Sénégal", "Togo",
  ],
  authors: [{ name: "Matchwork" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Matchwork",
    title: "Matchwork — Bourses, emplois et dossiers de candidature en Afrique de l'Ouest",
    description:
      "Trouvez vos opportunités et générez vos dossiers de candidature avec l'IA. Bourses, emplois, stages, appels à projets pour l'Afrique de l'Ouest.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Matchwork",
    description: "Bourses, emplois et dossiers de candidature générés par l'IA pour l'Afrique de l'Ouest.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }} />
        {/* Applique le thème avant le premier rendu pour éviter le flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mw-theme')||'light';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t}catch(e){}})()`
              // Le service worker ne doit tourner qu'en prod : en dev, Turbopack change
              // les noms de chunks à chaque rebuild, et un SW actif les sert depuis son
              // propre cache (persiste même après fermeture d'onglet / hard-refresh) →
              // ChunkLoadError en boucle. En dev on désinscrit systématiquement tout SW
              // déjà enregistré lors d'une session précédente (avant ce correctif).
              + (process.env.NODE_ENV === "production"
                ? `;if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`
                : `;if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})})}`),
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-full flex flex-col">
        <ThemeProvider>
          <GenerationProvider>
            {children}
          </GenerationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

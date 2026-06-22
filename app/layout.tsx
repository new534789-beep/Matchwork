import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Matchwork — Vos bourses, vos dossiers",
  description:
    "Trouvez des bourses d'études adaptées à votre profil et générez votre dossier de candidature complet et personnalisé.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900 min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}

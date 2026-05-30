import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jetBrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TopChef — La Gazette Culinaire",
  description:
    "Une recherche, six cuisines. Trouvez votre recette idéale sur Marmiton, 750g, Cuisine Actuelle, Cuisine AZ, Marie Claire et Moulinex, dans une seule mise en page.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "TopChef",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#8C2612",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${instrumentSans.variable} ${jetBrains.variable} antialiased`}
    >
      <body className="min-h-screen bg-cream text-ink selection:bg-brique/90 selection:text-cream">
        {children}
      </body>
    </html>
  );
}

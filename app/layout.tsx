import type { Metadata, Viewport } from "next";
import { Anton, Barlow, Barlow_Condensed } from "next/font/google";
import { AppNav } from "@/components/AppNav";
import "./globals.css";

const anton = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-cond",
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TopChef — six brigades, une recherche",
  description:
    "Cherchez un plat ou partez de vos ingrédients : les recettes de Marmiton, 750g, Cuisine Actuelle, Cuisine AZ, Marie Claire et Moulinex dans une seule mise en page.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "TopChef",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${anton.variable} ${barlowCondensed.variable} ${barlow.variable} antialiased`}
    >
      <body className="min-h-screen">
        <AppNav />
        {children}
      </body>
    </html>
  );
}

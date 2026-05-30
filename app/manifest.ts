import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TopChef — La Gazette Culinaire",
    short_name: "TopChef",
    description:
      "Une recherche, six cuisines. Comparez vos recettes préférées en un coup d'œil.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F5EFE0",
    theme_color: "#8C2612",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

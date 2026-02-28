import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flourish",
    short_name: "Flourish",
    description: "Your personal sourdough baking companion",
    start_url: "/",
    display: "standalone",
    background_color: "#18130f",
    theme_color: "#c8a97e",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

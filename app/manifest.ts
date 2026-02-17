import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Optinest Digital",
    short_name: "Optinest",
    description: "Small web design and SEO agency helping brands grow.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f6ef",
    theme_color: "#f5f6ef",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}

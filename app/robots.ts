import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://flourishapp.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/recipes/", "/journal/", "/starter/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

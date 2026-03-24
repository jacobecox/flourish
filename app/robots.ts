import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://flourishapp.com";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/recipes/"],
      disallow: [
        "/api/",
        "/auth/",
        "/journal/",
        "/starter/",
        "/account/",
        "/chat/",
        "/recipes/new",
        "/recipes/*/edit",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

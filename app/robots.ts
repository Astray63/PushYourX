import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/stripe";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Les routes techniques n'ont rien à faire dans un index.
      disallow: ["/api/", "/success"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}

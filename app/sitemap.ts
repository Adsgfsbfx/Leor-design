import type { MetadataRoute } from "next";

const siteUrl = "https://leordesign.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl },
    { url: `${siteUrl}/privacy` },
  ];
}

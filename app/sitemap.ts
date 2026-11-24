import type { MetadataRoute } from "next";
import { getSetIndex } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/builder", "/nostalgia"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const sets = getSetIndex().map((s) => ({
    url: `${SITE_URL}/sets/${s.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...pages, ...sets];
}

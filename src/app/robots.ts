import type { MetadataRoute } from "next";

/** No crawler should ever index a guest's personal invitation. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}

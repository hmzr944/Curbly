import type { MetadataRoute } from "next";
import { MODELS } from "@/lib/models";
import { absolute } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absolute("/"), priority: 1 },
    { url: absolute("/outils/calcul-penalites-de-retard"), priority: 0.9 },
    { url: absolute("/outils/lettre-de-relance"), priority: 0.9 },
    { url: absolute("/modeles"), priority: 0.7 },
    ...MODELS.map((m) => ({ url: absolute(`/modeles/${m.slug}`), priority: 0.8 })),
  ];
}

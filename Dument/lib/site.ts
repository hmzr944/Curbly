export const SITE = {
  name: "Dûment",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dument.fr").replace(/\/$/, ""),
  tagline: "Vos factures, dûment payées.",
  description:
    "Dûment relance vos factures impayées à votre place, calcule les pénalités de retard légales et prépare la mise en demeure. Gratuit pour démarrer.",
};

export function absolute(path: string) {
  return `${SITE.url}${path}`;
}

import type { Metadata } from "next";
import { DICTS, LANGS, PATHS, type Lang } from "@/lib/i18n";

export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export function pageMetadata(lang: Lang): Metadata {
  const d = DICTS[lang];
  return {
    metadataBase: new URL(SITE_URL),
    title: d.docTitle,
    description: d.metaDescription,
    alternates: {
      canonical: PATHS[lang],
      languages: { ...Object.fromEntries(LANGS.map((l) => [l, PATHS[l]])), "x-default": PATHS.en },
    },
    openGraph: { type: "website", title: d.h1, description: d.metaDescription, locale: d.ogLocale, url: PATHS[lang], siteName: DICTS.en.docTitle },
    twitter: { card: "summary_large_image", title: d.h1, description: d.metaDescription },
  };
}

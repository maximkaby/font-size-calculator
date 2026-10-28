import type { ReactNode } from "react";
import { fontVars } from "@/lib/fonts";
import type { Lang } from "@/lib/i18n";
import "@/app/globals.css";

export default function RootHtml({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={lang} className={fontVars}>
      <body>{children}</body>
    </html>
  );
}

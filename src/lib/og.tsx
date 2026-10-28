import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { DICTS, type Lang } from "@/lib/i18n";

export const ogSize = { width: 1200, height: 630 };

// превью для соцсетей: заголовок на нужном языке и шкала зон
export async function ogImage(lang: Lang) {
  const d = DICTS[lang];
  const [body, display] = await Promise.all([
    readFile(join(process.cwd(), "assets/Golos-Text-wght-500.ttf")),
    readFile(join(process.cwd(), "assets/Literata-wght-600.ttf")),
  ]);
  const zone = (bg: string, flex: number, label: string, color: string) => (
    <div style={{ display: "flex", flex, height: 64, background: bg, alignItems: "center", justifyContent: "center", color, fontSize: 24 }}>{label}</div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fbfbf8", padding: 72, fontFamily: "Golos" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 26, color: "#1f6f5c", letterSpacing: 2, textTransform: "uppercase" }}>{d.ogTag}</div>
          <div style={{ fontFamily: "Literata", fontSize: 64, lineHeight: 1.15, color: "#17201d" }}>{d.h1}</div>
        </div>
        <div style={{ display: "flex", borderRadius: 12, overflow: "hidden" }}>
          {zone("#f5b9a8", 3, d.lowPill, "#8c2413")}
          {zone("#b4e8c6", 2, d.goodPill, "#136b3a")}
          {zone("#5ccb88", 4, d.bestPill, "#07421f")}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Golos", data: body, weight: 500, style: "normal" },
        { name: "Literata", data: display, weight: 600, style: "normal" },
      ],
    },
  );
}

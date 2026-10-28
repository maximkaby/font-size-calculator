// Расчёт порога по критическому размеру шрифта (Legge & Bigelow, 2011): x-height ≈ 0,2° угла зрения.

export const CPS = 0.2;
export const CPS_LO = 0.15;
export const CPS_HI = 0.3;

export type ScreenKey =
  | "mbp16" | "mbp14" | "air13" | "air15" | "air13old" | "imac24"
  | "port13" | "port156"
  | "mon19" | "mon20" | "mon215" | "mon22" | "mon23"
  | "mon24" | "mon24w" | "mon27" | "mon32";

// [ширина, высота, диагональ]; для Mac — разрешение «выглядит как» при масштабе по умолчанию
export const SCREENS: Record<ScreenKey, [number, number, number]> = {
  mbp16: [1728, 1117, 16.2], mbp14: [1512, 982, 14.2], air13: [1470, 956, 13.6],
  air15: [1710, 1112, 15.3], air13old: [1440, 900, 13.3], imac24: [2240, 1260, 23.5],
  port13: [1920, 1080, 13.3], port156: [1920, 1080, 15.6],
  mon19: [1440, 900, 19], mon20: [1600, 900, 19.5], mon215: [1920, 1080, 21.5], mon22: [1680, 1050, 22], mon23: [1920, 1080, 23],
  mon24: [1920, 1080, 23.8], mon24w: [1920, 1200, 24], mon27: [2560, 1440, 27], mon32: [2560, 1440, 31.5],
};

export type FontKey = "sf" | "jb" | "menlo" | "plex" | "cascadia" | "consolas" | "other";

// доли от кегля: x-height и высота заглавных, замерены по метрикам шрифтов
export const FONTS: Record<FontKey, { x: number; cap: number; name: string | null; css: string; windows?: boolean }> = {
  sf:       { x: 0.529, cap: 0.705, name: "SF Mono",        css: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, monospace' },
  jb:       { x: 0.550, cap: 0.730, name: "JetBrains Mono", css: 'var(--font-jetbrains), "JetBrains Mono", ui-monospace, Menlo, monospace' },
  menlo:    { x: 0.547, cap: 0.729, name: "Menlo",          css: "Menlo, ui-monospace, monospace" },
  plex:     { x: 0.516, cap: 0.698, name: "IBM Plex Mono",  css: 'var(--font-plex), "IBM Plex Mono", ui-monospace, Menlo, monospace' },
  cascadia: { x: 0.518, cap: 0.693, name: "Cascadia Mono",  css: '"Cascadia Mono", "Cascadia Code", Consolas, ui-monospace, monospace', windows: true },
  consolas: { x: 0.492, cap: 0.638, name: "Consolas",       css: 'Consolas, "Cascadia Mono", ui-monospace, monospace', windows: true },
  other:    { x: 0.530, cap: 0.710, name: null,             css: "ui-monospace, Menlo, monospace" },
};

export type Inputs = {
  screen: ScreenKey | "custom";
  cw: number; ch: number; cd: number;
  font: FontKey;
  scale: number;
  size: number;
  dist: number;
  lh: number;
};

export const DEFAULT_INPUTS: Inputs = {
  screen: "mbp16", cw: 1728, ch: 1117, cd: 16.2,
  font: "sf", scale: 1.5, size: 12, dist: 40, lh: 1.1,
};

const rad = (deg: number) => (deg * Math.PI) / 180;

export const isWindowsFont = (font: FontKey) => Boolean(FONTS[font].windows);

// пикселей на мм для одного «pt» терминала: на Mac 1 pt = 1 точка, у шрифтов Windows 1 pt = 4/3 px × масштаб
export function pxPerMm(i: Inputs): number {
  const [w, h, d] = i.screen === "custom" ? [i.cw || 1728, i.ch || 1117, i.cd || 16.2] : SCREENS[i.screen];
  const factor = isWindowsFont(i.font) ? (4 / 3) * i.scale : 1;
  return Math.hypot(w, h) / (d * 25.4) / factor;
}

export const ptFor = (angleDeg: number, distMm: number, ratio: number, ppm: number) =>
  2 * distMm * Math.tan(rad(angleDeg) / 2) * ppm / ratio;

export type Result = {
  xMm: number;
  needMm: number;
  maxDistCm: number;
  minPt: number;
  good: number;      // «подходит хорошо» от
  reserve: number;   // «с запасом» от
  lo: number;
  hi: number;
  level: "low" | "good" | "best";
  table: { dist: number; good: number; reserve: number }[];
};

export function compute(i: Inputs): Result {
  const f = FONTS[i.font];
  const ppm = pxPerMm(i);
  const distMm = i.dist * 10;
  const xMm = (i.size / ppm) * f.x;
  const minPt = ptFor(CPS, distMm, f.x, ppm);
  const good = Math.round(minPt);
  const reserve = good + 2;
  const level = i.size < good ? "low" : i.size < reserve ? "good" : "best";
  return {
    xMm,
    needMm: 2 * distMm * Math.tan(rad(CPS) / 2),
    maxDistCm: xMm / (2 * Math.tan(rad(CPS) / 2)) / 10,
    minPt,
    good,
    reserve,
    lo: ptFor(CPS_LO, distMm, f.x, ppm),
    hi: ptFor(CPS_HI, distMm, f.x, ppm),
    level,
    table: [40, 50, 60, 70, 80].map((d) => {
      const g = Math.round(ptFor(CPS, d * 10, f.x, ppm));
      return { dist: d, good: g, reserve: g + 2 };
    }),
  };
}

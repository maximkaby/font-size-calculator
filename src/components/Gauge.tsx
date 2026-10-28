"use client";

import { useEffect, useRef, useState } from "react";
import type { Result } from "@/lib/calc";

type Props = {
  pt: number;
  result: Result;
  t: (key: "you" | "gaugeAria" | "lowPill" | "goodPill" | "bestPill" | "legLowRange" | "legGoodRange" | "legBestRange", vars?: Record<string, string | number>) => string;
  ptPx: (pt: number) => string;
  px: (pt: number) => number;
};

// шкала в пунктах шрифта: границы зон пересчитаны из углов для текущего экрана, шрифта и расстояния
export default function Gauge({ pt, result, t, ptPx, px }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(300, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = width, H = 92, L = 8, R = W - 8, y0 = 30, bh = 22;
  const c = result.good;
  const min = Math.max(6, Math.floor(Math.min(pt, result.lo) - 2));
  const max = Math.ceil(Math.max(pt, result.hi, result.reserve) + 4);
  const x = (v: number) => L + ((v - min) / (max - min)) * (R - L);
  // границы зон между целыми размерами, чтобы шкала совпадала с легендой
  const goodStart = c - 0.5, bestStart = Math.min(c + 1.5, max);
  const step = ((max - min) * 44) / W > 2 ? 4 : 2;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) ticks.push(v);
  const mx = x(pt);
  const anchor = mx < 60 ? "start" : mx > W - 60 ? "end" : "middle";

  return (
    <div className="gauge" ref={ref} role="img" aria-label={t("gaugeAria", { pt: ptPx(pt), c: ptPx(c) })}>
      <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
        <rect className="g-low" x={L} y={y0} width={Math.max(0, x(goodStart) - L)} height={bh} />
        <rect className="g-good" x={x(goodStart)} y={y0} width={Math.max(0, x(bestStart) - x(goodStart))} height={bh} />
        <rect className="g-best" x={x(bestStart)} y={y0} width={Math.max(0, R - x(bestStart))} height={bh} />
        {ticks.map((v) => (
          <g key={v}>
            <line className="g-tick" x1={x(v)} x2={x(v)} y1={y0 + bh + 3} y2={y0 + bh + 8} />
            <text className="g-label" x={x(v)} y={y0 + bh + 21} textAnchor="middle">{v}</text>
          </g>
        ))}
        <line className="g-marker" x1={mx} x2={mx} y1={y0 - 8} y2={y0 + bh + 2} />
        <circle className="g-dot" cx={mx} cy={y0 - 10} r={3.5} />
        <text className="g-value" x={mx} y={y0 - 17} textAnchor={anchor}>{t("you", { pt: ptPx(pt) })}</text>
      </svg>
      <div className="legend">
        <span><i className="sw low" /><b>{t("lowPill")}</b> {t("legLowRange", { n: ptPx(c - 1) })}</span>
        <span><i className="sw good" /><b>{t("goodPill")}</b> {t("legGoodRange", { range: `${c}–${c + 1} pt (${px(c)}–${px(c + 1)} px)` })}</span>
        <span><i className="sw best" /><b>{t("bestPill")}</b> {t("legBestRange", { n: ptPx(c + 2) })}</span>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Gauge from "@/components/Gauge";
import { DEFAULT_INPUTS, FONTS, compute, isWindowsFont, type Inputs } from "@/lib/calc";
import { DICTS, LANGS, PATHS, translator, type Lang } from "@/lib/i18n";

const STORAGE_KEY = "fontcalc";

export default function Calculator({ lang }: { lang: Lang }) {
  const t = translator(lang);
  const d = DICTS[lang];
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);

  // старые ссылки вида /#ru и /#pl ведут на отдельные страницы языков
  useEffect(() => {
    const hash = location.hash.slice(1) as Lang;
    if (lang === "en" && hash !== "en" && LANGS.includes(hash)) location.replace(PATHS[hash]);
  }, [lang]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") {
        setInputs((prev) => {
          const next = { ...prev };
          for (const k of Object.keys(prev) as (keyof Inputs)[]) {
            if (saved[k] == null) continue;
            const v = saved[k];
            (next as Record<string, unknown>)[k] = typeof prev[k] === "number" ? Number(v) : v;
          }
          return next;
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs)); } catch {}
  }, [inputs]);

  const set = <K extends keyof Inputs>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const raw = e.target.value;
      setInputs((prev) => ({ ...prev, [key]: typeof prev[key] === "number" ? Number(raw) : raw }));
    };

  const r = useMemo(() => compute(inputs), [inputs]);
  const fmt = (n: number, digits = 1) =>
    n.toLocaleString(d.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const font = FONTS[inputs.font];
  const win = isWindowsFont(inputs.font);
  // пиксели для справки: на Mac 1 pt = 1 px, в Windows 1 pt = 4/3 px
  const px = (pt: number) => Math.round(win ? (pt * 4) / 3 : pt);
  const ptPx = (pt: number) => `${pt} pt (${px(pt)} px)`;

  const verdict = {
    low: { pill: t("lowPill"), title: t("lowTitle", { c: ptPx(r.good) }), text: t("lowText") },
    good: { pill: t("goodPill"), title: t("goodTitle"), text: t("goodText", { c: ptPx(r.good), r: ptPx(r.reserve) }) },
    best: { pill: t("bestPill"), title: t("bestTitle"), text: t("bestText") },
  }[r.level];

  return (
    <div className="wrap">
      <header>
        <nav className="lang" aria-label="Language">
          {LANGS.map((l) => (
            <a key={l} href={PATHS[l]} hrefLang={l} aria-current={l === lang ? "page" : undefined}>
              {l.toUpperCase()}
            </a>
          ))}
        </nav>
        <h1>{t("h1")}</h1>
        <div className="intro">
          <p className="lede">{t("lede")}</p>
          <div className="about">
            <h3>{t("aboutH")}</h3>
            <p>{t("aboutP")}</p>
          </div>
        </div>
      </header>

      <div className="tool">
        <form className="controls" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label htmlFor="screen">{t("screen")}</label>
            <select id="screen" value={inputs.screen} onChange={set("screen")}>
              <optgroup label={t("ogLaptops")}>
                <option value="mbp16">MacBook Pro 16″</option>
                <option value="mbp14">MacBook Pro 14″</option>
                <option value="air13">MacBook Air 13″</option>
                <option value="air15">MacBook Air 15″</option>
                <option value="air13old">{t("optAirOld")}</option>
                <option value="imac24">iMac 24″</option>
              </optgroup>
              <optgroup label={t("ogPortable")}>
                <option value="port13">{t("optPort13")}</option>
                <option value="port156">{t("optPort156")}</option>
              </optgroup>
              <optgroup label={t("ogSmall")}>
                <option value="mon19">19″, 1440 × 900</option>
                <option value="mon20">20″, 1600 × 900</option>
                <option value="mon215">{t("optMon215")}</option>
                <option value="mon22">22″, 1680 × 1050</option>
                <option value="mon23">23″, 1920 × 1080</option>
              </optgroup>
              <optgroup label={t("ogLarge")}>
                <option value="mon24">24″, 1920 × 1080</option>
                <option value="mon24w">24″, 1920 × 1200</option>
                <option value="mon27">{t("optMon27")}</option>
                <option value="mon32">{t("optMon32")}</option>
              </optgroup>
              <option value="custom">{t("optCustom")}</option>
            </select>
            {inputs.screen === "custom" && (
              <div className="custom">
                <label>{t("cw")}<input type="number" id="cw" min={640} max={8000} value={inputs.cw} onChange={set("cw")} /></label>
                <label>{t("ch")}<input type="number" id="ch" min={400} max={5000} value={inputs.ch} onChange={set("ch")} /></label>
                <label>{t("cd")}<input type="number" id="cd" min={10} max={60} step={0.1} value={inputs.cd} onChange={set("cd")} /></label>
              </div>
            )}
            <p className="hint">{t("hintScreen")}</p>
          </div>

          <div className="field">
            <label htmlFor="font">{t("font")}</label>
            <select id="font" value={inputs.font} onChange={set("font")}>
              <option value="sf">{t("optSf")}</option>
              <option value="jb">JetBrains Mono</option>
              <option value="menlo">Menlo</option>
              <option value="plex">IBM Plex Mono</option>
              <option value="cascadia">Cascadia Mono (Windows Terminal)</option>
              <option value="consolas">Consolas (Windows)</option>
              <option value="other">{t("optOther")}</option>
            </select>
            {win && (
              <div className="field">
                <label htmlFor="scale">{t("scale")}</label>
                <select id="scale" value={String(inputs.scale)} onChange={set("scale")}>
                  {[1, 1.25, 1.5, 1.75, 2].map((s) => <option key={s} value={String(s)}>{s * 100}%</option>)}
                </select>
                <p className="hint">{t("scaleHint")}</p>
              </div>
            )}
          </div>

          <div className="field">
            <div className="slider-row"><label htmlFor="size">{t("size")}</label><output htmlFor="size">{ptPx(inputs.size)}</output></div>
            <input type="range" id="size" min={8} max={28} step={1} value={inputs.size} onChange={set("size")} />
          </div>

          <div className="field">
            <div className="slider-row"><label htmlFor="dist">{t("dist")}</label><output htmlFor="dist">{inputs.dist} {t("cm")}</output></div>
            <input type="range" id="dist" min={30} max={100} step={5} value={inputs.dist} onChange={set("dist")} />
            <p className="hint">{t("distHint")}</p>
          </div>

          <div className="field">
            <div className="slider-row"><label htmlFor="lh">{t("lh")}</label><output htmlFor="lh">{inputs.lh.toFixed(2)}</output></div>
            <input type="range" id="lh" min={1} max={1.6} step={0.05} value={inputs.lh} onChange={set("lh")} />
          </div>
        </form>

        <div className="card" aria-live="polite">
          <div className="verdict">
            <span className={`pill ${r.level}`}>{verdict.pill}</span>
            <h2>{verdict.title}</h2>
            <p>{verdict.text}</p>
          </div>

          <Gauge pt={inputs.size} result={r} t={t} ptPx={ptPx} px={px} />

          <div className="preview">
            <span className="label">
              {t("pvLabel", { font: font.name ?? t("otherName"), pt: ptPx(inputs.size), lh: inputs.lh.toFixed(2) })}
            </span>
            <div
              className="sample"
              style={{ fontFamily: font.css, fontSize: `${win ? (inputs.size * 4) / 3 : inputs.size}px`, lineHeight: inputs.lh }}
            >
              {t("sample")}
            </div>
            <p className="hint">{t("sampleHint")}</p>
          </div>

          <div className="stats">
            <div className="stat">
              <span className="k">{t("statGood")}</span>
              <span className="v">≈ {r.good} pt <small>({px(r.good)} px)</small></span>
              <span className="s">{t("sMins", { pt: ptPx(inputs.size), d: fmt(r.maxDistCm, 0) })}</span>
            </div>
            <div className="stat">
              <span className="k">{t("statRes")}</span>
              <span className="v">{r.reserve} pt <small>({px(r.reserve)} px)</small></span>
              <span className="s">{t("statResSub")}</span>
            </div>
            <div className="stat">
              <span className="k">{t("statRuler")}</span>
              <span className="v">{fmt(r.xMm, 1)} {t("mm")}</span>
              <span className="s">{t("sXs", { n: fmt(r.needMm, 1) })}</span>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <caption>{t("tblCaption")}</caption>
              <thead><tr><th>{t("thDist")}</th><th>{t("statGood")}</th><th>{t("statRes")}</th></tr></thead>
              <tbody>
                {r.table.map((row) => (
                  <tr key={row.dist} className={row.dist === inputs.dist ? "current" : ""}>
                    <td>{row.dist} {t("cm")}</td><td>{ptPx(row.good)}</td><td>{ptPx(row.reserve)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="explain">
        <section>
          <h3>{t("howH")}</h3>
          <p>{t("howP")}</p>
          <div className="formula">{t("formula1")}</div>
          <div className="formula">{t("formula2")}</div>
        </section>
        <section>
          <h3>{t("rulerH")}</h3>
          <p>{t("rulerBefore")} <code>xxxxx</code> {t("rulerAfter")}</p>
        </section>
      </div>

      <section className="sources" aria-labelledby="srcTitle">
        <h3 id="srcTitle">{t("srcH")}</h3>
        <ol>
          <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3428264" target="_blank" rel="noopener">Legge G. E., Bigelow C. A. Does print size matter for reading? A review of findings from vision science and typography</a>. <span>{t("src1")}</span></li>
          <li><a href="https://www.coeh.berkeley.edu/publications/effect-font-size-and-glare-computer-tasks-young-and-older-adults" target="_blank" rel="noopener">Ko P., Mohapatra A., Bailey I. L., Sheedy J., Rempel D. Effect of font size and glare on computer tasks in young and older adults</a>. <span>{t("src2")}</span> <a href="https://stacks.cdc.gov/view/cdc/202727/cdc_202727_DS1.pdf" target="_blank" rel="noopener">{t("fullText")}</a>.</li>
          <li><a href="https://editingresearch.byu.edu/?p=10398" target="_blank" rel="noopener">Rello L., Pielot M., Marcos M.-C. Make It Big! The Effect of Font Size and Line Spacing on Online Readability</a>. <span>{t("src3")}</span></li>
          <li><a href="https://microsoft.com/en-us/research/uploads/prod/2021/06/Beier-Larson-2013-how-does-typeface-familiarity-affect-reading-performance-and-reader-preference.pdf" target="_blank" rel="noopener">Beier S., Larson K. How does typeface familiarity affect reading performance and reader preference?</a> <span>{t("src4")}</span></li>
          <li><a href="https://mnread.umn.edu/" target="_blank" rel="noopener">{t("mnreadTitle")}</a>. <span>{t("univ")}</span> <a href="https://pubmed.ncbi.nlm.nih.gov/29351351/" target="_blank" rel="noopener">{t("mnreadCmp")}</a> <span>(Calabrèse et al., Journal of Vision, 2018).</span></li>
          <li><a href="https://userfocus.co.uk/resources/iso9241/part3.html" target="_blank" rel="noopener">{t("isoTitle")}</a>. <span>{t("isoNote")}</span></li>
        </ol>
        <p className="fine">{t("fine")}</p>
      </section>
    </div>
  );
}


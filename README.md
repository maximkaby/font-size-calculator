# Terminal Font Size

A calculator that checks whether your terminal font size is big enough for your screen and viewing distance. It converts terminal points into the angle at which your eye sees a lowercase “x” and compares it with the critical print size from reading research (Legge & Bigelow, 2011: x-height ≈ 0.2°).

The site is available in three languages: English (`/`), Russian (`/ru`) and Polish (`/pl`).

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
```

## How it works

1. Screen density: diagonal in pixels ÷ diagonal in mm. For Macs, the default “looks like” resolution is used.
2. For Windows fonts (Cascadia, Consolas), 1 pt = 4/3 px × system scaling; on a Mac, 1 pt = 1 point.
3. `x, mm = pt ÷ (px per mm) × x-height ratio`
4. `angle = 2 · arctan(x ÷ 2 ÷ distance)`

“Good fit” is the rounded size at which the angle reaches 0.2°; “headroom” is that size + 2 pt. The 0.15–0.3° range shows individual variation.

## Project structure

```
src/
  app/
    (en)/ (ru)/ (pl)/    pages, layouts and OG images per language
    globals.css
  components/
    Calculator.tsx       form, result and text sample
    Gauge.tsx            font size scale
    RootHtml.tsx         shared <html> for language layouts
  lib/
    calc.ts              formulas, screens and font metrics
    i18n.ts              en / ru / pl dictionaries
    site.ts              metadata, canonical and hreflang
    fonts.ts             fonts via next/font/google
    og.tsx               Open Graph image generation
assets/                  TTF fonts for OG images
```

## Deployment

The project deploys to Vercel (`vercel.json`). The site URL for metadata comes from `VERCEL_PROJECT_PRODUCTION_URL`; locally it defaults to `http://localhost:3000`.

## Stack

Next.js 16, React 19, TypeScript. No other dependencies.

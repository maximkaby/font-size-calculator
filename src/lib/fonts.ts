import { Golos_Text, IBM_Plex_Mono, JetBrains_Mono, Literata } from "next/font/google";

export const golos = Golos_Text({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400", "500", "600"], variable: "--font-golos", display: "swap" });
export const literata = Literata({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["500", "600"], variable: "--font-literata", display: "swap" });
export const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });
export const plex = IBM_Plex_Mono({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400"], variable: "--font-plex", display: "swap" });

export const fontVars = [golos.variable, literata.variable, jetbrains.variable, plex.variable].join(" ");

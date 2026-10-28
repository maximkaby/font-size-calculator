import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Font size calculator";

export default function Image() {
  return ogImage("pl");
}

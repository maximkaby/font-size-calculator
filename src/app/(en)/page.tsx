import Calculator from "@/components/Calculator";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("en");

export default function Page() {
  return <Calculator lang="en" />;
}

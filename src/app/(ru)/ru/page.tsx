import Calculator from "@/components/Calculator";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("ru");

export default function Page() {
  return <Calculator lang="ru" />;
}

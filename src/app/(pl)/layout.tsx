import type { ReactNode } from "react";
import RootHtml from "@/components/RootHtml";

export default function Layout({ children }: { children: ReactNode }) {
  return <RootHtml lang="pl">{children}</RootHtml>;
}

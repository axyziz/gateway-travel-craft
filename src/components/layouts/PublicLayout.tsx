import type { ReactNode } from "react";
import { PublicHeader } from "@/components/public/Header";
import { PublicFooter } from "@/components/public/Footer";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
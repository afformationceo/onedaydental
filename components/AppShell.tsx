import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { getClinic } from "@/lib/clinic";
import { tx } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";
import Header from "./Header";
import Footer from "./Footer";
import BottomTabBar from "./BottomTabBar";
import FloatingCTA from "./FloatingCTA";
import FloatingInstagram from "./FloatingInstagram";
import PromoBar from "./PromoBar";
import HashScroll from "./HashScroll";

export default async function AppShell({ children }: { children: ReactNode }) {
  const locale = (await getLocale()) as Locale;
  const clinic = getClinic();

  const treatmentCats = clinic.categories.map((c) => ({
    id: c.id,
    name: tx(c.name, locale),
    icon: c.icon,
    items: clinic.treatments
      .filter((tr) => tr.category === c.id)
      .map((tr) => ({ slug: tr.slug, name: tx(tr.name, locale) })),
  }));

  return (
    <div className="app-frame relative flex min-h-dvh flex-col bg-surface">
      <HashScroll />
      <PromoBar />
      <Header treatmentCats={treatmentCats} />
      <main className="mx-auto w-full max-w-screen-2xl flex-1">{children}</main>
      <Footer />
      <BottomTabBar />
      <FloatingCTA />
      <FloatingInstagram />
    </div>
  );
}

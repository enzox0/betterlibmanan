import React from "react";
import { TopUtilityBar } from "@/app/shell/TopUtilityBar";
import { Navbar } from "@/app/shell/Navbar";
import { BottomUtilityBar } from "@/app/shell/BottomUtilityBar";
import { Footer } from "@/app/shell/Footer";
import { BackToTopButton } from "@/app/shell/BackToTopButton";
import { MiniFloatingNav } from "@/modules/landing/components/sections/MiniFloatingNav";
import { AutoPageMetadata } from "@/app/components";
import { LazyLoader } from "@/app/router/lazy-loader";

/** Layout with Suspense/lazy-loading fallback — used for all code-split routes. */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AutoPageMetadata />
      <MiniFloatingNav />
      <TopUtilityBar />
      <Navbar />
      <BottomUtilityBar />
      <main className="flex-1 flex flex-col">
        <LazyLoader>{children}</LazyLoader>
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}

/** Layout without Suspense — used for eagerly-loaded routes like Home. */
export function LayoutEager({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AutoPageMetadata />
      <MiniFloatingNav />
      <TopUtilityBar />
      <Navbar />
      <BottomUtilityBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}

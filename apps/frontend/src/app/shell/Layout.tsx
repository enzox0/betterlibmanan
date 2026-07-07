import React, { useState } from "react";
import { TopUtilityBar } from "@/app/shell/TopUtilityBar";
import { Navbar } from "@/app/shell/Navbar";
import { BottomUtilityBar } from "@/app/shell/BottomUtilityBar";
import { Footer } from "@/app/shell/Footer";
import { ContributeCTA } from "@/app/shell/ContributeCTA";
import { BackToTopButton } from "@/app/shell/BackToTopButton";
import { InfoFloatingButton } from "@/app/shell/InfoFloatingButton";
import { UserAuthModal } from "@/modules/landing/components/ui/UserAuthModal";
import { MiniFloatingNav } from "@/modules/landing/components/sections/MiniFloatingNav";
import { AutoPageMetadata } from "@/app/components";
import { LazyLoader } from "@/app/router/lazy-loader";

/** Layout with Suspense/lazy-loading fallback — used for all code-split routes. */
export function Layout({ children }: { children: React.ReactNode }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <AutoPageMetadata />
      <MiniFloatingNav />
      <TopUtilityBar />
      <Navbar
        authModalOpen={authModalOpen}
        setAuthModalOpen={setAuthModalOpen}
      />
      <BottomUtilityBar />
      <main className="flex-1 flex flex-col">
        <LazyLoader>{children}</LazyLoader>
      </main>
      <ContributeCTA />
      <Footer />
      <BackToTopButton />
      <InfoFloatingButton setAuthModalOpen={setAuthModalOpen} />
      <UserAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="register"
      />
    </div>
  );
}

/** Layout without Suspense — used for eagerly-loaded routes like Home. */
export function LayoutEager({ children }: { children: React.ReactNode }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <AutoPageMetadata />
      <MiniFloatingNav />
      <TopUtilityBar />
      <Navbar
        authModalOpen={authModalOpen}
        setAuthModalOpen={setAuthModalOpen}
      />
      <BottomUtilityBar />
      <main className="flex-1">{children}</main>
      <ContributeCTA />
      <Footer />
      <BackToTopButton />
      <InfoFloatingButton setAuthModalOpen={setAuthModalOpen} />
      <UserAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="register"
      />
    </div>
  );
}

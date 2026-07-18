import React, { useState } from "react";
import { useLocation } from "react-router-dom";
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

/** Routes where the footer and contribute CTA should be hidden. */
const HIDE_FOOTER_PATTERNS = [/^\/community\/groups\/.+/];

/** Routes where floating components should be hidden. */
const HIDE_FLOATING_PATTERNS = [/^\/community/];

/** Layout with Suspense/lazy-loading fallback — used for all code-split routes. */
export function Layout({ children }: { children: React.ReactNode }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const hideFooter = HIDE_FOOTER_PATTERNS.some((p) => p.test(pathname));
  const hideFloatingComponents = HIDE_FLOATING_PATTERNS.some((p) =>
    p.test(pathname),
  );

  return (
    <div className="min-h-screen flex flex-col">
      <AutoPageMetadata />
      {!hideFloatingComponents && (
        <MiniFloatingNav isMobileMenuOpen={isMobileMenuOpen} />
      )}
      <TopUtilityBar />
      <Navbar
        authModalOpen={authModalOpen}
        setAuthModalOpen={setAuthModalOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <BottomUtilityBar />
      <main className="flex-1 flex flex-col">
        <LazyLoader>{children}</LazyLoader>
      </main>
      {!hideFooter && <ContributeCTA />}
      {!hideFooter && <Footer />}
      {!hideFloatingComponents && (
        <BackToTopButton isMobileMenuOpen={isMobileMenuOpen} />
      )}
      {!hideFloatingComponents && (
        <InfoFloatingButton
          setAuthModalOpen={setAuthModalOpen}
          isMobileMenuOpen={isMobileMenuOpen}
        />
      )}
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const hideFloatingComponents = HIDE_FLOATING_PATTERNS.some((p) =>
    p.test(pathname),
  );
  return (
    <div className="min-h-screen flex flex-col">
      <AutoPageMetadata />
      {!hideFloatingComponents && (
        <MiniFloatingNav isMobileMenuOpen={isMobileMenuOpen} />
      )}
      <TopUtilityBar />
      <Navbar
        authModalOpen={authModalOpen}
        setAuthModalOpen={setAuthModalOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <BottomUtilityBar />
      <main className="flex-1">{children}</main>
      <ContributeCTA />
      <Footer />
      {!hideFloatingComponents && (
        <BackToTopButton isMobileMenuOpen={isMobileMenuOpen} />
      )}
      {!hideFloatingComponents && (
        <InfoFloatingButton
          setAuthModalOpen={setAuthModalOpen}
          isMobileMenuOpen={isMobileMenuOpen}
        />
      )}
      <UserAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="register"
      />
    </div>
  );
}

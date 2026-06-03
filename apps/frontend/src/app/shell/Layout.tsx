import { TopUtilityBar } from '@/app/shell/TopUtilityBar';
import { Navbar } from '@/app/shell/Navbar';
import { BottomUtilityBar } from '@/app/shell/BottomUtilityBar';
import { Footer } from '@/app/shell/Footer';
import { BackToTopButton } from '@/app/shell/BackToTopButton';
import { MiniFloatingNav } from '@/modules/landing/components/sections/MiniFloatingNav';
import { AutoPageMetadata } from '@/app/components';

export function Layout({ children }: { children: React.ReactNode }) {
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

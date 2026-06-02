import { TopUtilityBar } from './TopUtilityBar';
import { Navbar } from './Navbar';
import { BottomUtilityBar } from './BottomUtilityBar';
import { Footer } from './Footer';
import { BackToTopButton } from './BackToTopButton';
import { MiniFloatingNav } from '../../modules/landing/sections/MiniFloatingNav';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
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

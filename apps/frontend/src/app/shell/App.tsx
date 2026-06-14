import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from '@/app/router';
import { SplashScreen, hasSplashBeenShown } from '@/app/components/SplashScreen';
import { useAdminShortcut } from '../../modules/admin/hooks/useAdminShortcut';
import { AdminLoginModal } from '../../modules/admin/components/auth/AdminLoginModal';

export function App() {
  // If splash already ran this session, skip it entirely and mount the router right away.
  const [splashDone, setSplashDone] = useState(() => hasSplashBeenShown());

  useAdminShortcut();

  return (
    <>
      {!splashDone && (
        <SplashScreen duration={2000} onFinish={() => setSplashDone(true)} />
      )}
      {splashDone && (
        <BrowserRouter>
          <AppRouter />
          <AdminLoginModal />
        </BrowserRouter>
      )}
    </>
  );
}

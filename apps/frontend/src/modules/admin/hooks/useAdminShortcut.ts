import { useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';

export function useAdminShortcut(): void {
  const loginModalOpen = useAdminStore((state) => state.loginModalOpen);
  const openLoginModal = useAdminStore((state) => state.openLoginModal);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!(event.shiftKey && event.key === 'A')) return;

      const active = document.activeElement;
      if (active) {
        const tag = active.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (active.getAttribute('contenteditable') === 'true') return;
      }

      if (loginModalOpen) return;

      openLoginModal();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [loginModalOpen, openLoginModal]);
}

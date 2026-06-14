import { useAdminStore } from '../store/adminStore';

export function useAdminAuth() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const loginModalOpen = useAdminStore((s) => s.loginModalOpen);
  const login = useAdminStore((s) => s.login);
  const logout = useAdminStore((s) => s.logout);

  return { isAuthenticated, login, logout, loginModalOpen };
}

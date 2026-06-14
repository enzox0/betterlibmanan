import type { RouteObject } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { ModulePage } from '../pages/ModulePage';
import { AdminDashboardLayout } from '../components/layout/AdminDashboardLayout';
import { AccountManagementPage } from '../pages/AccountManagementPage';
import { MyAccountPage } from '../pages/MyAccountPage';

export const adminRoutes: RouteObject[] = [
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminDashboardLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: 'accounts',
            element: <AccountManagementPage />,
          },
          {
            path: 'my-account',
            element: <MyAccountPage />,
          },
          {
            path: ':module',
            element: <ModulePage />,
          },
        ],
      },
    ],
  },
];

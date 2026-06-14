import type { RouteObject } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { ModulePage } from '../pages/ModulePage';
import { AdminDashboardLayout } from '../components/layout/AdminDashboardLayout';

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
            path: ':module',
            element: <ModulePage />,
          },
        ],
      },
    ],
  },
];

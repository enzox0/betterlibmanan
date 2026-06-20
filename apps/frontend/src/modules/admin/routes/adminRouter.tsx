import type { RouteObject } from "react-router-dom";
import { AdminRoute } from "./AdminRoute";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";
import { HomeModulePage } from "../pages/HomeModulePage";
import { ModulePage } from "../pages/ModulePage";
import { AdminDashboardLayout } from "../components/layout/AdminDashboardLayout";
import { AccountManagementPage } from "../pages/AccountManagementPage";
import { MyAccountPage } from "../pages/MyAccountPage";
import { ContactsPage } from "../pages/ContactsPage";
import { AdminLoginPage } from "../components/auth/AdminLoginPage";
import { GovernmentModulePage } from "../pages/GovernmentModulePage";
import { LegislativeModulePage } from "../pages/LegislativeModulePage";
import { TransparencyModulePage } from "../pages/TransparencyModulePage";
import { ServicesModulePage } from "../pages/ServicesModulePage";
import { StatisticsModulePage } from "../pages/StatisticsModulePage";

export const adminRoutes: RouteObject[] = [
  // Public login page — no auth guard
  {
    path: "login",
    element: <AdminLoginPage />,
  },
  // Protected admin routes
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
            path: "home",
            element: <HomeModulePage />,
          },
          {
            path: "accounts",
            element: <AccountManagementPage />,
          },
          {
            path: "my-account",
            element: <MyAccountPage />,
          },
          {
            path: "contacts",
            element: <ContactsPage />,
          },
          {
            path: "government",
            element: <GovernmentModulePage />,
          },
          {
            path: "legislative",
            element: <LegislativeModulePage />,
          },
          {
            path: "transparency",
            element: <TransparencyModulePage />,
          },
          {
            path: "services",
            element: <ServicesModulePage />,
          },
          {
            path: "statistics",
            element: <StatisticsModulePage />,
          },
          {
            path: ":module",
            element: <ModulePage />,
          },
        ],
      },
    ],
  },
];

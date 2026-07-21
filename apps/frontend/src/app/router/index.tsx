import { useRoutes, Outlet } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { lazyLoad } from "@/app/router/lazy-loader";
import { Layout, LayoutEager } from "@/app/shell/Layout";
import HomePage from "@/modules/landing";
import { adminRoutes } from "../../modules/admin/routes/adminRouter";
import { useAdminShortcut } from "../../modules/admin/hooks/useAdminShortcut";
import { ScrollToTop } from "@/app/components";

// Admin subtree rendered via useRoutes so the RouteObject[] array integrates
// cleanly with the existing JSX-based <Routes> pattern.
function AdminRouterOutlet() {
  return useRoutes(adminRoutes);
}

// Root layout — mounts hooks/side-effects that need router context
function RootLayout() {
  useAdminShortcut();
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const NotFoundPage = lazyLoad(() =>
  import("@/modules/errors").then((m) => ({ default: m.NotFoundPage })),
);
const ContactPage = lazyLoad(() => import("@/modules/contact"));
const TransparencyPage = lazyLoad(() => import("@/modules/transparency"));
const GovernmentPage = lazyLoad(() => import("@/modules/government"));
const StatisticsPage = lazyLoad(() => import("@/modules/statistics"));
const LegislativePage = lazyLoad(() => import("@/modules/legislative"));
const OrdinanceFrameworkPage = lazyLoad(() =>
  import("@/modules/legislative").then((m) => ({
    default: m.OrdinanceFrameworkPage,
  })),
);
const ResolutionFrameworkPage = lazyLoad(() =>
  import("@/modules/legislative").then((m) => ({
    default: m.ResolutionFrameworkPage,
  })),
);
const ServicesPage = lazyLoad(() => import("@/modules/services"));
const CertificatesPage = lazyLoad(() =>
  import("@/modules/services").then((m) => ({ default: m.CertificatesPage })),
);
const BusinessPage = lazyLoad(() =>
  import("@/modules/services").then((m) => ({ default: m.BusinessPage })),
);
const TaxPaymentsPage = lazyLoad(() =>
  import("@/modules/services").then((m) => ({ default: m.TaxPaymentsPage })),
);
const SocialServicesPage = lazyLoad(() =>
  import("@/modules/services").then((m) => ({ default: m.SocialServicesPage })),
);
const HealthPage = lazyLoad(() =>
  import("@/modules/services").then((m) => ({ default: m.HealthPage })),
);
const AgriculturePage = lazyLoad(() =>
  import("@/modules/services").then((m) => ({ default: m.AgriculturePage })),
);
const InfrastructurePage = lazyLoad(() =>
  import("@/modules/services").then((m) => ({ default: m.InfrastructurePage })),
);
const EducationPage = lazyLoad(() =>
  import("@/modules/services").then((m) => ({ default: m.EducationPage })),
);
const PublicSafetyPage = lazyLoad(() =>
  import("@/modules/services").then((m) => ({ default: m.PublicSafetyPage })),
);
const EnvironmentPage = lazyLoad(() =>
  import("@/modules/services").then((m) => ({ default: m.EnvironmentPage })),
);
const ComingSoonPage = lazyLoad(() =>
  import("@/modules/common").then((m) => ({ default: m.ComingSoonPage })),
);
const SitemapPage = lazyLoad(() =>
  import("@/modules/common").then((m) => ({ default: m.SitemapPage })),
);
const TermsOfUsePage = lazyLoad(() =>
  import("@/modules/common").then((m) => ({ default: m.TermsOfUsePage })),
);
const PrivacyPolicyPage = lazyLoad(() =>
  import("@/modules/common").then((m) => ({ default: m.PrivacyPolicyPage })),
);
const AccessibilityPage = lazyLoad(() =>
  import("@/modules/common").then((m) => ({ default: m.AccessibilityPage })),
);
const FaqPage = lazyLoad(() =>
  import("@/modules/common").then((m) => ({ default: m.FaqPage })),
);
const AboutPage = lazyLoad(() =>
  import("@/modules/landing").then((m) => ({ default: m.AboutPage })),
);
const FreedomWallPage = lazyLoad(() =>
  import("@/modules/landing").then((m) => ({ default: m.FreedomWallPage })),
);
const CommunityPage = lazyLoad(() =>
  import("@/modules/landing").then((m) => ({ default: m.CommunityPage })),
);
const AllPeerGroupsPage = lazyLoad(() =>
  import("@/modules/landing").then((m) => ({ default: m.AllPeerGroupsPage })),
);
const GroupDetailPage = lazyLoad(() =>
  import("@/modules/landing").then((m) => ({ default: m.GroupDetailPage })),
);
const AllDiscussionsPage = lazyLoad(() =>
  import("@/modules/landing").then((m) => ({ default: m.AllDiscussionsPage })),
);
const DiscussionDetailPage = lazyLoad(() =>
  import("@/modules/landing").then((m) => ({
    default: m.DiscussionDetailPage,
  })),
);
const QuizPage = lazyLoad(() =>
  import("@/modules/landing").then((m) => ({ default: m.QuizPage })),
);
const InstallPage = lazyLoad(() =>
  import("@/modules/landing").then((m) => ({ default: m.InstallPage })),
);
const UserProfilePage = lazyLoad(() =>
  import("@/modules/landing").then((m) => ({ default: m.UserProfilePage })),
);
const LatestUpdatesPage = lazyLoad(() =>
  import("@/modules/landing").then((m) => ({ default: m.LatestUpdatesPage })),
);
const TourismPage = lazyLoad(() => import("@/modules/tourism"));

// Charter coming-soon page needs static props — wrap it once here
function CharterPage() {
  return (
    <ComingSoonPage
      title="Citizen's Charter"
      subtitle="The Citizen's Charter page is under construction. Check back soon!"
    />
  );
}

export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: (
          <LayoutEager>
            <HomePage />
          </LayoutEager>
        ),
      },
      // Admin
      { path: "/admin/*", element: <AdminRouterOutlet /> },
      // Services
      {
        path: "/services",
        element: (
          <Layout>
            <ServicesPage />
          </Layout>
        ),
      },
      {
        path: "/services/certificates",
        element: (
          <Layout>
            <CertificatesPage />
          </Layout>
        ),
      },
      {
        path: "/services/business",
        element: (
          <Layout>
            <BusinessPage />
          </Layout>
        ),
      },
      {
        path: "/services/tax-payments",
        element: (
          <Layout>
            <TaxPaymentsPage />
          </Layout>
        ),
      },
      {
        path: "/services/social-services",
        element: (
          <Layout>
            <SocialServicesPage />
          </Layout>
        ),
      },
      {
        path: "/services/health",
        element: (
          <Layout>
            <HealthPage />
          </Layout>
        ),
      },
      {
        path: "/services/agriculture",
        element: (
          <Layout>
            <AgriculturePage />
          </Layout>
        ),
      },
      {
        path: "/services/infrastructure",
        element: (
          <Layout>
            <InfrastructurePage />
          </Layout>
        ),
      },
      {
        path: "/services/education",
        element: (
          <Layout>
            <EducationPage />
          </Layout>
        ),
      },
      {
        path: "/services/public-safety",
        element: (
          <Layout>
            <PublicSafetyPage />
          </Layout>
        ),
      },
      {
        path: "/services/environment",
        element: (
          <Layout>
            <EnvironmentPage />
          </Layout>
        ),
      },
      // Legislative
      {
        path: "/legislative",
        element: (
          <Layout>
            <LegislativePage />
          </Layout>
        ),
      },
      {
        path: "/legislative/ordinances",
        element: (
          <Layout>
            <OrdinanceFrameworkPage />
          </Layout>
        ),
      },
      {
        path: "/legislative/resolutions",
        element: (
          <Layout>
            <ResolutionFrameworkPage />
          </Layout>
        ),
      },
      // Other nav
      {
        path: "/government",
        element: (
          <Layout>
            <GovernmentPage />
          </Layout>
        ),
      },
      {
        path: "/statistics",
        element: (
          <Layout>
            <StatisticsPage />
          </Layout>
        ),
      },
      {
        path: "/transparency",
        element: (
          <Layout>
            <TransparencyPage />
          </Layout>
        ),
      },
      {
        path: "/contact",
        element: (
          <Layout>
            <ContactPage />
          </Layout>
        ),
      },
      {
        path: "/coming-soon",
        element: (
          <Layout>
            <ComingSoonPage />
          </Layout>
        ),
      },
      {
        path: "/tourism",
        element: (
          <Layout>
            <TourismPage />
          </Layout>
        ),
      },
      {
        path: "/about",
        element: (
          <Layout>
            <AboutPage />
          </Layout>
        ),
      },
      {
        path: "/freedom-wall",
        element: (
          <Layout>
            <FreedomWallPage />
          </Layout>
        ),
      },
      {
        path: "/quiz",
        element: (
          <Layout>
            <QuizPage />
          </Layout>
        ),
      },
      {
        path: "/sitemap",
        element: (
          <Layout>
            <SitemapPage />
          </Layout>
        ),
      },
      {
        path: "/charter",
        element: (
          <Layout>
            <CharterPage />
          </Layout>
        ),
      },
      {
        path: "/terms",
        element: (
          <Layout>
            <TermsOfUsePage />
          </Layout>
        ),
      },
      {
        path: "/privacy",
        element: (
          <Layout>
            <PrivacyPolicyPage />
          </Layout>
        ),
      },
      {
        path: "/accessibility",
        element: (
          <Layout>
            <AccessibilityPage />
          </Layout>
        ),
      },
      {
        path: "/faq",
        element: (
          <Layout>
            <FaqPage />
          </Layout>
        ),
      },
      // Community
      {
        path: "/community",
        element: (
          <Layout>
            <CommunityPage />
          </Layout>
        ),
      },
      {
        path: "/community/groups",
        element: (
          <Layout>
            <AllPeerGroupsPage />
          </Layout>
        ),
      },
      {
        path: "/community/groups/:id",
        element: (
          <Layout>
            <GroupDetailPage />
          </Layout>
        ),
      },
      {
        path: "/community/discussions",
        element: (
          <Layout>
            <AllDiscussionsPage />
          </Layout>
        ),
      },
      {
        path: "/community/discussions/:id",
        element: (
          <Layout>
            <DiscussionDetailPage />
          </Layout>
        ),
      },
      // Misc
      {
        path: "/install",
        element: (
          <Layout>
            <InstallPage />
          </Layout>
        ),
      },
      {
        path: "/profile",
        element: (
          <Layout>
            <UserProfilePage />
          </Layout>
        ),
      },
      {
        path: "/latest-updates",
        element: (
          <Layout>
            <LatestUpdatesPage />
          </Layout>
        ),
      },
      // 404
      {
        path: "*",
        element: (
          <Layout>
            <NotFoundPage />
          </Layout>
        ),
      },
    ],
  },
];

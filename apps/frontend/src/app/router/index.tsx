import { Routes, Route } from 'react-router-dom';
import { lazyLoad, LazyLoader } from '@/app/router/lazy-loader';
import { Layout } from '@/app/shell/Layout';

const HomePage = lazyLoad(() => import('@/modules/landing'));
const NotFoundPage = lazyLoad(() => import('@/modules/errors').then(m => ({ default: m.NotFoundPage })));
const ContactPage = lazyLoad(() => import('@/modules/contact'));
const TransparencyPage = lazyLoad(() => import('@/modules/transparency'));
const GovernmentPage = lazyLoad(() => import('@/modules/government'));
const StatisticsPage = lazyLoad(() => import('@/modules/statistics'));
const LegislativePage = lazyLoad(() => import('@/modules/legislative'));
const OrdinanceFrameworkPage = lazyLoad(() => import('@/modules/legislative').then(m => ({ default: m.OrdinanceFrameworkPage })));
const ResolutionFrameworkPage = lazyLoad(() => import('@/modules/legislative').then(m => ({ default: m.ResolutionFrameworkPage })));
const ServicesPage = lazyLoad(() => import('@/modules/services'));
const CertificatesPage = lazyLoad(() => import('@/modules/services').then(m => ({ default: m.CertificatesPage })));
const BusinessPage = lazyLoad(() => import('@/modules/services').then(m => ({ default: m.BusinessPage })));
const TaxPaymentsPage = lazyLoad(() => import('@/modules/services').then(m => ({ default: m.TaxPaymentsPage })));
const SocialServicesPage = lazyLoad(() => import('@/modules/services').then(m => ({ default: m.SocialServicesPage })));
const HealthPage = lazyLoad(() => import('@/modules/services').then(m => ({ default: m.HealthPage })));
const AgriculturePage = lazyLoad(() => import('@/modules/services').then(m => ({ default: m.AgriculturePage })));
const InfrastructurePage = lazyLoad(() => import('@/modules/services').then(m => ({ default: m.InfrastructurePage })));
const EducationPage = lazyLoad(() => import('@/modules/services').then(m => ({ default: m.EducationPage })));
const PublicSafetyPage = lazyLoad(() => import('@/modules/services').then(m => ({ default: m.PublicSafetyPage })));
const EnvironmentPage = lazyLoad(() => import('@/modules/services').then(m => ({ default: m.EnvironmentPage })));

export function AppRouter() {
  return (
    <LazyLoader>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        {/* Services Routes */}
        <Route
          path="/services"
          element={
            <Layout>
              <ServicesPage />
            </Layout>
          }
        />
        <Route
          path="/services/certificates"
          element={
            <Layout>
              <CertificatesPage />
            </Layout>
          }
        />
        <Route
          path="/services/business"
          element={
            <Layout>
              <BusinessPage />
            </Layout>
          }
        />
        <Route
          path="/services/tax-payments"
          element={
            <Layout>
              <TaxPaymentsPage />
            </Layout>
          }
        />
        <Route
          path="/services/social-services"
          element={
            <Layout>
              <SocialServicesPage />
            </Layout>
          }
        />
        <Route
          path="/services/health"
          element={
            <Layout>
              <HealthPage />
            </Layout>
          }
        />
        <Route
          path="/services/agriculture"
          element={
            <Layout>
              <AgriculturePage />
            </Layout>
          }
        />
        <Route
          path="/services/infrastructure"
          element={
            <Layout>
              <InfrastructurePage />
            </Layout>
          }
        />
        <Route
          path="/services/education"
          element={
            <Layout>
              <EducationPage />
            </Layout>
          }
        />
        <Route
          path="/services/public-safety"
          element={
            <Layout>
              <PublicSafetyPage />
            </Layout>
          }
        />
        <Route
          path="/services/environment"
          element={
            <Layout>
              <EnvironmentPage />
            </Layout>
          }
        />
        {/* Legislative Routes */}
        <Route
          path="/legislative"
          element={
            <Layout>
              <LegislativePage />
            </Layout>
          }
        />
        <Route
          path="/legislative/ordinances"
          element={
            <Layout>
              <OrdinanceFrameworkPage />
            </Layout>
          }
        />
        <Route
          path="/legislative/resolutions"
          element={
            <Layout>
              <ResolutionFrameworkPage />
            </Layout>
          }
        />
        {/* Other Nav Items */}
        <Route
          path="/government"
          element={
            <Layout>
              <GovernmentPage />
            </Layout>
          }
        />
        <Route
          path="/statistics"
          element={
            <Layout>
              <StatisticsPage />
            </Layout>
          }
        />
        <Route
          path="/transparency"
          element={
            <Layout>
              <TransparencyPage />
            </Layout>
          }
        />
        <Route
          path="/contact"
          element={
            <Layout>
              <ContactPage />
            </Layout>
          }
        />
        {/* 404 Not Found */}
        <Route
          path="*"
          element={
            <Layout>
              <NotFoundPage />
            </Layout>
          }
        />
      </Routes>
    </LazyLoader>
  );
}

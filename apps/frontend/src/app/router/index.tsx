import { Routes, Route } from 'react-router-dom';
import { lazyLoad, LazyLoader } from '@/app/router/lazy-loader';
import { Layout } from '@/app/shell/Layout';

const HomePage = lazyLoad(() => import('@/modules/landing'));
const NotFoundPage = lazyLoad(() => import('@/modules/errors').then(m => ({ default: m.NotFoundPage })));
const ComingSoonPage = lazyLoad(() => import('@/modules/common'));
const ContactPage = lazyLoad(() => import('@/modules/contact'));
const TransparencyPage = lazyLoad(() => import('@/modules/transparency'));

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
              <ComingSoonPage title="Services Coming Soon" subtitle="Our services directory is currently under development." />
            </Layout>
          }
        />
        <Route
          path="/services/certificates"
          element={
            <Layout>
              <ComingSoonPage title="Certificates Coming Soon" subtitle="Certificate application services are under construction." />
            </Layout>
          }
        />
        <Route
          path="/services/business"
          element={
            <Layout>
              <ComingSoonPage title="Business Services Coming Soon" subtitle="Business registration and permits are coming soon!" />
            </Layout>
          }
        />
        <Route
          path="/services/tax-payments"
          element={
            <Layout>
              <ComingSoonPage title="Tax Payments Coming Soon" subtitle="Online tax payment services are under development." />
            </Layout>
          }
        />
        <Route
          path="/services/social-services"
          element={
            <Layout>
              <ComingSoonPage title="Social Services Coming Soon" subtitle="Social services directory is coming soon!" />
            </Layout>
          }
        />
        <Route
          path="/services/health"
          element={
            <Layout>
              <ComingSoonPage title="Health Services Coming Soon" subtitle="Healthcare services information is under construction." />
            </Layout>
          }
        />
        <Route
          path="/services/agriculture"
          element={
            <Layout>
              <ComingSoonPage title="Agriculture Services Coming Soon" subtitle="Agricultural programs and services are coming soon!" />
            </Layout>
          }
        />
        <Route
          path="/services/infrastructure"
          element={
            <Layout>
              <ComingSoonPage title="Infrastructure Coming Soon" subtitle="Infrastructure project information is under development." />
            </Layout>
          }
        />
        <Route
          path="/services/education"
          element={
            <Layout>
              <ComingSoonPage title="Education Services Coming Soon" subtitle="Educational programs and scholarships are coming soon!" />
            </Layout>
          }
        />
        <Route
          path="/services/public-safety"
          element={
            <Layout>
              <ComingSoonPage title="Public Safety Coming Soon" subtitle="Public safety services and information is under construction." />
            </Layout>
          }
        />
        <Route
          path="/services/environment"
          element={
            <Layout>
              <ComingSoonPage title="Environment Services Coming Soon" subtitle="Environmental programs are coming soon!" />
            </Layout>
          }
        />
        {/* Legislative Routes */}
        <Route
          path="/legislative"
          element={
            <Layout>
              <ComingSoonPage title="Legislative Coming Soon" subtitle="Legislative information is currently under development." />
            </Layout>
          }
        />
        <Route
          path="/legislative/ordinances"
          element={
            <Layout>
              <ComingSoonPage title="Ordinance Framework Coming Soon" subtitle="Ordinance documentation is under construction." />
            </Layout>
          }
        />
        <Route
          path="/legislative/resolutions"
          element={
            <Layout>
              <ComingSoonPage title="Resolution Framework Coming Soon" subtitle="Resolution documentation is coming soon!" />
            </Layout>
          }
        />
        {/* Other Nav Items */}
        <Route
          path="/government"
          element={
            <Layout>
              <ComingSoonPage title="Government Coming Soon" subtitle="Government official information is under construction." />
            </Layout>
          }
        />
        <Route
          path="/statistics"
          element={
            <Layout>
              <ComingSoonPage title="Statistics Coming Soon" subtitle="Municipal statistics and data are coming soon!" />
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

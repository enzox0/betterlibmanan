import { Routes, Route } from 'react-router-dom';
import { lazyLoad, LazyLoader } from './lazy-loader';
import { Layout } from '../shell/Layout';

const HomePage = lazyLoad(() => import('../../modules/landing'));

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
      </Routes>
    </LazyLoader>
  );
}

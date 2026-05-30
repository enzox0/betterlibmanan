import { BrowserRouter } from 'react-router-dom';
import { Layout } from './Layout.tsx';

export function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

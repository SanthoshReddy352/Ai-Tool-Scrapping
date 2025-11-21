import HomePage from './pages/HomePage';
import ToolDetailPage from './pages/ToolDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import ScrapingLogsPage from './pages/ScrapingLogsPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
    visible: true
  },
  {
    name: 'Categories',
    path: '/categories',
    element: <CategoriesPage />,
    visible: true
  },
  {
    name: 'Search',
    path: '/search',
    element: <SearchPage />,
    visible: true
  },
  {
    name: 'About',
    path: '/about',
    element: <AboutPage />,
    visible: true
  },
  {
    name: 'Logs',
    path: '/logs',
    element: <ScrapingLogsPage />,
    visible: false
  },
  {
    name: 'Tool Detail',
    path: '/tool/:id',
    element: <ToolDetailPage />,
    visible: false
  }
];

export default routes;
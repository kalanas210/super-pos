import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';

// Dashboard Pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
import SalesPage from '@/pages/sales/SalesPage';
import ProductsPage from '@/pages/products/ProductsPage';
import InventoryPage from '@/pages/inventory/InventoryPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import UsersPage from '@/pages/users/UsersPage';
import InvoicesPage from '@/pages/invoices/InvoicesPage';

function AppRoutes() {
  const { user, loading } = useAuth();
  
  const router = createBrowserRouter([
    {
      path: '/',
      element: user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />,
    },
    {
      path: '/',
      element: <AuthLayout />,
      children: [
        {
          path: 'login',
          element: <LoginPage />,
        },
      ],
    },
    {
      path: '/',
      element: user ? <DashboardLayout /> : <Navigate to="/login" />,
      children: [
        {
          path: 'dashboard',
          element: <DashboardPage />,
        },
        {
          path: 'sales',
          element: <SalesPage />,
        },
        {
          path: 'products',
          element: <ProductsPage />,
        },
        {
          path: 'inventory',
          element: <InventoryPage />,
        },
        {
          path: 'invoices',
          element: <InvoicesPage />,
        },
        {
          path: 'reports',
          element: <ReportsPage />,
        },
        {
          path: 'users',
          element: <UsersPage />,
        },
        {
          path: 'settings',
          element: <SettingsPage />,
        },
      ],
    },
  ]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <RouterProvider router={router} />;
}

export default AppRoutes;
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/components/PublicLayout';
import { NotFoundPage } from '@/components/NotFoundPage';

// Customer-facing
import { HomePage } from '@/features/capacity/HomePage';
import { OrderFormPage } from '@/features/orders/OrderFormPage';
import { CartPage } from '@/features/orders/CartPage';
import { OrderConfirmationPage } from '@/features/orders/OrderConfirmationPage';
import { OrderLookupPage } from '@/features/orders/OrderLookupPage';
import { OrderStatusPage } from '@/features/orders/OrderStatusPage';
import { InspirationPage } from '@/features/featured/InspirationPage';

// Admin + auth
import { AdminLoginPage } from '@/features/auth/AdminLoginPage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { AdminLayout } from '@/features/admin/AdminLayout';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { AdminOrdersListPage } from '@/features/admin/AdminOrdersListPage';
import { AdminOrderDetailPage } from '@/features/admin/AdminOrderDetailPage';
import { AdminFeaturedPage } from '@/features/admin/AdminFeaturedPage';
import { AdminBoardPage } from '@/features/admin/AdminBoardPage';
import { AdminQuickUpdatePage } from '@/features/admin/AdminQuickUpdatePage';
import { CapacityManagerPage } from '@/features/capacity/CapacityManagerPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/order" element={<OrderFormPage />} />
        <Route path="/order/cart" element={<CartPage />} />
        <Route path="/order/confirmation" element={<OrderConfirmationPage />} />
        <Route path="/lookup" element={<OrderLookupPage />} />
        <Route path="/track/:token" element={<OrderStatusPage />} />
        <Route path="/inspiration" element={<InspirationPage />} />
      </Route>

      {/* Admin auth (public login) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin (protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersListPage />} />
        <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
        <Route path="board" element={<AdminBoardPage />} />
        <Route path="quick" element={<AdminQuickUpdatePage />} />
        <Route path="featured" element={<AdminFeaturedPage />} />
        <Route path="capacity" element={<CapacityManagerPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

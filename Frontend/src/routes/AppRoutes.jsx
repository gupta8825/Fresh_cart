import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/user/HomePage";
import ShopPage from "../pages/user/ShopPage";
import ProductDetailsPage from "../pages/user/ProductDetailsPage";
import CartPage from "../pages/user/CartPage";
import CheckoutPage from "../pages/user/CheckoutPage";
import PaymentPage from "../pages/user/PaymentPage";
import OrderSuccessPage from "../pages/user/OrderSuccessPage";
import DealsPage from "../pages/user/DealsPage";
import CategoriesPage from "../pages/user/CategoriesPage";
import AboutPage from "../pages/user/AboutPage";
import WishlistPage from "../pages/user/WishlistPage";
import OrdersPage from "../pages/user/OrdersPage";
import OrderDetailsPage from "../pages/user/OrderDetailsPage";
import TrackOrderPage from "../pages/user/TrackOrderPage";
import MasalaPage from "../pages/user/MasalaPage";
import AiAssistantPage from "../pages/user/AiAssistantPage";
import LoginPage from "../pages/user/LoginPage";
import RegisterPage from "../pages/user/RegisterPage";
import ForgotPasswordPage from "../pages/user/ForgotPasswordPage";
import ResetPasswordPage from "../pages/user/ResetPasswordPage";
import ProfilePage from "../pages/user/ProfilePage";
import AddressesPage from "../pages/user/AddressesPage";
import DemoGuard from "./DemoGuard";
import AdminGuard from "./AdminGuard";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import Overview from "../pages/admin/Overview";
import Analytics from "../pages/admin/Analytics";
import Products from "../pages/admin/Products";
import Categories from "../pages/admin/Categories";
import Orders from "../pages/admin/Orders";
import Customers from "../pages/admin/Customers";
import Inventory from "../pages/admin/Inventory";
import Coupons from "../pages/admin/Coupons";
import Payments from "../pages/admin/Payments";
import Tracking from "../pages/admin/Tracking";
import Notifications from "../pages/admin/Notifications";
import Reports from "../pages/admin/Reports";
import Activity from "../pages/admin/Activity";
import Settings from "../pages/admin/Settings";
import AiRequests from "../pages/admin/AiRequests";
import NotFoundPage from "../pages/user/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:id" element={<ProductDetailsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="order-success" element={<OrderSuccessPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="track-order/:id" element={<TrackOrderPage />} />
        <Route path="masala" element={<MasalaPage />} />
        <Route path="ai-shopping-assistant" element={<AiAssistantPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="profile" element={<DemoGuard><ProfilePage /></DemoGuard>} />
        <Route path="addresses" element={<DemoGuard><AddressesPage /></DemoGuard>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index element={<Dashboard />} />
        <Route path="overview" element={<Overview />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="requests" element={<AiRequests />} />
        <Route path="customers" element={<Customers />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="payments" element={<Payments />} />
        <Route path="tracking" element={<Tracking />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="activity" element={<Activity />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import Layout from "./components/Layout";

import UserDashboard from "./pages/user/UserDashboard";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MenuPage from "./pages/user/MenuPage";
import Orders from "./pages/user/Orders";
import Profile from "./pages/user/Profile";
import Cart from "./pages/user/Cart";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import DeliveryAdmin from "./pages/admin/DeliveryAdmin";
import MapDelivery from "./pages/delivery/MapDelivery";
import OrdersDelivery from "./pages/delivery/OrdersDelivery";

function App() {
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* ========== Guest Only ========== */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        {/* ========== USER ========== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
          <Route path="cart" element={<Cart />} />
        </Route>

        {/* ========== DELIVERY ========== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["delivery"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          <Route path="/delivery/map" element={<MapDelivery />} />
          <Route path="/delivery/orders" element={<OrdersDelivery />} />
        </Route>

        {/* ========== ADMIN ========== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<OrdersAdmin />} />
          <Route path="/admin/products" element={<ProductsAdmin />} />
          <Route path="/admin/delivery" element={<DeliveryAdmin />} />
        </Route>

        {/* ========== Fallback ========== */}
        <Route path="*" element={<GuestRoute><Login /></GuestRoute>} />
      </Routes>
    </div>
  );
}

export default App;
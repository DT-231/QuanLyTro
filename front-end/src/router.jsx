import { createBrowserRouter } from "react-router-dom";

// --- Layouts ---
import App from "./App";
import AdminLayout from "./components/layouts/AdminLayout";
import MemberLayout from "./components/layouts/MemberLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// --- Public Pages---
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";

// --- Admin Pages---
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import AccountManagement from "./pages/admin/AccountManagement";
import InvoiceManagement from "./pages/admin/InvoiceManagement";
import BuildingManagement from "./pages/admin/BuildingManagement";
import RoomManagement from "./pages/admin/RoomManagement";
import ContractManagement from "./pages/admin/ContractManagement";
import IssueManagement from "./pages/admin/IssueManagement";

// --- Member Pages---
import ProfilePage from "./pages/member/ProfilePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // 1. PUBLIC ROUTES
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "search-rooms", element: <div className="p-10 text-center">Trang Tìm kiếm phòng (Đang phát triển)</div> },
      // 2. MEMBER ROUTES 
      {
        path: "member",
        element: <ProtectedRoute allowedRoles={['user']}><MemberLayout /></ProtectedRoute>,
        children: [
          { path: "profile", element: <ProfilePage /> },
          { path: "my-contracts", element: <div className="p-10">Hợp đồng của tôi (Đang phát triển)</div> },
          { path: "my-invoices", element: <div className="p-10">Hóa đơn của tôi (Đang phát triển)</div> },
          { path: "incidents", element: <div className="p-10">Báo cáo sự cố (Đang phát triển)</div> },
        ]
      }
    ]
  },

  // 3. ADMIN ROUTES 
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>,
    children: [
      { path: "dashboard", element: <DashboardAdmin /> },
      { path: "users", element: <AccountManagement /> },
      { path: "buildings", element: <BuildingManagement /> },
      { path: "rooms", element: <RoomManagement /> },
      { path: "invoices", element: <InvoiceManagement /> },
      { path: "contracts", element: <ContractManagement /> },
      { path: "incidents", element: <IssueManagement /> },
    ]
  },

  // 404 Not Found
  { path: "*", element: <div className="p-20 text-center text-red-500 font-bold text-2xl">404 - Trang không tồn tại</div> }
]);

export default router;
/**
 * App - Root component của ứng dụng
 *
 * Layout structure:
 * - Header: Thanh điều hướng trên cùng
 * - Sidebar: Menu bên trái (chỉ hiển thị khi đã đăng nhập)
 * - Main: Nội dung chính (render từ Router)
 *
 * Features:
 * - Responsive sidebar (mobile: overlay, desktop: fixed)
 * - Toast notifications (sonner)
 * - Protected route handling
 */
import { Outlet, useLocation } from "react-router-dom";
import { Toaster, toast } from "sonner";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";
import { useState } from "react";

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // State cho mobile sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Các trang không hiển thị sidebar (auth pages)
  const hideSidebarOnPaths = ["/login", "/register", "/forgot-password"];
  const shouldShowSidebar =
    user &&
    !hideSidebarOnPaths.some((path) => location.pathname.startsWith(path));

  // Xác định role để hiển thị menu phù hợp
  const isGuest = !user || !user.role;
  const sidebarRoleDisplay = isGuest ? "TENANT" : user.role;

  /**
   * Chặn click vào link protected khi chưa đăng nhập
   * Hiển thị toast warning thay vì navigate
   */
  const handleSidebarClick = (e) => {
    if (!isGuest) return;
    const link = e.target.closest("a");

    if (link) {
      const href = link.getAttribute("href");
      // Cho phép navigate về trang chủ
      if (href !== "/") {
        e.preventDefault();
        e.stopPropagation();
        toast.warning("Yêu cầu đăng nhập", {
          description: "Vui lòng đăng nhập để sử dụng tính năng này!",
          duration: 2000,
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
      {/* Toast notifications - position top-right */}
      <Toaster position="top-right" richColors />

      {/* Header với user info và hamburger menu */}
      <Header
        user={user}
        onLogout={logout}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - chỉ hiển thị khi đã login và không ở auth pages */}
        {shouldShowSidebar && (
          <div onClickCapture={handleSidebarClick}>
            <Sidebar
              role={sidebarRoleDisplay}
              isOpen={isSidebarOpen}
              setIsOpen={setIsSidebarOpen}
            />
          </div>
        )}

        {/* Main content area */}
        <main className={`flex-1 transition-all duration-300 ease-in-out `}>
          <div className="h-full overflow-y-auto p-4 md:p-6 scroll-smooth">
            <div className="mx-auto w-full pb-10">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

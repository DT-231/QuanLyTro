import { Outlet, useLocation } from "react-router-dom";
import { Toaster, toast } from "sonner";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";
import { useState } from "react";

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const hideSidebarOnPaths = ["/login", "/register", "/forgot-password"];
  const shouldShowSidebar =
    user &&
    !hideSidebarOnPaths.some((path) => location.pathname.startsWith(path));

  const isGuest = !user || !user.role;
  const sidebarRoleDisplay = isGuest ? "TENANT" : user.role;

  // This logic is to prevent guests from clicking on protected links
  const handleSidebarClick = (e) => {
    if (!isGuest) return;
    const link = e.target.closest("a");

    if (link) {
      const href = link.getAttribute("href");
      // Allow navigation to home, but block others
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
      <Toaster position="top-right" richColors />

      <Header
        user={user}
        onLogout={logout}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {shouldShowSidebar && (
          <div onClickCapture={handleSidebarClick}>
            <Sidebar
              role={sidebarRoleDisplay}
              isGuest={isGuest}
              isOpen={isSidebarOpen}
              setIsOpen={setIsSidebarOpen}
            />
          </div>
        )}

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

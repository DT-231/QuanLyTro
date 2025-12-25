/**
 * Sidebar - Component thanh điều hướng bên trái
 * 
 * Hiển thị menu điều hướng dựa trên role của user:
 * - ADMIN: Quản lý toàn bộ hệ thống
 * - TENANT: Khách thuê - quản lý hợp đồng, hóa đơn, sự cố
 * - CUSTOMER/USER: Khách hàng - xem thông tin cá nhân
 * - GUEST: Chưa đăng nhập - chỉ xem trang chủ
 */
import {
  Home,
  Users,
  Building2,
  BedDouble,
  FileText,
  ScrollText,
  AlertTriangle,
  UserCircle,
  X,
  CalendarDays,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Fragment } from "react";

/**
 * Helper: Gộp các class CSS, lọc bỏ giá trị falsy
 * @param {...string} classes - Danh sách class CSS
 * @returns {string} Chuỗi class đã gộp
 */
const cn = (...classes) => classes.filter(Boolean).join(" ");

// ==================================================================================
// MENU CONFIGURATION - Cấu hình menu theo từng role
// ==================================================================================

/** Menu cho ADMIN - Quản lý toàn bộ hệ thống */
const adminMenu = [
  { name: "Trang chủ", icon: Home, href: "/admin/dashboard" },
  { name: "Lịch hẹn", icon: CalendarDays, href: "/admin/appointments" },
  { name: "Quản lý tài khoản", icon: Users, href: "/admin/users" },
  { name: "Toà nhà", icon: Building2, href: "/admin/buildings" },
  { name: "Phòng", icon: BedDouble, href: "/admin/rooms" },
  { name: "Hoá đơn", icon: FileText, href: "/admin/invoices" },
  { name: "Hợp đồng", icon: ScrollText, href: "/admin/contracts" },
  { name: "Xử lý sự cố", icon: AlertTriangle, href: "/admin/incidents" },
];

/** Menu cho CUSTOMER - Khách hàng chưa thuê phòng */
const customerMenu = [
  { name: "Trang chủ", icon: Home, href: "/" },
  { name: "Hồ sơ của tôi", icon: UserCircle, href: "/member/profile" },
  { name: "Hợp đồng của tôi", icon: ScrollText, href: "/member/my-contracts" },
];

/** Menu cho TENANT - Khách thuê đang có hợp đồng */
const tenantMenu = [
  ...customerMenu,
  { name: "Hoá đơn cần đóng", icon: FileText, href: "/member/my-invoices" },
  { name: "Báo cáo sự cố", icon: AlertTriangle, href: "/member/incidents" },
];

/** Menu cho GUEST - Chưa đăng nhập */
const guestMenu = [{ name: "Trang chủ", icon: Home, href: "/" }];

/**
 * Sidebar Component
 * 
 * @param {Object} props
 * @param {string} props.role - Role của user (ADMIN, TENANT, CUSTOMER, USER)
 * @param {boolean} props.isOpen - Trạng thái mở/đóng sidebar (mobile)
 * @param {Function} props.setIsOpen - Hàm cập nhật trạng thái sidebar
 */
export default function Sidebar({ role, isOpen, setIsOpen }) {
  const location = useLocation();

  let menuItems = guestMenu;
  if (role === "ADMIN") {
    menuItems = adminMenu;
  } else if (role === "TENANT") {
    menuItems = tenantMenu;
  } else if (["CUSTOMER", "user", "USER"].includes(role)) {
    menuItems = customerMenu;
  }

  return (
    <Fragment>
      {/* Overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-30 lg:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={() => setIsOpen(false)}
      ></div>

      <div
        className={cn(
          "w-[200px] h-full border-r bg-white py-4 flex flex-col shrink-0 transition-transform duration-300 ease-in-out z-40",
          // Mobile states
          "fixed top-0 left-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-4 mb-4 lg:hidden">
            <h2 className="text-lg font-bold">Menu</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={24}/>
            </button>
        </div>

        {/* MENU */}
        <nav className="flex flex-col gap-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition font-medium",
                  active
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => setIsOpen(false)} // Close sidebar on link click on mobile
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </Fragment>
  );
}

import React, { useState, useMemo } from "react";
import { 
  FaDollarSign, 
  FaBuilding, 
  FaExclamationCircle, 
  FaDoorOpen,
  FaFileContract, 
  FaUserFriends, 
  FaFileInvoiceDollar, 
  FaFileSignature, 
  FaWrench,
  FaCalendarAlt 
} from "react-icons/fa";
import { FiChevronDown, FiCalendar } from "react-icons/fi";

const Dashboard = () => {
  // ==================================================================================
  // 1. MOCK DATA (GIẢ LẬP DB)
  // Sau này bạn sẽ gọi API để lấy 2 mảng này về thay thế cho mockRooms và mockIssues
  // ==================================================================================

// --- STATE CHO DROPDOWN THÁNG ---
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Tháng 10"); // Giá trị mặc định

  // Danh sách tháng giả lập
  const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

  // Hàm xử lý khi chọn tháng
  const handleSelectMonth = (month) => {
    setSelectedMonth(month);
    setIsMonthOpen(false); // Đóng menu sau khi chọn
    // Tại đây có thể gọi API để load lại dữ liệu theo tháng...
  };

  // Dữ liệu Phòng (Copy cấu trúc từ RoomManagement)
  const mockRooms = [
    { id: 101, number: "101", status: "Đang thuê", price: 7000000 },
    { id: 110, number: "110", status: "Đang thuê", price: 2000000 },
    { id: 220, number: "220", status: "Đang thuê", price: 3500000 },
    { id: 430, number: "430", status: "Bảo trì", price: 2500000 },
    { id: 550, number: "550", status: "Đang thuê", price: 5000000 },
    { id: 601, number: "601", status: "Đang thuê", price: 10000000 },
    { id: 602, number: "602", status: "Trống", price: 7000000 },
    // Thêm vài phòng giả lập để số liệu phong phú hơn
    { id: 603, number: "603", status: "Trống", price: 4500000 }, 
    { id: 604, number: "604", status: "Đang thuê", price: 4000000 },
    { id: 605, number: "605", status: "Trống", price: 3000000 },
  ];

  // Dữ liệu Sự cố (Copy cấu trúc từ IssueManagement)
  const mockIssues = [
    { id: 101, status: "Chưa xử lý" },
    { id: 110, status: "Đã xử lý" },
    { id: 220, status: "Đã xử lý" },
    { id: 430, status: "Đang xử lý" },
    { id: 550, status: "Đã xử lý" },
    { id: 601, status: "Đã xử lý" },
    // Thêm sự cố chưa xử lý để test cảnh báo đỏ
    { id: 603, status: "Chưa xử lý" }, 
  ];

  // Dữ liệu Hoạt động & Lịch hẹn (Tạm thời hardcode, sau này cũng lấy từ API)
  const recentActivities = [
    { id: 1, type: "payment", title: "Thanh toán hóa đơn", desc: "Nguyễn Văn A - Phòng 101 - 5,000,000đ", time: "5 phút trước" },
    { id: 2, type: "contract", title: "Hợp đồng mới", desc: "Trần Thị B ký hợp đồng Phòng 205", time: "10 phút trước" },
    { id: 3, type: "issue", title: "Yêu cầu sửa chữa", desc: "Lê Văn C - Phòng 303 - Điều hòa hỏng", time: "30 phút trước" },
  ];

  const appointments = [
    { id: 1, name: "Nguyễn thanh tú", phone: "0934970856", time: "14:00 05/11/2025", room: "Phòng 101" },
    { id: 2, name: "Nguyễn Toàn chung", phone: "0934970856", time: "14:00 05/11/2025", room: "Phòng 205" },
    { id: 3, name: "Nguyễn Phương Hà", phone: "0934970856", time: "14:00 05/11/2025", room: "Phòng 301" },
  ];

  // ==================================================================================
  // 2. LOGIC TÍNH TOÁN TỰ ĐỘNG (REAL-TIME CALCULATION)
  // ==================================================================================
  const stats = useMemo(() => {
    // a. Tính tổng phòng
    const totalRooms = mockRooms.length;

    // b. Tính phòng trống (Status === "Trống")
    const emptyRooms = mockRooms.filter(r => r.status === "Trống").length;

    // c. Tính tổng sự cố
    const totalIssues = mockIssues.length;
    
    
    // e. Tính doanh thu dự kiến (Tổng giá thuê các phòng 'Đang thuê')
    const revenue = mockRooms
      .filter(r => r.status === "Đang thuê" || r.status === "Đã thuê") // Handle cả 2 case text nếu có
      .reduce((sum, room) => sum + room.price, 0);

    return {
      revenue,
      revenueTrend: 12.5, // Giả lập tăng trưởng (cần API lịch sử để tính thật)
      totalRooms,
      emptyRooms,
      emptyTrend: -5, // Giả lập giảm
      totalIssues,

      expiringContracts: 0, // Giả lập (cần dữ liệu ngày hết hạn hợp đồng để tính)
      unregisteredTemp: 0,  // Giả lập
    };
  }, [mockRooms, mockIssues]);

  // Helper format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Helper icon hoạt động
  const getActivityIcon = (type) => {
    switch (type) {
      case "payment": return <div className="p-3 rounded-lg bg-green-100 text-green-600"><FaFileInvoiceDollar size={20} /></div>;
      case "contract": return <div className="p-3 rounded-lg bg-blue-100 text-blue-600"><FaFileSignature size={20} /></div>;
      case "issue": return <div className="p-3 rounded-lg bg-orange-100 text-orange-600"><FaWrench size={20} /></div>;
      default: return null;
    }
  };

  const dateRangeLabel = useMemo(() => {
    const today = new Date();
    
    // Tính tháng tiếp theo (JS tự động xử lý đổi năm nếu là tháng 12)
    const nextMonthDate = new Date(today);
    nextMonthDate.setMonth(today.getMonth() + 1);

    // Helper format: d.getMonth() + 1 vì tháng trong JS bắt đầu từ 0
    const format = (d) => `${d.getMonth() + 1}/${d.getFullYear()}`;

    return `${format(today)} - ${format(nextMonthDate)}`;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Trang chủ</h1>
        
        {/* Filter Group - Giống mẫu các trang khác */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
              Tất cả toà nhà <FiChevronDown />
            </button>
          </div>
          <div className="relative">
            <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
              <FiCalendar /> {dateRangeLabel}
            </button>
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsMonthOpen(!isMonthOpen)}
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all min-w-[120px] justify-between"
            >
              {selectedMonth} <FiChevronDown className={`transition-transform ${isMonthOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menu Dropdown hiện ra khi isMonthOpen = true */}
            {isMonthOpen && (
              <div className="absolute top-full mt-1 right-0 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {months.map((m) => (
                  <div 
                    key={m}
                    onClick={() => handleSelectMonth(m)}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="bg-gray-900 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-800 shadow-sm transition-all">
            Báo cáo
          </button>
        </div>
      </div>

      {/* --- STATS ROW 1 (4 Cards - Grid 4 cột) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        
        {/* Card 1: Doanh thu */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-600">Doanh thu tạm tính</span>
            <FaDollarSign className="text-gray-400" size={14} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.revenue)}
          </div>
          <div className="text-xs font-medium text-green-500">
            +{stats.revenueTrend}% so với tháng trước
          </div>
        </div>

        {/* Card 2: Tổng phòng (Lấy từ mockRooms) */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-600">Tổng phòng</span>
            <FaBuilding className="text-gray-400" size={14} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalRooms}
          </div>
        </div>

        {/* Card 3: Phòng trống (Lấy từ mockRooms) */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-600">Phòng trống</span>
            <FaDoorOpen className="text-gray-400" size={14} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.emptyRooms}
          </div>
          <div className="text-xs font-medium text-red-500">
            {stats.emptyTrend}% so với tháng trước
          </div>
        </div>

        {/* Card 4: Sự cố (Lấy từ mockIssues) */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-600">Tổng sự cố</span>
            <FaExclamationCircle className="text-yellow-500" size={16} />
          </div>
          <div className="flex items-baseline gap-2">
             <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalIssues}
             </div>
             
          </div>
        </div>
      </div>

      {/* --- STATS ROW 2 (2 Cards - Grid 2 cột) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 mb-4">
        {/* Card 5: Hợp đồng hết hạn */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-600">Hợp đồng sắp hết hạn</span>
            <FaFileContract className="text-gray-400" size={14} />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.expiringContracts}
          </div>
        </div>

        {/* Card 6: Tạm trú */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-600">Chưa đăng ký tạm trú</span>
            <FaUserFriends className="text-gray-400" size={16} />
          </div>
          <div className="text-2xl font-bold text-green-500">
            {stats.unregisteredTemp}
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION (Activity & Appointment) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột Trái: Hoạt động gần đây (Chiếm 2/3) */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Hoạt động gần đây</h3>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {recentActivities.map((item) => (
              <div key={item.id} className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-md transition-colors -mx-2">
                <div className="flex items-center gap-4">
                  {getActivityIcon(item.type)}
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cột Phải: Hẹn xem phòng (Chiếm 1/3) */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Hẹn xem phòng</h3>
            <FaCalendarAlt className="text-gray-400" />
          </div>
          <div className="p-5 flex flex-col gap-3">
            {appointments.map((apt) => (
              <div 
                key={apt.id} 
                className="bg-blue-50/50 p-3 rounded-r-md border-l-4 border-blue-500 flex justify-between items-start hover:bg-blue-100/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-0.5">{apt.name}</p>
                  <p className="text-xs text-gray-500">{apt.phone}</p>
                  <p className="text-xs text-gray-400 mt-1">{apt.time}</p>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {apt.room}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
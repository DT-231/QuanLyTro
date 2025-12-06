import React, { useState, useMemo } from "react";
import { FaSearch, FaEdit, FaTrashAlt, FaPlus, FaBuilding } from "react-icons/fa";
import { FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Giả sử bạn sẽ tạo Modal thêm phòng sau (hoặc dùng lại Modal toà nhà tuỳ ý)
// import AddRoomModal from "@/components/modals/AddRoomModal"; 

const RoomManagement = () => {
  // 1. Mock Data (Dựa trên hình ảnh Quản lý phòng bạn cung cấp)
  const mockRooms = [
    {
      id: 101,
      number: "101",
      building: "Chung cư Hoàng Anh Gia Lai",
      area: 50,
      maxPeople: 4,
      currentPeople: 2,
      status: "Đang thuê",
      price: 7000000,
      representative: "Phan Mạnh Quỳnh",
    },
    {
      id: 110,
      number: "110",
      building: "VinHome Quận 7",
      area: 40,
      maxPeople: 2,
      currentPeople: 2,
      status: "Đang thuê",
      price: 2000000,
      representative: "Lâm Minh Phú",
    },
    {
      id: 220,
      number: "220",
      building: "VinHome Quận 7",
      area: 40,
      maxPeople: 6,
      currentPeople: 5,
      status: "Đang thuê",
      price: 3500000,
      representative: "Lý Thành Ân",
    },
    {
      id: 430,
      number: "430",
      building: "VinHome Quận 7",
      area: 45,
      maxPeople: 3,
      currentPeople: 0,
      status: "Bảo trì",
      price: 2500000,
      representative: "Đinh Bảo Toàn",
    },
    {
      id: 550,
      number: "550",
      building: "Chung cư Hoàng Anh Gia Lai",
      area: 38,
      maxPeople: 4,
      currentPeople: 4,
      status: "Đang thuê",
      price: 5000000,
      representative: "Nguyễn Việt Dũng",
    },
    {
      id: 601,
      number: "601",
      building: "Chung cư Hoàng Anh Gia Lai",
      area: 36,
      maxPeople: 2,
      currentPeople: 2,
      status: "Đang thuê",
      price: 10000000,
      representative: "Bùi Phú Hùng",
    },
    {
      id: 602,
      number: "602",
      building: "VinHome Quận 7",
      area: 75,
      maxPeople: 2,
      currentPeople: 0,
      status: "Trống",
      price: 7000000,
      representative: "",
    },
  ];

  // 2. States
  const [rooms, setRooms] = useState(mockRooms);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBuilding, setFilterBuilding] = useState(""); // Lọc theo toà nhà
  const [filterStatus, setFilterStatus] = useState(""); // Lọc theo trạng thái
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 3. Logic Lọc dữ liệu (useMemo)
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // a. Tìm kiếm: Theo số phòng hoặc tên đại diện
      const matchesSearch =
        room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.representative && room.representative.toLowerCase().includes(searchTerm.toLowerCase()));

      // b. Lọc theo Toà nhà
      const matchesBuilding = filterBuilding
        ? room.building === filterBuilding
        : true;

      // c. Lọc theo Trạng thái
      const matchesStatus = filterStatus
        ? room.status === filterStatus
        : true;

      return matchesSearch && matchesBuilding && matchesStatus;
    });
  }, [rooms, searchTerm, filterBuilding, filterStatus]);

  // Logic phân trang
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const currentData = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 4. Helper: Format tiền tệ VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // 5. Helper: Màu sắc trạng thái (Giống hình ảnh: Đen, Vàng, Xanh lá)
  const getStatusColor = (status) => {
    switch (status) {
      case "Đang thuê":
        return "bg-gray-900 text-white"; // Màu đen
      case "Trống":
        return "bg-green-500 text-white"; // Màu xanh lá
      case "Bảo trì":
        return "bg-yellow-400 text-gray-800"; // Màu vàng
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý phòng</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm transition-all shadow-sm"
        >
          <FaPlus size={10} /> Thêm phòng
        </button>
      </div>

      {/* --- KHU VỰC TÌM KIẾM & LỌC --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Tìm kiếm và lọc
        </h3>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-1/3 flex items-center">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-gray-50"
                placeholder="Tìm theo số phòng, người đại diện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <button className="ml-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 font-medium">
              Tìm
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-2 w-full md:w-auto justify-end">
            {/* Filter Toà Nhà */}
            <div className="relative w-full md:w-48">
              <select
                className="w-full appearance-none border border-gray-200 px-3 py-2 pr-8 rounded-md bg-white hover:bg-gray-50 text-sm focus:outline-none cursor-pointer text-gray-700"
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
              >
                <option value="">Tất cả toà nhà</option>
                <option value="Chung cư Hoàng Anh Gia Lai">Chung cư Hoàng Anh...</option>
                <option value="VinHome Quận 7">VinHome Quận 7</option>
              </select>
              <FiFilter className="absolute right-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Filter Trạng Thái */}
            <div className="relative w-full md:w-40">
              <select
                className="w-full appearance-none border border-gray-200 px-3 py-2 pr-8 rounded-md bg-white hover:bg-gray-50 text-sm focus:outline-none cursor-pointer text-gray-700"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Trạng thái</option>
                <option value="Đang thuê">Đang thuê</option>
                <option value="Trống">Trống</option>
                <option value="Bảo trì">Bảo trì</option>
              </select>
              <FiFilter className="absolute right-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { title: "Tổng số phòng", value: rooms.length },
          { title: "Đang thuê", value: rooms.filter((r) => r.status === "Đang thuê").length },
          { title: "Phòng trống", value: rooms.filter((r) => r.status === "Trống").length },
          { title: "Đang bảo trì", value: rooms.filter((r) => r.status === "Bảo trì").length },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-24"
          >
            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* --- DANH SÁCH PHÒNG (Table) --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Danh sách phòng</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-xs font-bold border-b border-gray-200 uppercase">
              <tr>
                <th className="p-4">Phòng</th>
                <th className="p-4">Toà nhà</th>
                <th className="p-4 text-center">Diện tích (m²)</th>
                <th className="p-4 text-center">Tối đa (người)</th>
                <th className="p-4 text-center">Hiện ở</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Giá thuê</th>
                <th className="p-4">Đại diện</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {currentData.length > 0 ? (
                currentData.map((room) => (
                  <tr
                    key={room.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-4 font-bold text-gray-900">{room.number}</td>
                    <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                         {/* Icon nhỏ cho đẹp */}
                        <FaBuilding className="text-gray-400 text-xs" />
                        <span className="truncate max-w-[180px]" title={room.building}>{room.building}</span>
                    </td>
                    <td className="p-4 text-center">{room.area}</td>
                    <td className="p-4 text-center">{room.maxPeople}</td>
                    <td className="p-4 text-center font-bold text-gray-900">{room.currentPeople}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`${getStatusColor(
                          room.status
                        )} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-transparent shadow-sm`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900">
                        {formatCurrency(room.price)}
                    </td>
                    <td className="p-4 text-gray-600">{room.representative}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 border border-gray-200 rounded hover:bg-gray-900 hover:text-white text-gray-500 transition-all shadow-sm">
                          <FaEdit size={14} />
                        </button>
                        <button className="p-2 border border-red-100 rounded hover:bg-red-500 hover:text-white text-red-500 transition-all shadow-sm bg-red-50">
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500 italic">
                    Không tìm thấy phòng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER & PAGINATION --- */}
        <div className="p-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            Hiển thị {currentData.length} trên tổng số {filteredRooms.length} phòng
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors 
                 text-gray-600 hover:bg-gray-100 
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <FiChevronLeft /> Prev
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  currentPage === idx + 1
                    ? "bg-gray-900 text-white font-medium shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100 
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
      
      {/* Placeholder cho Modal thêm phòng */}
      {/* <AddRoomModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} /> */}
    </div>
  );
};

export default RoomManagement;
import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaBuilding,
} from "react-icons/fa";
import { FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import AddBuildingModal from '@/components/modals/AddBuildingModal';

const BuildingManagement = () => {
  // 1. Mock Data (Dữ liệu giả lập theo hình ảnh bạn cung cấp)
  const mockBuildings = [
    {
      id: 1,
      name: "Chung cư Hoàng Anh",
      address: "72 Hàm Nghi, Đà Nẵng",
      totalRooms: 15,
      empty: 1,
      rented: 14,
      utilities: "Thang máy, Wifi",
      createdDate: "10/02/2025",
      status: "Hoạt động",
    },
    {
      id: 2,
      name: "VinHome Quận 7",
      address: "512 Nguyễn Xiển, P. Long Thạnh Mỹ",
      totalRooms: 5,
      empty: 1,
      rented: 4,
      utilities: "Hồ bơi, Gym",
      createdDate: "23/01/2025",
      status: "Hoạt động",
    },
    {
      id: 3,
      name: "VinHome Quận 7 - Block B",
      address: "512 Nguyễn Xiển, P. Long Thạnh Mỹ",
      totalRooms: 5,
      empty: 0,
      rented: 5,
      utilities: "Full nội thất",
      createdDate: "23/01/2025",
      status: "Đầy phòng",
    },
    {
      id: 4,
      name: "Căn hộ dịch vụ An Thượng",
      address: "An Thượng 2, Ngũ Hành Sơn",
      totalRooms: 10,
      empty: 5,
      rented: 5,
      utilities: "Máy giặt chung",
      createdDate: "20/01/2025",
      status: "Bảo trì",
    },
    {
      id: 5,
      name: "Ký túc xá Bách Khoa",
      address: "54 Nguyễn Lương Bằng",
      totalRooms: 50,
      empty: 12,
      rented: 38,
      utilities: "Căn tin, Giữ xe",
      createdDate: "15/01/2025",
      status: "Hoạt động",
    },
    {
      id: 1,
      name: "Chung cư Hoàng ",
      address: "72 Hàm Nghi, Đà Nẵng",
      totalRooms: 15,
      empty: 1,
      rented: 14,
      utilities: "Thang máy, Wifi",
      createdDate: "10/02/2025",
      status: "Hoạt động",
    },
    {
      id: 2,
      name: "VinHome Quận 7",
      address: "512 Nguyễn Xiển, P. Long Thạnh Mỹ",
      totalRooms: 5,
      empty: 1,
      rented: 4,
      utilities: "Hồ bơi, Gym",
      createdDate: "23/01/2025",
      status: "Hoạt động",
    },
    {
      id: 3,
      name: "VinHome Quận 7 - Block B",
      address: "512 Nguyễn Xiển, P. Long Thạnh Mỹ",
      totalRooms: 5,
      empty: 0,
      rented: 5,
      utilities: "Full nội thất",
      createdDate: "23/01/2025",
      status: "Đầy phòng",
    },
    {
      id: 4,
      name: "Căn hộ dịch vụ An Thượng",
      address: "An Thượng 2, Ngũ Hành Sơn",
      totalRooms: 10,
      empty: 5,
      rented: 5,
      utilities: "Máy giặt chung",
      createdDate: "20/01/2025",
      status: "Bảo trì",
    },
    {
      id: 5,
      name: "Ký túc xá Bách Khoa",
      address: "54 Nguyễn Lương Bằng",
      totalRooms: 50,
      empty: 12,
      rented: 38,
      utilities: "Căn tin, Giữ xe",
      createdDate: "15/01/2025",
      status: "Hoạt động",
    },
  ];

  // 2. States
  const [buildings, setBuildings] = useState(mockBuildings);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // "" = Tất cả

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Pagination States (Giả lập)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 3. Logic Lọc dữ liệu (useMemo)
  const filteredBuildings = useMemo(() => {
    return buildings.filter((building) => {
      // a. Lọc theo từ khóa (Tên toà nhà, Địa chỉ)
      const matchesSearch =
        building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        building.address.toLowerCase().includes(searchTerm.toLowerCase());

      // b. Lọc theo trạng thái (Dropdown)
      const matchesStatus = filterStatus
        ? building.status === filterStatus
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [buildings, searchTerm, filterStatus]);

const handleAddBuilding = (newBuildingData) => {
    // Tạo ID giả ngẫu nhiên
    const newId = Math.floor(Math.random() * 1000) + 100;
    const buildingToAdd = {
        id: newId,
        ...newBuildingData
    };

    // Thêm vào đầu danh sách
    setBuildings([buildingToAdd, ...buildings]);
    alert("Thêm toà nhà thành công!");
  };

  
  // Logic phân trang đơn giản
  const totalPages = Math.ceil(filteredBuildings.length / itemsPerPage);
  const currentData = filteredBuildings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý toà nhà</h1>
        <button
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          <FaPlus size={10} /> Thêm toà nhà
        </button>
      </div>

      {/* --- KHU VỰC TÌM KIẾM & LỌC (Giống AccountManagement) --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Tìm kiếm và lọc
        </h3>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-2/3 flex items-center">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-gray-50"
                placeholder="Nhập tên toà nhà, địa chỉ, tiện ích..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="ml-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 font-medium">
              Tìm
            </button>
          </div>

          {/* Filter Dropdown */}
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <div className="relative w-full md:w-48">
              <select
                className="w-full appearance-none border border-gray-200 px-3 py-2 pr-8 rounded-md bg-white hover:bg-gray-50 text-sm focus:outline-none cursor-pointer text-gray-700"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Chọn trạng thái</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Đầy phòng">Đầy phòng</option>
                <option value="Bảo trì">Bảo trì</option>
              </select>
              <FiFilter className="absolute right-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* --- DANH SÁCH TOÀ NHÀ (Table) --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Danh sách toà nhà</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white  text-xs font-bold border-b border-gray-200 uppercase">
              <tr>
                <th className="p-4">Tên toà nhà</th>
                <th className="p-4">Địa chỉ toà nhà</th>
                <th className="p-4 text-center">Tổng phòng</th>
                <th className="p-4 text-center">Phòng trống</th>
                <th className="p-4 text-center">Đang thuê</th>
                <th className="p-4">Tiện ích</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {currentData.length > 0 ? (
                currentData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-2 rounded text-gray-500">
                          <FaBuilding size={14} />
                        </div>
                        {item.name}
                      </div>
                    </td>
                    <td
                      className="p-4 text-gray-600 max-w-xs truncate"
                      title={item.address}
                    >
                      {item.address}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {item.totalRooms}
                    </td>
                    <td className="p-4 text-center text-red-500 font-bold">
                      {item.empty}
                    </td>
                    <td className="p-4 text-center text-green-600 font-bold">
                      {item.rented}
                    </td>
                    <td className="p-4 text-gray-500 truncate max-w-[150px]">
                      {item.utilities}
                    </td>
                    <td className="p-4">{item.createdDate}</td>
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
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    Không tìm thấy toà nhà nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER & PAGINATION --- */}
        <div className="p-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-gray-500 font-medium">
            Hiển thị {currentData.length} trên tổng số{" "}
            {filteredBuildings.length} tòa nhà
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
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === idx + 1
                    ? "bg-gray-100 text-black font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100 
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
      <AddBuildingModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAddSuccess={handleAddBuilding}
      />
    </div>
  );
};

export default BuildingManagement;

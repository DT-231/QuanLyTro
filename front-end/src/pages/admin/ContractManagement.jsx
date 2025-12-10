import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaTrashAlt,
  FaPlus,
  FaFileContract,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaExternalLinkAlt,
  FaEdit
} from "react-icons/fa";
import { FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import AddContractModal from "@/components/modals/AddContractModal";

const ContractManagement = () => {
  // 1. Mock Data (Dựa trên hình ảnh Quản lý hợp đồng)
  const mockContracts = [
    {
      id: 1,
      code: "HD01",
      room: "111",
      tenant: "Phan Mạnh Quỳnh",
      building: "Chung cư Hoàng Anh Gia Lai",
      startDate: "15/02/2025",
      endDate: "14/12/2025",
      price: 2000000,
      status: "Đã hết hạn",
    },
    {
      id: 2,
      code: "HD02",
      room: "118",
      tenant: "Lâm Minh Phú",
      building: "VinHome quận 7",
      startDate: "15/02/2025",
      endDate: "14/12/2025",
      price: 2000000,
      status: "Đang hoạt động",
    },
    {
      id: 3,
      code: "HD03",
      room: "200",
      tenant: "Lý Thành Ân",
      building: "VinHome quận 7",
      startDate: "15/02/2025",
      endDate: "14/12/2025",
      price: 2000000,
      status: "Đang hoạt động",
    },
    {
      id: 4,
      code: "HD04",
      room: "202",
      tenant: "Đinh Bảo Toàn",
      building: "VinHome quận 7",
      startDate: "15/02/2025",
      endDate: "14/12/2025",
      price: 2000000,
      status: "Sắp hết hạn",
    },
    {
      id: 5,
      code: "HD05",
      room: "405",
      tenant: "Nguyễn Việt Dũng",
      building: "Chung cư Hoàng Anh Gia Lai",
      startDate: "15/02/2025",
      endDate: "14/12/2025",
      price: 2000000,
      status: "Đang hoạt động",
    },
    {
      id: 6,
      code: "HD06",
      room: "508",
      tenant: "Bùi Phú Hùng",
      building: "Chung cư Hoàng Anh Gia Lai",
      startDate: "15/02/2025",
      endDate: "14/12/2025",
      price: 2000000,
      status: "Đang hoạt động",
    },
    {
      id: 7,
      code: "HD07",
      room: "608",
      tenant: "Nguyễn Tấn Hoàng",
      building: "VinHome quận 7",
      startDate: "15/02/2025",
      endDate: "14/12/2025",
      price: 2000000,
      status: "Đang hoạt động",
    },
  ];

  // 2. States
  const [contracts, setContracts] = useState(mockContracts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 3. Logic Lọc dữ liệu & Thống kê
  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const matchesSearch =
        contract.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.room.includes(searchTerm);

      const matchesBuilding = filterBuilding
        ? contract.building === filterBuilding
        : true;

      const matchesStatus = filterStatus
        ? contract.status === filterStatus
        : true;

      return matchesSearch && matchesBuilding && matchesStatus;
    });
  }, [contracts, searchTerm, filterBuilding, filterStatus]);

  // Logic phân trang
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const currentData = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  //Logic: Xử lý thêm mới từ Modal
  const handleAddNewContract = (newData) => {
    // Helper format ngày từ YYYY-MM-DD sang DD/MM/YYYY
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    };

    const newContract = {
      id: Date.now(), // Tạo ID ngẫu nhiên
      code: newData.contractCode,
      room: newData.roomName,
      tenant: newData.customerName,
      building: newData.buildingName || "Chưa cập nhật",
      startDate: formatDate(newData.startDate),
      endDate: formatDate(newData.endDate),
      price: Number(newData.rentPrice),
      status: newData.status,
    };

    // Thêm vào đầu danh sách
    setContracts([newContract, ...contracts]);
    // Reset về trang 1 để thấy dữ liệu mới
    setCurrentPage(1);
  };

  // Thống kê cho Cards
  const stats = {
    total: contracts.length,
    active: contracts.filter((c) => c.status === "Đang hoạt động").length,
    expiringSoon: contracts.filter((c) => c.status === "Sắp hết hạn").length,
    expired: contracts.filter((c) => c.status === "Đã hết hạn").length,
  };

  // 4. Helper: Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang hoạt động":
        return "bg-green-500 text-white";
      case "Sắp hết hạn":
        return "bg-yellow-400 text-gray-900";
      case "Đã hết hạn":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý hợp đồng</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <FaPlus size={12} /> Thêm hợp đồng
        </button>
      </div>

      {/* --- KHU VỰC TÌM KIẾM & LỌC --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tìm kiếm và lọc</h3>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-1/2 flex items-center gap-2">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-gray-50 transition-all"
                placeholder="Mã hợp đồng, tên khách hàng, phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-gray-900 text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 font-medium whitespace-nowrap transition-colors">
              Tìm
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <div className="relative w-full md:w-48">
              <select
                className="w-full appearance-none border border-gray-200 px-3 py-2 pr-8 rounded-md bg-white hover:bg-gray-50 text-sm focus:outline-none cursor-pointer text-gray-700 transition-all"
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
              >
                <option value="">Tất cả tòa nhà</option>
                <option value="Chung cư Hoàng Anh Gia Lai">
                  Chung cư Hoàng Anh Gia Lai
                </option>
                <option value="VinHome quận 7">VinHome quận 7</option>
              </select>
              <FiFilter className="absolute right-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative w-full md:w-40">
              <select
                className="w-full appearance-none border border-gray-200 px-3 py-2 pr-8 rounded-md bg-white hover:bg-gray-50 text-sm focus:outline-none cursor-pointer text-gray-700 transition-all"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Trạng thái</option>
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Sắp hết hạn">Sắp hết hạn</option>
                <option value="Đã hết hạn">Đã hết hạn</option>
              </select>
              <FiFilter className="absolute right-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          {
            title: "Tổng hợp đồng",
            value: stats.total,
            icon: FaFileContract,
            color: "text-gray-600",
          },
          {
            title: "Đang hoạt động",
            value: stats.active,
            icon: FaCheckCircle,
            color: "text-green-500",
          },
          {
            title: "Sắp hết hạn",
            value: stats.expiringSoon,
            icon: FaExclamationCircle,
            color: "text-yellow-500",
          },
          {
            title: "Đã hết hạn",
            value: stats.expired,
            icon: FaTimesCircle,
            color: "text-red-500",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium mb-1">{stat.title}</h3>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-80`} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* --- DANH SÁCH HỢP ĐỒNG (Table) --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            Danh sách hợp đồng
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-xs font-bold border-b border-gray-200 uppercase text-gray-600">
              <tr>
                <th className="p-4">Mã hợp đồng</th>
                <th className="p-4">Phòng</th>
                <th className="p-4">Tên khách hàng</th>
                <th className="p-4">Tòa nhà</th>
                <th className="p-4">Thời hạn</th>
                <th className="p-4">Giá thuê</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {currentData.length > 0 ? (
                currentData.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-4 font-bold text-gray-900">
                      {contract.code}
                    </td>
                    <td className="p-4 font-bold text-gray-800">
                      {contract.room}
                    </td>
                    <td className="p-4 font-medium">{contract.tenant}</td>
                    <td
                      className="p-4 text-gray-600 max-w-[150px] truncate"
                      title={contract.building}
                    >
                      {contract.building}
                    </td>
                    <td className="p-4 text-sm font-medium">
                      <div>
                        Từ:{" "}
                        <span className="text-gray-900">
                          {contract.startDate}
                        </span>
                      </div>
                      <div>
                        Đến:{" "}
                        <span className="text-gray-900">
                          {contract.endDate}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {formatCurrency(contract.price)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`${getStatusColor(
                          contract.status
                        )} px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap`}
                      >
                        {contract.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 border border-gray-200 rounded hover:bg-gray-900 hover:text-white text-gray-500 transition-all shadow-sm"
                          title="Xem chi tiết"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          className="p-2 border border-red-100 rounded hover:bg-red-500 hover:text-white text-red-500 transition-all shadow-sm bg-red-50"
                          title="Xóa"
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="p-8 text-center text-gray-500 italic"
                  >
                    Không tìm thấy hợp đồng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER & PAGINATION --- */}
        <div className="p-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            Hiển thị {currentData.length} trên tổng số{" "}
            {filteredContracts.length} hợp đồng
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors 
                text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <FiChevronLeft /> Prev
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 rounded text-sm transition-allpx-3 py-1 rounded text-sm transition-all ${
                  currentPage === idx + 1
                   ? "bg-gray-100 text-black font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            {/* Dấu ... nếu cần, ở đây hardcode theo ảnh mẫu là 1, 2, 3 ... Next */}
            {totalPages > 3 && <span className="px-1 text-gray-400">...</span>}

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

      <AddContractModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSuccess={handleAddNewContract}
      />
    </div>
  );
};

export default ContractManagement;

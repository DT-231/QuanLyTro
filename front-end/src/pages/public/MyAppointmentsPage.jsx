import React, { useState } from "react";
import { Search, Calendar, Phone, Mail, Clock, MapPin, Building2, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getMyAppointments } from "@/services/appointmentService";

/**
 * Trang tra cứu lịch hẹn xem phòng (Public - không cần đăng nhập)
 */
const MyAppointmentsPage = () => {
  // States
  const [searchType, setSearchType] = useState("phone"); // "phone" | "email"
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      toast.error("Vui lòng nhập thông tin tra cứu");
      return;
    }

    // Validate email format
    if (searchType === "email" && !searchValue.includes("@")) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }

    // Validate phone format
    if (searchType === "phone" && !/^\d{10,11}$/.test(searchValue.replace(/\s/g, ""))) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ (10-11 số)");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const params = searchType === "phone" 
        ? { phone: searchValue.trim() } 
        : { email: searchValue.trim() };
      
      const response = await getMyAppointments(params);
      
      if (response?.success && response?.data?.items) {
        setAppointments(response.data.items);
        if (response.data.items.length === 0) {
          toast.info("Không tìm thấy lịch hẹn nào");
        }
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(error?.message || "Lỗi khi tra cứu lịch hẹn");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Get status config
  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        label: "Đang chờ xử lý",
        color: "text-yellow-600 bg-yellow-100",
        icon: Clock,
      },
      CONFIRMED: {
        label: "Đã xác nhận",
        color: "text-green-600 bg-green-100",
        icon: CheckCircle2,
      },
      REJECTED: {
        label: "Bị từ chối",
        color: "text-red-600 bg-red-100",
        icon: XCircle,
      },
      CANCELLED: {
        label: "Đã hủy",
        color: "text-gray-600 bg-gray-200",
        icon: XCircle,
      },
      COMPLETED: {
        label: "Đã hoàn thành",
        color: "text-blue-600 bg-blue-100",
        icon: CheckCircle2,
      },
    };
    return configs[status] || { label: status, color: "text-gray-600 bg-gray-200", icon: AlertCircle };
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date short
  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Tra cứu lịch hẹn xem phòng
          </h1>
          <p className="text-gray-600">
            Nhập email hoặc số điện thoại bạn đã dùng khi đặt lịch để tra cứu
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch}>
            {/* Search Type Toggle */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => {
                  setSearchType("phone");
                  setSearchValue("");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  searchType === "phone"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Phone className="w-4 h-4" />
                Số điện thoại
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchType("email");
                  setSearchValue("");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  searchType === "email"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>

            {/* Search Input */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                {searchType === "phone" ? (
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                ) : (
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  type={searchType === "email" ? "email" : "tel"}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={
                    searchType === "phone"
                      ? "Nhập số điện thoại (VD: 0912345678)"
                      : "Nhập email (VD: example@gmail.com)"
                  }
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Tra cứu
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Không tìm thấy lịch hẹn
                </h3>
                <p className="text-gray-500">
                  Không có lịch hẹn nào được tìm thấy với thông tin bạn cung cấp.
                  <br />
                  Vui lòng kiểm tra lại số điện thoại hoặc email.
                </p>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-2">
                  Tìm thấy <strong>{appointments.length}</strong> lịch hẹn
                </div>
                
                {appointments.map((appointment) => {
                  const statusConfig = getStatusConfig(appointment.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div
                      key={appointment.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      {/* Status Header */}
                      <div className={`px-6 py-3 ${statusConfig.color}`}>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-5 h-5" />
                          <span className="font-medium">{statusConfig.label}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm text-gray-500">Phòng</div>
                                <div className="font-medium text-gray-800">
                                  {appointment.room_number || "N/A"}
                                  {appointment.building_name && (
                                    <span className="text-gray-500 font-normal">
                                      {" "}
                                      - {appointment.building_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {appointment.address && (
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                  <div className="text-sm text-gray-500">Địa chỉ</div>
                                  <div className="font-medium text-gray-800">
                                    {appointment.address}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm text-gray-500">Thời gian hẹn</div>
                                <div className="font-medium text-gray-800">
                                  {formatDateTime(appointment.appointment_datetime)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm text-gray-500">Ngày đặt</div>
                                <div className="font-medium text-gray-800">
                                  {formatDateShort(appointment.created_at)}
                                </div>
                              </div>
                            </div>

                            {appointment.admin_notes && (
                              <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                                <div>
                                  <div className="text-sm text-gray-500">Ghi chú từ chủ trọ</div>
                                  <div className="font-medium text-gray-800 bg-blue-50 p-3 rounded-lg mt-1">
                                    {appointment.admin_notes}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Info Card - Show before search */}
        {!hasSearched && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              Hướng dẫn
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Nhập số điện thoại hoặc email bạn đã dùng khi đặt lịch
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Xem trạng thái lịch hẹn: Đang chờ, Đã xác nhận, Bị từ chối...
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Đọc ghi chú phản hồi từ chủ trọ (nếu có)
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                Bạn cũng sẽ nhận email thông báo khi lịch hẹn được cập nhật
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointmentsPage;

/**
 * Room Service - API client cho quản lý phòng trọ
 *
 * Các chức năng:
 * - CRUD phòng (create, read, update, delete)
 * - Tìm kiếm và lọc phòng theo nhiều tiêu chí
 * - Hỗ trợ cả public (xem phòng trống) và admin (quản lý tất cả)
 */
import api from "../lib/api";

export const roomService = {
  /**
   * Lấy danh sách phòng với filter và pagination
   * @param {Object} params - Các tham số filter
   * @param {string} params.search - Tìm theo tên phòng/tiện ích
   * @param {string} params.city - Lọc theo thành phố
   * @param {string} params.ward - Lọc theo quận/huyện
   * @param {string} params.building_id - Lọc theo tòa nhà
   * @param {string} params.status - Lọc theo trạng thái (AVAILABLE, OCCUPIED, MAINTENANCE)
   * @param {number} params.page - Số trang (bắt đầu từ 1)
   * @param {number} params.pageSize - Số item mỗi trang
   * @returns {Promise<Object>} {success, data: {items, pagination}}
   */
  getAll: async (params) => {
    const response = await api.get("/rooms", { params });
    return response.data;
  },

  /**
   * Tạo phòng mới
   * @param {Object} data - Thông tin phòng
   * @returns {Promise<Object>} Phòng vừa tạo
   */
  create: async (data) => {
    const response = await api.post("/rooms", data);
    return response.data;
  },

  /**
   * Lấy chi tiết phòng theo ID
   * @param {string} id - UUID của phòng
   * @returns {Promise<Object>} Chi tiết phòng
   */
  getById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  /**
   * Cập nhật thông tin phòng
   * @param {string} id - UUID của phòng
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Phòng sau cập nhật
   */
  update: async (id, data) => {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
  },

  /**
   * Xóa phòng
   * @param {string} id - UUID của phòng
   * @returns {Promise<Object>} Kết quả xóa
   */
  delete: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },
};
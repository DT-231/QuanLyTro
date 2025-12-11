import api from "@/lib/api"; 

export const addressService = {
  
  // Lấy danh sách địa chỉ
  getAll: async (params = {}) => {
    // SỬA 2: Dùng 'api.get' thay vì 'axios.get'
    const response = await api.get("/addresses", { params });
    return response.data;
  },

  // Lấy chi tiết
  getById: async (addressId) => {
    // SỬA 3: Cú pháp template string `${addressId}`
    const response = await api.get(`/addresses/${addressId}`);
    return response.data;
  },

  // Tạo mới
  create: async (data) => {
    const response = await api.post("/addresses", data);
    return response.data;
  },

  // Cập nhật
  update: async (addressId, data) => {
    // SỬA 4: Đúng cú pháp URL update
    const response = await api.put(`/addresses/${addressId}`, data);
    return response.data;
  },

  // Xóa
  delete: async (addressId) => {
    const response = await api.delete(`/addresses/${addressId}`);
    return response.data;
  },
};

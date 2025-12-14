import api from "@/lib/api";

export const userService = {
  // 1. Tạo tài khoản người thuê (Role: TENANT)
  createTenant: async (data) => {
    const response = await api.post("/auth/create-tenant", data);
    return response.data;
  },

  // 2. Lấy danh sách người dùng (có phân trang & lọc)
  getAll: async (params) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  // 3. Lấy thống kê
  getStats: async () => {
    const response = await api.get("/users/stats?role_id=TENANT"); // Mặc định lấy stats của Tenant
    return response.data;
  },

  // 4. Cập nhật thông tin
  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // 5. Xóa người dùng
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
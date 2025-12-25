/**
 * Auth Service - API client cho xác thực người dùng
 *
 * Các chức năng:
 * - Đăng ký tài khoản mới
 * - Đăng nhập
 * - Lấy thông tin user hiện tại từ JWT token
 */
import api from "@/lib/api";

export const authService = {
  /**
   * Đăng ký tài khoản mới (role: CUSTOMER)
   * @param {Object} data - Thông tin đăng ký
   * @param {string} data.firstName - Tên
   * @param {string} data.lastName - Họ
   * @param {string} data.email - Email
   * @param {string} data.password - Mật khẩu
   * @param {string} data.confirmPassword - Xác nhận mật khẩu
   * @returns {Promise<Object>} Kết quả đăng ký
   */
  register: async (data) => {
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
      confirm_password: data.confirmPassword,
    };
    const res = await api.post("/auth/register", payload);
    return res.data;
  },

  /**
   * Đăng nhập
   * @param {string} email - Email
   * @param {string} password - Mật khẩu
   * @returns {Promise<Object>} {user, token: {access_token, refresh_token}}
   */
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  /**
   * Lấy thông tin người dùng hiện tại từ JWT token
   * @returns {Promise<Object>} Thông tin user
   */
  getCurrentUser: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

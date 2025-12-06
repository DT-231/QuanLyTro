
import api from "@/lib/api";

export const authService = {
  register: async (data) => {
    // PHẢI MAP LẠI DỮ LIỆU NHƯ SAU:
    const payload = {
      first_name: data.firstName, 
      last_name: data.lastName,   
      email: data.email,
      password: data.password,
      confirm_password: data.confirmPassword,
      role_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    };
    return await api.post("/api/v1/auth/register", payload);
  },

  login: async (email, password) => {
    const payload = { email, password };
    return await api.post("/api/v1/auth/login", payload);
  },
};
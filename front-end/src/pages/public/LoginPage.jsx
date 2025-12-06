import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";

// Import UI components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// --- SCHEMA VALIDATION ---
const formSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ." }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [loginError, setLoginError] = useState(""); // State báo lỗi
  const [isLoading, setIsLoading] = useState(false); // State loading khi gọi API

  // Khởi tạo Form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  // Xử lý Submit
  async function onSubmit(values) {
    setLoginError(""); // Reset lỗi cũ
    setIsLoading(true); // Bật trạng thái loading

    try {
      // 1. GỌI API LOGIN
      const response = await authService.login(values.email, values.password);
      
      // 2. Lấy dữ liệu từ response
      // Cấu trúc response phụ thuộc vào FastAPI trả về. 
      // Thường là: { access_token: "...", token_type: "bearer", user: { ... } }
      const data = response.data; 

      // 3. Lưu Token vào LocalStorage (Quan trọng để giữ đăng nhập)
      if (data.access_token) {
        localStorage.setItem("accessToken", data.access_token);
      }

      // 4. Cập nhật Context
      // Nếu API trả về thông tin user (role, name...) thì truyền vào hàm login
      // Nếu API chỉ trả về token, bạn có thể cần gọi thêm API "/me" để lấy profile
      login(data); 

      // 5. Điều hướng dựa trên Role (Nếu backend trả về role)
      // Ví dụ: logic kiểm tra role
      /*
      if (data.user?.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
      */
      
      // Tạm thời điều hướng về trang chủ
      navigate("/");

    } catch (error) {
      console.error("Login Error:", error);
      
      // Lấy thông báo lỗi từ Server (nếu có)
      let message = "Email hoặc mật khẩu không chính xác!";
      if (error.response && error.response.data) {
        // FastAPI thường trả lỗi trong field 'detail'
        const detail = error.response.data.detail;
        if (typeof detail === "string") {
            message = detail;
        }
      }
      setLoginError(message);
    } finally {
      setIsLoading(false); // Tắt loading dù thành công hay thất bại
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[85vh] bg-slate-50 px-4">
      {/* Card Container */}
      <div className="w-full  max-w-md bg-white p-6 rounded-xl shadow-xl border border-gray-100 ">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Đăng nhập</h2>
          <p className="text-sm text-gray-500 mt-2">Chào mừng bạn trở lại hệ thống quản lý trọ</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Error Alert */}
            {loginError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md text-center">
                {loginError}
              </div>
            )}

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex">Email <span className="text-red-500 ml-1">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} className="h-11 bg-slate-50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex">Mật khẩu <span className="text-red-500 ml-1">*</span></FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="h-11 bg-slate-50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading} // Disable khi đang call API
              className="w-full h-11 bg-black hover:bg-gray-800 text-white font-bold text-base shadow-md transition-all"
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          Bạn chưa có tài khoản?{" "}
          <Link to="/register" className="font-bold text-black hover:underline ml-1">
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  );
}
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

  // --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
  const fakeUsers = [
    {
      id: 1,
      email: "admin@gmail.com",
      password: "12341234", // Mật khẩu giả lập
      role: "admin",
      name: "Quản trị viên",
      avatar: "https://github.com/shadcn.png"
    },
    {
      id: 2,
      email: "user@gmail.com",
      password: "12341234", // Mật khẩu giả lập
      role: "user",
      name: "Khách thuê",
      avatar: "https://github.com/shadcn.png"
    }
  ];

  // --- XỬ LÝ SUBMIT VỚI DỮ LIỆU GIẢ ---
  function onSubmit(values) {
    setLoginError(""); 
    setIsLoading(true); // Bật loading để trải nghiệm giống thật

    // Dùng setTimeout để giả lập độ trễ của mạng (1 giây)
    setTimeout(() => {
      // 1. Tìm user trong danh sách fakeUsers khớp email và password
      const foundUser = fakeUsers.find(
        (user) => user.email === values.email && user.password === values.password
      );

      if (foundUser) {
        // --- TRƯỜNG HỢP ĐĂNG NHẬP THÀNH CÔNG ---
        console.log("Đăng nhập giả lập thành công:", foundUser);

        // Lưu token giả vào localStorage
        localStorage.setItem("accessToken", "fake-jwt-token-xyz");

        // Cập nhật context (giả lập payload từ API)
        login(foundUser);

        // Điều hướng dựa trên role
        if (foundUser.role === "admin") {
            navigate("/admin/dashboard"); // Nếu có trang admin
        } else {
            navigate("/"); // Trang chủ cho user thường
        }
        
        alert(`Xin chào ${foundUser.name}!`);
      } else {
        // --- TRƯỜNG HỢP SAI EMAIL HOẶC PASSWORD ---
        setLoginError("Email hoặc mật khẩu không chính xác (Mock Data)");
      }

      setIsLoading(false); // Tắt loading
    }, 1000); 
  }
  // Xử lý Submit
  // async function onSubmit(values) {
  //   setLoginError(""); // Reset lỗi cũ
  //   setIsLoading(true); // Bật trạng thái loading

  //   try {
  //     const response = await authService.login(values.email, values.password);

  //     const api = response.data;

  //     if (api.code !== 200) {
  //       throw new Error(api.message || "Đăng nhập thất bại");
  //     }

  //     const payload = api.data;

  //     // Lưu token
  //     localStorage.setItem("accessToken", payload.access_token);
  //     localStorage.setItem("refreshToken", payload.refresh_token);

  //     // Cập nhật context
  //     login(payload.user);

  //     navigate("/");
  //   } catch (error) {
  //     console.error("Login Error:", error);

  //     const msg =
  //       error.response?.data?.message || error.message || "Lỗi đăng nhập!";
  //     setLoginError(msg);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  return (
    <div className="flex items-center justify-center min-h-[85vh] bg-slate-50 px-4">
      {/* Card Container */}
      <div className="w-full  max-w-md bg-white p-6 rounded-xl shadow-xl border border-gray-100 ">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Đăng nhập</h2>
          <p className="text-sm text-gray-500 mt-2">
            Chào mừng bạn trở lại hệ thống quản lý trọ
          </p>
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
                  <FormLabel className="font-semibold flex">
                    Email <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="m@example.com"
                      {...field}
                      className="h-11 bg-slate-50"
                    />
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
                  <FormLabel className="font-semibold flex">
                    Mật khẩu <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="h-11 bg-slate-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-blue-600 hover:underline font-medium"
              >
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
          <Link
            to="/register"
            className="font-bold text-black hover:underline ml-1"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

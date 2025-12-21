import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Info, Image as ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import Service
import { userService } from "@/services/userService";

// --- SCHEMA VALIDATION ---
const formSchema = z.object({
  lastName: z.string().min(1, "Họ không được để trống"),
  firstName: z.string().min(1, "Tên không được để trống"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  dob: z.string().optional(),
  cccd: z.string().min(9, "CCCD phải có ít nhất 9 số"),
  gender: z.string().optional(),
  hometown: z.string().optional(),
});

export default function AddTenantModal({
  isOpen,
  onClose,
  onAddSuccess,
  tenantToEdit,
}) {
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!tenantToEdit;

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const defaultPassword = `User@1234`;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      phone: "",
      email: "",
      dob: "",
      cccd: "",
      gender: "Nam",
      hometown: "",
    },
  });

  // --- FILL DATA KHI EDIT ---
  useEffect(() => {
    const fetchUserDetail = async () => {
      if (isOpen && tenantToEdit?.id) {
        setIsLoadingDetail(true);
        try {
          // Gọi API lấy chi tiết user dựa trên ID
          // Giả sử hàm này trả về data khớp với API /api/v1/users/{id}
          const userDetail = await userService.getUserById(tenantToEdit.id);

          // Dữ liệu từ API chi tiết sẽ đầy đủ hơn
          const data = userDetail.data || userDetail; // Tùy cấu trúc response của bạn

          form.reset({
            // Ưu tiên lấy first_name/last_name trực tiếp từ API, không cần split tên
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.phone || "",
            email: data.email || "",
            // Xử lý ngày sinh: cắt lấy phần YYYY-MM-DD
            dob: data.date_of_birth
              ? String(data.date_of_birth).split("T")[0]
              : "",
            cccd: data.cccd || "", // Lúc này mới có dữ liệu CCCD
            gender: data.gender || "Nam",
            hometown: data.address || "", // Map address vào hometown
          });

          // Xử lý hiển thị ảnh CCCD nếu có (dựa vào documents trả về từ API)
          if (data.documents && Array.isArray(data.documents)) {
            const front = data.documents.find((d) => d.type === "CCCD_FRONT");
            const back = data.documents.find((d) => d.type === "CCCD_BACK");
            if (front)
              setFrontImage({
                preview: front.url,
                file: null,
                isExisting: true,
              });
            if (back)
              setBackImage({ preview: back.url, file: null, isExisting: true });
          }
        } catch (error) {
          toast.error("Không tải được thông tin chi tiết khách thuê");
          console.error(error);
        } finally {
          setIsLoadingDetail(false);
        }
      } else if (isOpen && !tenantToEdit) {
        // Trường hợp thêm mới -> Reset form trắng
        form.reset({
          lastName: "",
          firstName: "",
          phone: "",
          email: "",
          dob: "",
          cccd: "",
          gender: "Nam",
          hometown: "",
        });
        setFrontImage(null);
        setBackImage(null);
      }
      setActiveTab("info");
    };

    fetchUserDetail();
  }, [isOpen, tenantToEdit, form]);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === "front") setFrontImage({ file, preview: previewUrl });
      else setBackImage({ file, preview: previewUrl });
    }
  };

  const removeImage = (type) => {
    if (type === "front") {
      setFrontImage(null);
      if (frontInputRef.current) frontInputRef.current.value = "";
    } else {
      setBackImage(null);
      if (backInputRef.current) backInputRef.current.value = "";
    }
  };

 const onSubmit = async (values) => {
    setIsSubmitting(true);
    let tenantId = tenantToEdit?.id;
    
    // Chuẩn bị dữ liệu chung
    const commonPayload = {
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      phone: values.phone,
      cccd: values.cccd,
      date_of_birth: values.dob || null,
      gender: values.gender,
      address: values.hometown,
    };

    try {
      if (isEditMode) {
        // --- LOGIC CẬP NHẬT (EDIT) ---
        await userService.update(tenantToEdit.id, commonPayload);
        toast.success("Cập nhật thông tin thành công!");
      } else {
        // --- LOGIC TẠO MỚI (CREATE) ---
        const createPayload = {
          ...commonPayload,
          password: defaultPassword,
          is_temporary_residence: false,
        };
        
        const createdUser = await userService.createTenant(createPayload);
        if (!createdUser || !createdUser.id) {
            throw new Error(createdUser?.detail || "Tạo thất bại. Số điện thoại, Email hoặc CCCD có thể đã tồn tại.");
        }

        tenantId = createdUser.id;

        toast.success("Tạo tài khoản thành công!", {
          description: `Mật khẩu mặc định: ${defaultPassword}`,
          duration: 5000,
        });
      }

      // --- LOGIC UPLOAD ẢNH ---
      if ((frontImage || backImage) && tenantId) {
        try {
          if (frontImage) await userService.uploadCCCD(tenantId, frontImage.file, "front");
          if (backImage) await userService.uploadCCCD(tenantId, backImage.file, "back");
          
          if (frontImage || backImage) {
            toast.success("Đã upload ảnh CCCD thành công!");
          }
        } catch (uploadError) {
          console.error("Lỗi Upload ảnh:", uploadError);
          toast.warning("Tài khoản đã tạo nhưng lỗi khi tải ảnh lên.");
        }
      }

      if (onAddSuccess) onAddSuccess();
      onClose();

    } catch (error) {
      console.error("Lỗi Submit chi tiết:", error);
      let errorMessage = "Thao tác thất bại. Vui lòng thử lại.";
      const responseData = error.response?.data;
      const detail = responseData?.detail;

      if (typeof detail === "string") {
        errorMessage = detail;
      } 
      else if (Array.isArray(detail) && detail.length > 0) {
        const firstError = detail[0];
        errorMessage = `Lỗi: ${firstError.msg}`;
        if (firstError.loc) {
             errorMessage += ` (${firstError.loc[firstError.loc.length - 1]})`;
        }
      } 
      else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, {
        duration: 5000, 
      });

    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white text-black">
        {isLoadingDetail && (
          <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        )}
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {isEditMode ? "Cập nhật thông tin" : "Thêm khách thuê"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Cập nhật thông tin cá nhân của khách thuê."
                : "Hệ thống sẽ tự động tạo tài khoản đăng nhập cho khách."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex border-b px-6">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === "info"
                ? "border-black text-black"
                : "border-transparent text-gray-500"
            }`}
          >
            <Info size={16} /> Thông tin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("images")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === "images"
                ? "border-black text-black"
                : "border-transparent text-gray-500"
            }`}
          >
            <ImageIcon size={16} /> Ảnh CCCD
          </button>
        </div>

        <div className="p-6 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {activeTab === "info" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-xs font-semibold">
                          Họ & Đệm
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nguyễn Văn"
                            {...field}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-xs font-semibold">
                          Tên
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="A" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-xs font-semibold">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isEditMode}
                            placeholder="email@example.com"
                            {...field}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-xs font-semibold">
                          Số điện thoại
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cccd"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-xs font-semibold">
                          CCCD
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-xs font-semibold">
                          Ngày sinh
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-9 block w-full"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-xs font-semibold">
                          Giới tính
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Chọn" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Nam">Nam</SelectItem>
                            <SelectItem value="Nữ">Nữ</SelectItem>
                            <SelectItem value="Khác">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hometown"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-xs font-semibold">
                          Quê quán
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {activeTab === "images" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="relative border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer group"
                      onClick={() => frontInputRef.current.click()}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={frontInputRef}
                        onChange={(e) => handleImageChange(e, "front")}
                      />
                      {frontImage ? (
                        <>
                          <img
                            src={frontImage.preview}
                            alt="CCCD Trước"
                            className="h-full w-full object-contain rounded-lg p-1"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage("front");
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Upload
                            className="text-gray-400 mx-auto mb-2"
                            size={20}
                          />
                          <p className="text-sm font-medium text-gray-600">
                            Mặt trước
                          </p>
                        </div>
                      )}
                    </div>
                    <div
                      className="relative border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer group"
                      onClick={() => backInputRef.current.click()}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={backInputRef}
                        onChange={(e) => handleImageChange(e, "back")}
                      />
                      {backImage ? (
                        <>
                          <img
                            src={backImage.preview}
                            alt="CCCD Sau"
                            className="h-full w-full object-contain rounded-lg p-1"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage("back");
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Upload
                            className="text-gray-400 mx-auto mb-2"
                            size={20}
                          />
                          <p className="text-sm font-medium text-gray-600">
                            Mặt sau
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="text-xs text-gray-500 italic">
                  {!isEditMode && (
                    <span>
                      *Mật khẩu mặc định:{" "}
                      <span className="font-mono font-bold text-gray-700">
                        {defaultPassword}
                      </span>
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="h-9"
                  >
                    Huỷ
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black text-white hover:bg-gray-800 h-9 min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    ) : null}
                    {isSubmitting
                      ? "Đang xử lý..."
                      : isEditMode
                      ? "Lưu thay đổi"
                      : "Tạo tài khoản"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

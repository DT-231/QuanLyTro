import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import AddUtilityModal from "./AddUtilityModal"; // Import modal con

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

// Schema validation: Đã xóa district
const buildingSchema = z.object({
  name: z.string().min(1, "Tên toà nhà là bắt buộc"),
  houseNumber: z.string().min(1, "Số nhà là bắt buộc"),
  street: z.string().min(1, "Tên đường là bắt buộc"),
  ward: z.string().min(1, "Phường/Xã là bắt buộc"),
  city: z.string().min(1, "Thành phố là bắt buộc"), // City vẫn giữ validation
  description: z.string().optional(),
});

export default function AddBuildingModal({ isOpen, onClose, onAddSuccess }) {
  const [isUtilityModalOpen, setIsUtilityModalOpen] = useState(false);

  // Mặc định không tick tiện ích nào
  const [utilities, setUtilities] = useState([
    { id: "pool", label: "Hồ bơi", checked: false },
    { id: "elevator", label: "Thang máy", checked: false },
    { id: "camera", label: "Camera", checked: false },
    { id: "security", label: "Bảo vệ", checked: false },
    { id: "parking", label: "Giữ xe", checked: false },
    { id: "gym", label: "Gym", checked: false },
  ]);

  const form = useForm({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      name: "",
      houseNumber: "",
      street: "",
      ward: "",
      city: "", 
      description: "",
    },
  });

  const toggleUtility = (id) => {
    setUtilities((prev) =>
      prev.map((u) => (u.id === id ? { ...u, checked: !u.checked } : u))
    );
  };

  const handleAddNewUtility = (name) => {
    const newId = name.toLowerCase().replace(/\s+/g, "-");
    setUtilities([
      ...utilities,
      { id: newId, label: name, checked: true },
    ]);
  };

 const onSubmit = (values) => {
    // 1. Lấy danh sách tiện ích đã check
    const selectedUtils = utilities.filter((u) => u.checked);
    
    // 2. Chuyển thành chuỗi (Ví dụ: "Hồ bơi, Gym") để hiển thị trên bảng
    const utilitiesString = selectedUtils.map(u => u.label).join(", ");
    const submitData = {
      ...values,
      utilities: utilitiesString, 
      address: `${values.houseNumber} ${values.street}, ${values.ward}`, 
      totalRooms: 0,
      empty: 0,
      rented: 0,
      status: "Hoạt động",
      createdDate: new Date().toLocaleDateString('en-GB')
    };

    console.log("Dữ liệu gửi đi:", submitData);

    if (onAddSuccess) onAddSuccess(submitData);
    onClose();
    form.reset();
    
    // Reset checkbox về false
    setUtilities(utilities.map(u => ({...u, checked: false})));
  };
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white text-black max-h-[90vh] overflow-y-auto">
          {/* HEADER */}
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold">Thêm tòa nhà mới</DialogTitle>
          </DialogHeader>

          {/* FORM */}
          <div className="p-6 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Tên toà nhà */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên toà nhà mới</FormLabel>
                      <FormControl><Input placeholder="Tên toà nhà mới" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Số nhà & Đường */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="houseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số nhà</FormLabel>
                        <FormControl><Input placeholder="123" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên đường</FormLabel>
                        <FormControl><Input placeholder="Trần phú,..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Phường & Thành Phố (Thành phố thế chỗ Quận/Huyện) */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phường / Xã</FormLabel>
                        <FormControl><Input placeholder="Hải Châu 1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thành phố</FormLabel>
                        <FormControl><Input placeholder="Đà Nẵng" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Mô tả */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                          placeholder="Type your message here."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* TIỆN ÍCH SECTION */}
                <div className="space-y-3">
                  <FormLabel>Tiện ích</FormLabel>
                  <div className="grid grid-cols-3 gap-y-3 gap-x-2">
                    {utilities.map((util) => (
                      <div key={util.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={util.id}
                          checked={util.checked}
                          onChange={() => toggleUtility(util.id)}
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                        />
                        <label htmlFor={util.id} className="text-sm font-medium leading-none cursor-pointer">
                          {util.label}
                        </label>
                      </div>
                    ))}
                    
                    {/* Nút thêm tiện ích - Thẳng hàng với checkbox */}
                    <button
                      type="button"
                      onClick={() => setIsUtilityModalOpen(true)}
                      className="flex items-center space-x-2 text-black hover:text-gray-700 transition-colors col-span-1"
                    >
                        <div className="h-4 w-4 border border-black rounded flex items-center justify-center">
                            <Plus size={12} />
                        </div>
                        <span className="text-sm font-medium leading-none">Thêm tiện ích</span>
                    </button>
                  </div>
                </div>

                {/* FOOTER BUTTONS */}
                <div className="flex justify-end gap-2 mt-2 pt-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Huỷ
                  </Button>
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                    Chấp nhận
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Render Modal con */}
      <AddUtilityModal
        isOpen={isUtilityModalOpen}
        onClose={() => setIsUtilityModalOpen(false)}
        onAddSuccess={handleAddNewUtility}
      />
      
    </>
  );
}
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, CalendarIcon } from "lucide-react"; // Icons

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
import { Textarea } from "@/components/ui/textarea"; 

const formSchema = z.object({
  customerName: z.string().min(1, "Tên khách hàng là bắt buộc"),
  contractCode: z.string().min(1, "Mã hợp đồng là bắt buộc"),
  roomName: z.string().min(1, "Phòng là bắt buộc"),
  buildingName: z.string().optional(),
  startDate: z.string().min(1, "Chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Chọn ngày kết thúc"),
  rentPrice: z.coerce.number().min(0),
  deposit: z.coerce.number().min(0),
  paymentDate: z.coerce.number().min(1).max(31),
  paymentCycle: z.string(),
  electricityPrice: z.coerce.number().min(0),
  waterPrice: z.coerce.number().min(0),
  status: z.string(),
  terms: z.string().optional(),
});

export default function AddContractModal({ isOpen, onClose, onAddSuccess }) {
  // --- STATE QUẢN LÝ DỊCH VỤ (Dynamic List) ---
  const [services, setServices] = useState([
    { id: 1, name: "Phí rác", price: 0 },
    { id: 2, name: "Phí giữ xe", price: 0 },
  ]);
  const [newServiceName, setNewServiceName] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      contractCode: "", 
      roomName: "",
      buildingName: "",
      startDate: "",
      endDate: "",
      rentPrice: 0,
      deposit: 0,
      paymentDate: 15,
      paymentCycle: "Tháng",
      electricityPrice: 0,
      waterPrice: 0,
      status: "Hoạt động",
      terms: "Điều khoản về việc sử dụng và bảo quản tài sản thuê.\nBên thuê có trách nhiệm sử dụng phòng và toàn bộ tài sản đi kèm đúng mục đích...",
    },
  });

  // --- HÀM XỬ LÝ LOGIC ---

  // Xử lý nút chọn nhanh thời hạn (3 tháng, 6 tháng...)
  const handleDurationClick = (months) => {
    const start = form.getValues("startDate");
    if (!start) return; // Phải chọn ngày bắt đầu trước

    const date = new Date(start);
    date.setMonth(date.getMonth() + months);
    // Format lại thành YYYY-MM-DD để gán vào input date
    const dateString = date.toISOString().split("T")[0];
    form.setValue("endDate", dateString);
  };

  // Thêm dịch vụ mới
  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    setServices([...services, { id: Date.now(), name: newServiceName, price: 0 }]);
    setNewServiceName("");
  };

  // Xóa dịch vụ
  const handleRemoveService = (id) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const onSubmit = (values) => {
    const finalData = { ...values, services }; // Gộp form data và list dịch vụ
    console.log("Dữ liệu hợp đồng:", finalData);

    if (onAddSuccess) onAddSuccess(finalData);
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* sm:max-w-[800px] để form rộng hơn phù hợp chia 3 cột */}
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white text-black flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-6 pb-2 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Thêm hợp đồng</DialogTitle>
          </DialogHeader>
        </div>

        {/* FORM CONTENT - Có scroll nếu dài */}
        <div className="p-6 pt-4 overflow-y-auto flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* --- HÀNG 1: Khách hàng, Mã HĐ, Phòng (Grid 3) --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Tên khách hàng</FormLabel>
                      <FormControl><Input placeholder="Nguyễn Văn A" {...field} className="h-9" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contractCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Mã hợp đồng</FormLabel>
                      <FormControl><Input placeholder="HD01" {...field} className="h-9" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roomName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Phòng</FormLabel>
                      <FormControl><Input placeholder="P.101" {...field} className="h-9" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- HÀNG 2: Tòa nhà (Full width) --- */}
              <FormField
                control={form.control}
                name="buildingName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Tòa nhà</FormLabel>
                    <FormControl><Input placeholder="Tên tòa nhà" {...field} className="h-9" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- HÀNG 3: Ngày tháng (Grid 2) --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Ngày bắt đầu</FormLabel>
                      <FormControl><Input type="date" {...field} className="h-9 block w-full" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Ngày kết thúc</FormLabel>
                      <FormControl><Input type="date" {...field} className="h-9 block w-full" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- HÀNG 4: Nút chọn nhanh thời hạn --- */}
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => handleDurationClick(3)} className="h-8">3 Tháng</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDurationClick(6)} className="h-8">6 Tháng</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDurationClick(12)} className="h-8">1 Năm</Button>
              </div>

              {/* --- HÀNG 5: Giá tiền (Grid 3) --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="rentPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Giá thuê (VNĐ/Tháng)</FormLabel>
                      <FormControl><Input type="number" {...field} className="h-9" /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Tiền cọc (VNĐ)</FormLabel>
                      <FormControl><Input type="number" {...field} className="h-9" /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Ngày thanh toán</FormLabel>
                      <FormControl><Input type="number" placeholder="15" {...field} className="h-9" /></FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* --- HÀNG 6: Điện nước & Trạng thái (Grid 4) --- */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="paymentCycle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Chu kỳ t.toán</FormLabel>
                      <FormControl>
                        <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                            <option value="Tháng">Tháng</option>
                            <option value="Quý">Quý</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="electricityPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Giá điện (kWh)</FormLabel>
                      <FormControl><Input type="number" {...field} className="h-9" /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waterPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Giá nước (m³)</FormLabel>
                      <FormControl><Input type="number" {...field} className="h-9" /></FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Trạng thái</FormLabel>
                      <FormControl>
                        <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                            <option value="Hoạt động">Hoạt động</option>
                            <option value="Chờ duyệt">Chờ duyệt</option>
                            <option value="Đã thanh lý">Đã thanh lý</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* --- ĐIỀU KHOẢN --- */}
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Điều khoản</FormLabel>
                    <FormControl>
                        <textarea 
                            {...field} 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* --- PHÍ DỊCH VỤ (Dynamic) --- */}
              <div className="space-y-3">
                <FormLabel className="text-xs font-semibold">Phí dịch vụ</FormLabel>
                
                {/* List các phí đã thêm */}
                <div className="space-y-2">
                    {services.map((service) => (
                        <div key={service.id} className="flex items-center gap-2 relative">
                            <Input value={service.name} readOnly className="bg-gray-50 h-9" />
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-1 top-0.5 h-8 w-8 text-gray-400 hover:text-red-500"
                                onClick={() => handleRemoveService(service.id)}
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Input thêm phí mới */}
                <div className="flex gap-2 items-center">
                    <Input 
                        placeholder="Tên dịch vụ..." 
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="h-9"
                    />
                    <Button 
                        type="button" 
                        onClick={handleAddService}
                        className="bg-black text-white hover:bg-gray-800 h-9 px-4"
                    >
                        <Plus size={16} />
                    </Button>
                </div>
              </div>

            </form>
          </Form>
        </div>

        {/* FOOTER BUTTONS - Fixed at bottom */}
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 bg-white">
                Huỷ
            </Button>
            {/* Submit button kích hoạt form phía trên thông qua form handle */}
            <Button type="button" onClick={form.handleSubmit(onSubmit)} className="bg-black text-white hover:bg-gray-800 h-9">
                Thêm
            </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
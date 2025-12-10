import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Info, DollarSign, Image as ImageIcon, Plus, X, Upload } from "lucide-react";

// Import Modal con dùng chung (nếu bạn vẫn giữ logic tiện ích như cũ)
import AddUtilityModal from "./AddUtilityModal"; 

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
import { Textarea } from "@/components/ui/textarea"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- VALIDATION SCHEMA ---
const roomSchema = z.object({
  // Tab 1: Thông tin
  roomName: z.string().min(1, "Tên phòng không được để trống"),
  status: z.string().default("Trống"),
  building: z.string().optional(),
  type: z.string().optional(),
  area: z.coerce.number().min(0, "Diện tích phải lớn hơn 0"),
  maxPeople: z.coerce.number().min(1, "Tối thiểu 1 người"),
  description: z.string().optional(),
  
  // Tab 2: Tiền (Chi phí chính)
  rentPrice: z.coerce.number().min(0),
  depositPrice: z.coerce.number().min(0),
  elecPrice: z.coerce.number().min(0),
  waterPrice: z.coerce.number().min(0),

  // Tab 2: Tiền (Chi phí phụ - Mảng động)
  extraCosts: z.array(
    z.object({
      name: z.string().min(1, "Tên phí"),
      price: z.coerce.number().min(0),
    })
  ),
  
  // Tab 3: Ảnh (Demo)
  images: z.any().optional(),
});

export default function AddRoomModal({ isOpen, onClose, onAddSuccess }) {
  const [activeTab, setActiveTab] = useState("info");
  const [isUtilityModalOpen, setIsUtilityModalOpen] = useState(false);

  // State tiện ích (giữ nguyên logic bạn đã đồng bộ)
  const [availableAmenities, setAvailableAmenities] = useState([
    { id: "ac", label: "Điều hoà", checked: false },
    { id: "kitchen", label: "Bếp", checked: false },
    { id: "bed", label: "Giường", checked: false },
    { id: "tv", label: "TV", checked: false },
    { id: "balcony", label: "Ban công", checked: false },
    { id: "window", label: "Cửa sổ", checked: false },
  ]);

  const form = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomName: "",
      status: "Trống",
      building: "",
      type: "Căn hộ studio",
      area: 0,
      maxPeople: 2,
      description: "",
      rentPrice: 0,
      depositPrice: 0,
      elecPrice: 4000,
      waterPrice: 50000,
      // Mặc định có thể để trống hoặc có 1 dòng mẫu
      extraCosts: [
        { name: "Tiền rác", price: 0 },
      ],
      images: [],
    },
  });

  // Quản lý mảng chi phí phụ (Logic giống Service bên Invoice)
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "extraCosts",
  });

  const toggleAmenity = (id) => {
    setAvailableAmenities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleAddNewAmenity = (name) => {
    const newId = name.toLowerCase().replace(/\s+/g, "-");
    const exists = availableAmenities.find(a => a.id === newId || a.label.toLowerCase() === name.toLowerCase());
    
    if (!exists) {
        setAvailableAmenities([
            ...availableAmenities,
            { id: newId, label: name, checked: true },
        ]);
    } else {
        setAvailableAmenities(prev => prev.map(a => 
            (a.id === newId || a.label.toLowerCase() === name.toLowerCase()) ? { ...a, checked: true } : a
        ));
    }
  };

  const onSubmit = (values) => {
    const selectedAmenities = availableAmenities
        .filter((item) => item.checked)
        .map((item) => item.label);

    const finalData = {
        ...values,
        amenities: selectedAmenities,
    };

    console.log("Room Data:", finalData);
    if (onAddSuccess) onAddSuccess(finalData);
    
    onClose();
    form.reset();
    setActiveTab("info");
    setAvailableAmenities(prev => prev.map(item => ({ ...item, checked: false })));
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-all rounded-md
        ${
          activeTab === id
            ? "bg-white text-black shadow-sm font-bold"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
        }`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <>
        <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white text-black max-h-[90vh] flex flex-col">
            
            {/* HEADER */}
            <div className="p-6 pb-2">
                <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Thêm phòng mới</DialogTitle>
                </DialogHeader>
            </div>

            {/* TABS SWITCHER */}
            <div className="px-6 mb-2">
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <TabButton id="info" label="Thông tin" icon={Info} />
                <TabButton id="money" label="Tiền" icon={DollarSign} />
                <TabButton id="images" label="Ảnh phòng" icon={ImageIcon} />
            </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 pt-2">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* --- TAB 1: THÔNG TIN --- */}
                {activeTab === "info" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                            control={form.control}
                            name="roomName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-semibold text-sm">Phòng</FormLabel>
                                <FormControl><Input placeholder="101, A203..." {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-semibold text-sm">Trạng thái</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Trống">Trống</SelectItem>
                                    <SelectItem value="Đã thuê">Đã thuê</SelectItem>
                                    <SelectItem value="Đang sửa">Đang sửa</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                            control={form.control}
                            name="building"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-semibold text-sm">Toà</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn toà nhà" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Chung cư hoàng anh gia lai">Chung cư Hoàng Anh...</SelectItem>
                                    <SelectItem value="VinHome">VinHome</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-semibold text-sm">Loại</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại phòng" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Căn hộ studio">Căn hộ studio</SelectItem>
                                    <SelectItem value="Phòng đơn">Phòng đơn</SelectItem>
                                    <SelectItem value="Ký túc xá">Ký túc xá</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                            control={form.control}
                            name="area"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-semibold text-sm">Diện tích (m²)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="maxPeople"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-semibold text-sm">Tối đa (người)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-semibold text-sm">Mô tả</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Type your message here." {...field} className="min-h-[80px]" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                        {/* TIỆN ÍCH */}
                        <div>
                            <FormLabel className="font-semibold text-sm block mb-3">Tiện ích</FormLabel>
                            <div className="grid grid-cols-3 gap-y-3 gap-x-2">
                                {availableAmenities.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`room-amenity-${item.id}`} 
                                            checked={item.checked}
                                            onChange={() => toggleAmenity(item.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                                        />
                                        <label htmlFor={`room-amenity-${item.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                            {item.label}
                                        </label>
                                    </div>
                                ))}

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
                    </div>
                )}

                {/* --- TAB 2: TIỀN (Giao diện mới) --- */}
                {activeTab === "money" && (
                    <div className="space-y-6">
                        {/* 1. Các chi phí chính */}
                        <div>
                            <h4 className="text-sm font-bold mb-3 text-black">Các chi phí chính</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="rentPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="text-xs font-semibold text-gray-700">Giá thuê (vnd)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="depositPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="text-xs font-semibold text-gray-700">Giá cọc (vnd)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="elecPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="text-xs font-semibold text-gray-700">Tiền điện (vnd)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="waterPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="text-xs font-semibold text-gray-700">Tiền nước (vnd)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* 2. Các chi phí phụ (Giao diện giống Invoice) */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-black">Các chi phí phụ</h4>
                            
                            {/* List items */}
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-end group">
                                        {/* Tên chi phí */}
                                        <FormField
                                            control={form.control}
                                            name={`extraCosts.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel className="text-xs font-semibold text-gray-600">Tên chi phí</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Tiền rác, wifi..." {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        {/* Số tiền */}
                                        <FormField
                                            control={form.control}
                                            name={`extraCosts.${index}.price`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel className="text-xs font-semibold text-gray-600">Số tiền</FormLabel>
                                                    <div className="relative">
                                                        <FormControl>
                                                            <Input type="number" {...field} 
                                                           />
                                                            
                                                        </FormControl>
                                                        <span className="absolute right-3 top-2 text-gray-400 text-sm">đ</span>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        {/* Nút xóa */}
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="mb-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Xóa"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Nút thêm mới - Full width đen */}
                            <Button
                                type="button"
                                onClick={() => append({ name: "", price: 0 })}
                                className="w-full bg-gray-900 text-white hover:bg-gray-800"
                            >
                                Thêm chi phí
                            </Button>
                        </div>
                    </div>
                )}

                {/* --- TAB 3: ẢNH PHÒNG --- */}
                {activeTab === "images" && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">Giúp tối đa 10 ảnh</p>
                        <Button type="button" variant="outline" className="border-black text-black hover:bg-gray-50 gap-2">
                            <Upload size={16} /> Tải ảnh
                        </Button>

                        <div className="border-2 border-dashed border-gray-200 rounded-lg h-64 flex flex-col items-center justify-center text-gray-400 bg-white mt-2">
                            <ImageIcon size={32} className="mb-2 opacity-50" />
                            <p className="text-sm font-medium">ảnh</p>
                        </div>
                    </div>
                )}
                </form>
            </Form>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="p-6 pt-4 border-t bg-white flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-black">
                    Huỷ
                </Button>
                <Button type="button" onClick={form.handleSubmit(onSubmit)} className="bg-gray-900 text-white hover:bg-gray-800">
                    Chấp nhận
                </Button>
            </div>

        </DialogContent>
        </Dialog>

        {/* Modal con */}
        <AddUtilityModal
            isOpen={isUtilityModalOpen}
            onClose={() => setIsUtilityModalOpen(false)}
            onAddSuccess={handleAddNewAmenity}
        />
    </>
  );
}
import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function FinancialInfoSection({ form }) {
  return (
    <div className="p-5 rounded-xl border-2">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        💰 Thông tin tài chính
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="rentPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-gray-700">
                Giá thuê (VNĐ)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  className="bg-white"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deposit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-gray-700">
                Tiền cọc (VNĐ)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  className="bg-white"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="electricityPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-gray-700">
                Điện (/kWh)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  className="bg-white"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="waterPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-gray-700">
                Nước (/Người)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  className="bg-white"
                />
              </FormControl>
            </FormItem>
          )}
        />
        {/* Số điện ban đầu lúc ký hợp đồng - dùng để tính hóa đơn tháng đầu */}
        <FormField
          control={form.control}
          name="initialElectricityIndex"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel className="font-semibold text-gray-700">
                ⚡ Số điện ban đầu (kWh)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="VD: 1234 - Số điện hiện tại trên đồng hồ"
                  {...field}
                  className="bg-white"
                />
              </FormControl>
              <p className="text-xs text-gray-500 mt-1">
                Nhập chỉ số công tơ điện hiện tại. Số này sẽ dùng làm số điện cũ cho hóa đơn tháng đầu tiên.
              </p>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

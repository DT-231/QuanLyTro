/**
 * RoomSearchForm - Form tìm kiếm phòng trọ
 *
 * Component cho phép người dùng:
 * - Tìm kiếm theo tên phòng, tiện ích
 * - Lọc theo số người ở
 * - Lọc theo vị trí (quận/huyện)
 *
 * @deprecated Component này không còn được sử dụng trên HomePage.
 * HomePage đã chuyển sang sử dụng ComboboxLocation và inline search.
 * Giữ lại để tham khảo hoặc dùng cho các trang khác.
 */
import { ComboboxDemo } from "./comboboxDemo";

/**
 * @param {Object} props
 * @param {Object} props.filters - Object chứa các giá trị filter hiện tại
 * @param {Function} props.setFilters - Hàm cập nhật filters
 */
const RoomSearchForm = ({ filters, setFilters }) => {
  /**
   * Xử lý thay đổi giá trị input/select
   * @param {Event} e - Event từ input/select
   */
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-5 rounded-[10px] border border-black/10 mb-6 flex flex-col gap-5">
      <h2 className="text-lg font-semibold leading-5 text-black">
        Tìm kiếm và lọc
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        {/* Input tìm kiếm theo tên phòng/tiện ích */}
        <input
          type="text"
          name="priceRange"
          placeholder="Nhập tên phòng, tiện ích"
          value={filters.search}
          onChange={handleChange}
          className="h-10 w-[465px] rounded-md border border-zinc-200 bg-gray-50 px-4 py-2"
        />

        {/* Nút tìm kiếm - TODO: Implement search logic */}
        <button
          className="mr-2 h-9 flex-none items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-gray-50"
          onClick={() => {
            // TODO: Gọi API tìm kiếm với filters
          }}
        >
          Tìm
        </button>

        {/* Dropdown lọc theo số người */}
        <select
          name="capacity"
          value={filters.capacity}
          onChange={handleChange}
          className="h-10 w-[160px] rounded-md border border-zinc-200 bg-gray-50 px-2.5 py-2 text-sm"
        >
          <option value="">Lọc theo số người</option>
          <option value="1">1 người</option>
          <option value="2">2 người</option>
          <option value="3">3 người</option>
          <option value="4">4 người</option>
          <option value="5">5 người</option>
          <option value="6">6 người</option>
        </select>

        {/* Dropdown lọc theo quận/huyện */}
        <select
          name="location"
          value={filters.location}
          onChange={handleChange}
          className="h-10 w-[160px] rounded-md border border-zinc-200 bg-gray-50 px-2.5 py-2 text-sm"
        >
          <option value="">Lọc theo quận</option>
          <option value="Hải Châu">Hải Châu</option>
          <option value="Thanh Khê">Thanh Khê</option>
          <option value="Liên Chiểu">Liên Chiểu</option>
          <option value="Ngũ Hành Sơn">Ngũ Hành Sơn</option>
          <option value="Sơn Trà">Sơn Trà</option>
        </select>

        {/* Combobox demo - có thể thay thế bằng ComboboxLocation */}
        <ComboboxDemo />
      </div>
    </div>
  );
};

export default RoomSearchForm;

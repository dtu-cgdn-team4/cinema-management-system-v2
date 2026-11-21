import { useEffect } from 'react';
import { LogOut } from 'lucide-react';

/**
 * Modal xác nhận trước khi đăng xuất tài khoản.
 * Khớp chuẩn thiết kế giao diện tối với icon màu đỏ, bo góc và hiệu ứng chuyển cảnh mượt mà.
 *
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {() => void} onConfirm - Callback khi bấm nút "Đăng xuất"
 * @param {() => void} onCancel - Callback khi bấm nút "Hủy" hoặc thoát modal
 */
export default function LogoutConfirmModal({ isOpen, onConfirm, onCancel }) {
  // Lắng nghe phím Escape để đóng modal thuận tiện cho người dùng
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px] transition-opacity"
      onClick={onCancel}
    >
      {/* Khối modal container */}
      <div
        className="w-full max-w-[390px] rounded-[26px] bg-[#222327] border border-white/10 p-6 sm:p-7 flex flex-col items-center text-center shadow-2xl shadow-black/80 transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Vòng tròn chứa icon LogOut */}
        <div className="w-14 h-14 rounded-full bg-[#2f3036] flex items-center justify-center mb-4 text-[#ef4444] shadow-inner">
          <LogOut size={24} strokeWidth={2.2} className="translate-x-[1px]" />
        </div>

        {/* Tiêu đề */}
        <h3
          id="logout-modal-title"
          className="text-[19px] sm:text-[20px] font-bold text-white tracking-tight mb-2.5"
        >
          Xác nhận đăng xuất
        </h3>

        {/* Đoạn mô tả */}
        <p className="text-[13.5px] sm:text-[14px] text-[#9ca3af] leading-relaxed mb-6 px-1">
          Bạn có chắc chắn muốn đăng xuất khỏi tài khoản của mình không?
        </p>

        {/* 2 nút thao tác: Hủy và Đăng xuất */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 sm:h-12 w-full flex items-center justify-center rounded-2xl border border-white/15 bg-transparent text-white text-[14px] sm:text-[15px] font-medium transition-all hover:bg-white/5 hover:border-white/25 active:scale-[0.98] cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="h-11 sm:h-12 w-full flex items-center justify-center rounded-2xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[14px] sm:text-[15px] font-semibold transition-all shadow-lg shadow-red-600/25 active:scale-[0.98] cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
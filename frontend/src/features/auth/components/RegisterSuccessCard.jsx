import { CheckCircle2, LogIn, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Hiển thị xác nhận sau khi API đăng ký thành công; người dùng tự chuyển sang trang đăng nhập.
 */
export default function RegisterSuccessCard({ registeredUser }) {
  return (
    <div className="flex flex-col items-center text-center rounded-2xl border border-line bg-surface p-8 sm:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      <div className="grid size-16 place-items-center rounded-full border border-ok/30 bg-ok/10 text-ok mb-5 shadow-[0_0_30px_rgba(52,211,153,0.25)]">
        <CheckCircle2 size={36} />
      </div>

      <span className="rounded-full border border-ok/30 bg-ok/10 px-3.5 py-1 text-xs font-bold text-ok uppercase tracking-wider">
        Hoàn tất đăng ký
      </span>

      <h3 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold text-white">
        Chào mừng gia nhập Galaxy Lumière!
      </h3>

      <p className="mt-2.5 max-w-md text-sm text-muted leading-relaxed">
        Tài khoản khách hàng của bạn đã được khởi tạo thành công. Bạn có thể sử dụng tên đăng nhập và mật khẩu vừa tạo để đăng nhập vào hệ thống.
      </p>

      {registeredUser && (
        <div className="my-6 w-full max-w-md rounded-xl border border-line bg-card/70 p-4 text-left">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted block">Tên đăng nhập:</span>
              <strong className="font-mono text-sm text-white">{registeredUser.username}</strong>
            </div>
            <div>
              <span className="text-muted block">Họ và tên:</span>
              <strong className="text-sm text-white">{registeredUser.fullName}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
        <Link
          to="/dang-nhap"
          className="flex h-12 flex-1 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-dark px-6 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:brightness-110"
        >
          <LogIn size={18} />
          Đăng nhập ngay
        </Link>
        <Link
          to="/lich-chieu"
          className="flex h-12 flex-1 w-full items-center justify-center gap-2 rounded-xl border border-line bg-card px-6 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-surface"
        >
          <Ticket size={18} />
          Xem lịch chiếu
        </Link>
      </div>

      <p className="mt-6 text-[11px] text-muted">
        Cần hỗ trợ? Liên hệ hotline chăm sóc khách hàng: <strong className="text-white">1900 2224</strong>
      </p>
    </div>
  );
}

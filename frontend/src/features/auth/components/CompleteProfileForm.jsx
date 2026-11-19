import { useEffect, useState } from 'react';
import RegisterForm from './RegisterForm';
import { completeProfile } from '../api/authApi';
import { errorMessage } from '@/services/apiClient';
import { toIsoDateString, validateCompleteProfileForm } from '../utils/registerValidation';

/** Chuyển đổi ngày sinh ISO sang dạng hiển thị DD / MM / YYYY cho ô nhập */
function formatDateToDisplay(val) {
  if (!val) return '';
  const str = String(val).trim();
  if (str.includes('/')) return str;
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${day} / ${month} / ${year}`;
    }
  }
  return str;
}

/**
 * Biểu mẫu bổ sung nội dung còn thiếu sau khi đăng nhập Google.
 * Tái sử dụng RegisterForm từ luồng đăng ký:
 * - Cột bên trái giữ nguyên banner điện ảnh.
 * - Cột bên phải đổi từ form đăng nhập sang form này.
 * - Điền sẵn thông tin nhận từ Google (username, họ tên, email) để người dùng tự sửa.
 * - Bắt buộc nhập số điện thoại, ngày sinh, giới tính để xuất vé và tích điểm.
 */
export default function CompleteProfileForm({ user, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'MALE',
    idCard: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Điền sẵn thông tin từ Google
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? formatDateToDisplay(user.dateOfBirth) : '',
        gender:
          user.gender === 'Nữ' || user.gender === 'FEMALE'
            ? 'FEMALE'
            : user.gender === 'Khác' || user.gender === 'OTHER'
            ? 'OTHER'
            : 'MALE',
        idCard: user.citizenId || user.idCard || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validation = validateCompleteProfileForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        phoneNumber: formData.phoneNumber.trim(),
        dateOfBirth: toIsoDateString(formData.dateOfBirth),
        gender: formData.gender,
        fullName: formData.fullName?.trim() || null,
        idCard: formData.idCard?.trim() || null,
        address: formData.address?.trim() || null,
      };

      const response = await completeProfile(payload);
      const updatedUser = response?.data || response;
      if (onSuccess) {
        onSuccess(updatedUser);
      }
    } catch (err) {
      const msg = errorMessage(err) || 'Không thể lưu thông tin. Vui lòng thử lại.';
      if (err?.response?.data?.errors?.phoneNumber || msg.toLowerCase().includes('số điện thoại')) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: err?.response?.data?.errors?.phoneNumber || 'Số điện thoại này đã được sử dụng bởi tài khoản khác',
        }));
      } else if (err?.response?.data?.errors?.dateOfBirth || msg.toLowerCase().includes('tuổi') || msg.toLowerCase().includes('ngày sinh')) {
        setErrors((prev) => ({
          ...prev,
          dateOfBirth: err?.response?.data?.errors?.dateOfBirth || msg,
        }));
      } else {
        setServerError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Tiêu đề biểu mẫu theo phong cách chuẩn Galaxy */}
      <div className="mb-2">
        <span className="block text-[10px] font-semibold uppercase tracking-[2.2px] text-[#ca3538]">
          THÀNH VIÊN GALAXY
        </span>
        <h2 className="mt-0.5 font-sans text-[25px] sm:text-[27px] font-semibold tracking-tight text-white leading-tight">
          Hoàn tất thông tin tài khoản
        </h2>
        <p className="mt-1 text-[12px] sm:text-[13px] text-[#8f929a] leading-relaxed">
          Tài khoản Google đã kết nối. Vui lòng kiểm tra và bổ sung số điện thoại, ngày sinh để tích điểm và xuất vé.
        </p>
      </div>

      {/* Tái sử dụng RegisterForm */}
      <RegisterForm
        formData={formData}
        errors={errors}
        serverError={serverError}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isCompleteProfile={true}
        submitLabel="Hoàn tất & Tiếp tục"
      />

      {/* Tùy chọn đổi tài khoản khác nếu muốn */}
      {onCancel && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[#8f929a] hover:text-[#ca3538] transition cursor-pointer"
          >
            ← Đăng nhập bằng tài khoản khác
          </button>
        </div>
      )}
    </div>
  );
}

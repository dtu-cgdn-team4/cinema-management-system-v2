import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAge,
  getUtf8ByteLength,
  validateRegisterForm,
} from './registerValidation.js';
import { toE164VietnamesePhone, formatDisplayPhone } from './phoneUtils.js';

test('calculateAge tính tuổi chính xác cho cả ISO và DD / MM / YYYY', () => {
  const ref = new Date(2026, 10, 13); // 2026-11-13
  assert.equal(calculateAge('2000-01-01', ref), 26);
  assert.equal(calculateAge('01 / 01 / 2000', ref), 26);
  assert.equal(calculateAge('14 / 11 / 2013', ref), 12); // Chưa qua sinh nhật -> 12 tuổi
  assert.equal(calculateAge('13 / 11 / 2013', ref), 13); // Đúng sinh nhật -> 13 tuổi
  assert.equal(calculateAge('1905-01-01', ref), 121);
  assert.equal(calculateAge('invalid-date', ref), null);
  assert.equal(calculateAge('31 / 02 / 2024', ref), null); // Ngày không hợp lệ
});

test('getUtf8ByteLength tính đúng byte UTF-8', () => {
  assert.equal(getUtf8ByteLength('Password123'), 11);
  assert.equal(getUtf8ByteLength('MậtKhẩu123'), 14);
  assert.equal(getUtf8ByteLength(''), 0);
});

test('toE164VietnamesePhone chuyển đổi đúng số điện thoại', () => {
  assert.equal(toE164VietnamesePhone('0901234567'), '+84901234567');
  assert.equal(toE164VietnamesePhone('0381234567'), '+84381234567');
  assert.equal(toE164VietnamesePhone('+84901234567'), '+84901234567');
  assert.equal(toE164VietnamesePhone(''), '');
  assert.equal(formatDisplayPhone('0901234567'), '0901 234 567');
});

test('validateRegisterForm trả về lỗi cho các trường bắt buộc bị bỏ trống', () => {
  const result = validateRegisterForm({});
  assert.equal(result.isValid, false);
  assert.equal(result.errors.username, 'Vui lòng nhập tài khoản.');
  assert.equal(result.errors.fullName, 'Vui lòng nhập họ và tên.');
  assert.equal(result.errors.email, 'Vui lòng nhập email.');
  assert.equal(result.errors.phoneNumber, 'Vui lòng nhập SĐT.');
  assert.equal(result.errors.dateOfBirth, 'Vui lòng nhập ngày sinh.');
  assert.equal(result.errors.gender, 'Vui lòng chọn giới tính.');
  assert.equal(result.errors.password, 'Vui lòng nhập mật khẩu.');
  assert.equal(result.errors.confirmPassword, 'Vui lòng nhập lại mật khẩu.');
  assert.equal(result.errors.termsAccepted, 'Bạn cần đồng ý với điều khoản để đăng ký.');
  // Các trường không bắt buộc không được báo lỗi khi bỏ trống
  assert.equal(result.errors.idCard, undefined);
  assert.equal(result.errors.address, undefined);
});

test('Frame Đăng ký - Sai thông tin (node 1383:912): kiểm tra định dạng và nghiệp vụ từng trường', () => {
  const result = validateRegisterForm({
    username: 'ab', // < 3 ký tự
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvanan@', // thiếu domain -> sai định dạng
    phoneNumber: '090512', // thiếu chữ số -> SĐT phải có 10 chữ số
    dateOfBirth: '', // rỗng -> Vui lòng nhập ngày sinh.
    gender: '', // rỗng -> Vui lòng chọn giới tính.
    idCard: '', // rỗng -> hợp lệ
    address: '', // rỗng -> hợp lệ
    password: '123', // ngắn < 8 ký tự -> Mật khẩu cần tối thiểu 8 ký tự.
    confirmPassword: 'different_password', // khác mật khẩu
    termsAccepted: false,
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.username, 'Tên đăng nhập phải có 3-30 ký tự chữ, số hoặc dấu gạch dưới.');
  assert.equal(result.errors.fullName, undefined); // Họ tên hợp lệ không có lỗi
  assert.equal(result.errors.email, 'Email không đúng định dạng.');
  assert.equal(result.errors.dateOfBirth, 'Vui lòng nhập ngày sinh.');
  assert.equal(result.errors.gender, 'Vui lòng chọn giới tính.');
  assert.equal(result.errors.idCard, undefined);
  assert.equal(result.errors.phoneNumber, 'SĐT phải có 10 chữ số.');
  assert.equal(result.errors.address, undefined);
  assert.equal(result.errors.password, 'Mật khẩu cần tối thiểu 8 ký tự.');
  assert.equal(result.errors.confirmPassword, 'Mật khẩu nhập lại không khớp.');
  assert.equal(result.errors.termsAccepted, 'Bạn cần đồng ý với điều khoản để đăng ký.');
});

test('Kiểm tra giới hạn 72 byte UTF-8 của mật khẩu', () => {
  const longPass = 'StrongPass1' + 'ạ'.repeat(35);
  const result = validateRegisterForm({
    password: longPass,
    confirmPassword: longPass,
  });
  assert.equal(result.errors.password, 'Mật khẩu không được vượt quá 72 byte.');
});

test('Dữ liệu hợp lệ: không có lỗi validation', () => {
  const result = validateRegisterForm({
    username: 'nguyenvana_99',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phoneNumber: '0901234567',
    dateOfBirth: '15 / 05 / 2000',
    gender: 'MALE',
    idCard: '012345678901',
    address: '123 Đường Nguyễn Huệ, Quận 1',
    password: 'SecurePassword123',
    confirmPassword: 'SecurePassword123',
    termsAccepted: true,
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
});

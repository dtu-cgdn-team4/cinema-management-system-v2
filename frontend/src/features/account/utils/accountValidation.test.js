import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAge,
  dmyToIso,
  getAvatarInitials,
  getUtf8ByteLength,
  isoToDmy,
  validatePasswordForm,
  validateProfileForm,
} from './accountValidation.js';

describe('accountValidation', () => {
  it('calculateAge tính tuổi chính xác', () => {
    assert.equal(calculateAge(''), null);
    assert.equal(calculateAge(null), null);
    // Ngày sinh cách đây 20 năm
    const now = new Date();
    const twentyYearsAgo = `${now.getFullYear() - 20}-01-01`;
    const age = calculateAge(twentyYearsAgo);
    assert.ok(age === 20 || age === 19);
  });

  it('getAvatarInitials sinh chữ cái viết tắt đại diện chuẩn xác', () => {
    assert.equal(getAvatarInitials('Nguyễn Văn An'), 'NA');
    assert.equal(getAvatarInitials('An'), 'AN');
    assert.equal(getAvatarInitials('Trần Thị Mai'), 'TM');
    assert.equal(getAvatarInitials(''), 'U');
    assert.equal(getAvatarInitials(null), 'U');
  });

  it('getUtf8ByteLength tính đúng byte UTF-8', () => {
    assert.equal(getUtf8ByteLength('Hello123'), 8);
    assert.equal(getUtf8ByteLength('Tiếng Việt'), 14);
  });

  it('validateProfileForm: bắt lỗi họ tên trống và sai độ dài', () => {
    const resEmpty = validateProfileForm({ fullName: '   ' });
    assert.equal(resEmpty.isValid, false);
    assert.equal(resEmpty.errors.fullName, 'Họ và tên không được để trống.');

    const resShort = validateProfileForm({ fullName: 'A' });
    assert.equal(resShort.isValid, false);
    assert.equal(resShort.errors.fullName, 'Họ và tên phải có ít nhất 2 ký tự.');

    const resLong = validateProfileForm({ fullName: 'A'.repeat(151) });
    assert.equal(resLong.isValid, false);
    assert.equal(resLong.errors.fullName, 'Họ và tên phải có 2-150 ký tự.');
  });

  it('validateProfileForm: kiểm tra ngày sinh và tuổi 13-120', () => {
    const today = new Date();
    const tooYoung = `${today.getFullYear() - 10}-01-01`;
    const resYoung = validateProfileForm({ fullName: 'Nguyễn Văn An', dateOfBirth: tooYoung });
    assert.equal(resYoung.isValid, false);
    assert.equal(resYoung.errors.dateOfBirth, 'Tuổi phải từ 13 đến 120.');

    const validAge = `${today.getFullYear() - 22}-01-01`;
    const resValid = validateProfileForm({ fullName: 'Nguyễn Văn An', dateOfBirth: validAge });
    assert.equal(resValid.isValid, true);
  });

  it('validateProfileForm: kiểm tra định dạng CCCD/CMND (9 hoặc 12 số)', () => {
    const resInvalid = validateProfileForm({ fullName: 'Nguyễn Văn An', citizenId: '12345' });
    assert.equal(resInvalid.isValid, false);
    assert.equal(resInvalid.errors.citizenId, 'CMND/CCCD phải gồm 9 hoặc 12 số.');

    const res9 = validateProfileForm({ fullName: 'Nguyễn Văn An', citizenId: '123456789' });
    assert.equal(res9.isValid, true);

    const res12 = validateProfileForm({ fullName: 'Nguyễn Văn An', citizenId: '048202001234' });
    assert.equal(res12.isValid, true);
  });

  it('validateProfileForm: kiểm tra độ dài địa chỉ (5-255 ký tự)', () => {
    const resShort = validateProfileForm({ fullName: 'Nguyễn Văn An', address: '123' });
    assert.equal(resShort.isValid, false);
    assert.equal(resShort.errors.address, 'Địa chỉ phải có ít nhất 5 ký tự.');

    const resLong = validateProfileForm({ fullName: 'Nguyễn Văn An', address: 'a'.repeat(256) });
    assert.equal(resLong.isValid, false);
    assert.equal(resLong.errors.address, 'Địa chỉ không được vượt quá 255 ký tự.');

    const resValid = validateProfileForm({ fullName: 'Nguyễn Văn An', address: '254 Nguyễn Văn Linh, Đà Nẵng' });
    assert.equal(resValid.isValid, true);
  });

  it('validatePasswordForm: kiểm tra mật khẩu hiện tại, mật khẩu mới và xác nhận', () => {
    const resMissing = validatePasswordForm({});
    assert.equal(resMissing.isValid, false);
    assert.ok(resMissing.errors.currentPassword);
    assert.ok(resMissing.errors.newPassword);
    assert.ok(resMissing.errors.confirmPassword);

    // Mật khẩu mới yếu
    const resWeak = validatePasswordForm({
      currentPassword: 'OldPass123',
      newPassword: 'short',
      confirmPassword: 'short',
    });
    assert.equal(resWeak.isValid, false);
    assert.equal(resWeak.errors.newPassword, 'Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và chữ số.');

    // Mật khẩu xác nhận không khớp
    const resMismatch = validatePasswordForm({
      currentPassword: 'OldPass123',
      newPassword: 'NewPassword123',
      confirmPassword: 'MismatchPassword123',
    });
    assert.equal(resMismatch.isValid, false);
    assert.equal(resMismatch.errors.confirmPassword, 'Mật khẩu xác nhận không khớp.');

    // Mật khẩu mới trùng mật khẩu hiện tại
    const resSame = validatePasswordForm({
      currentPassword: 'OldPassword123',
      newPassword: 'OldPassword123',
      confirmPassword: 'OldPassword123',
    });
    assert.equal(resSame.isValid, false);
    assert.equal(resSame.errors.newPassword, 'Mật khẩu mới không được trùng với mật khẩu hiện tại.');

    // Mật khẩu hợp lệ
    const resOk = validatePasswordForm({
      currentPassword: 'OldPass123',
      newPassword: 'NewPassword123',
      confirmPassword: 'NewPassword123',
    });
    assert.equal(resOk.isValid, true);
  });

  it('isoToDmy và dmyToIso chuyển đổi ngày chính xác theo chuẩn Figma', () => {
    assert.equal(isoToDmy('2002-08-15'), '15/08/2002');
    assert.equal(dmyToIso('15/08/2002'), '2002-08-15');
    assert.equal(isoToDmy(''), '');
    assert.equal(dmyToIso(''), null);
  });
});

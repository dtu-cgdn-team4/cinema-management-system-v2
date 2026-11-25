import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getPostLoginRedirectPath } from './authRedirect.js';

describe('getPostLoginRedirectPath', () => {
  it('chuyển hướng ADMIN về /admin/movies khi không có trang đích hoặc trang đích là /', () => {
    assert.equal(getPostLoginRedirectPath({ role: 'ADMIN' }, undefined), '/admin/movies');
    assert.equal(getPostLoginRedirectPath({ roleCode: 'ADMIN' }, '/'), '/admin/movies');
    assert.equal(getPostLoginRedirectPath({ role: 'ADMIN' }, '/login'), '/admin/movies');
    assert.equal(getPostLoginRedirectPath({ role: 'ADMIN' }, '/dang-nhap'), '/admin/movies');
  });

  it('giữ nguyên trang đích hợp lệ nếu user truy cập trực tiếp trước đó', () => {
    assert.equal(getPostLoginRedirectPath({ role: 'ADMIN' }, '/admin/movies?page=2'), '/admin/movies?page=2');
    assert.equal(getPostLoginRedirectPath({ role: 'KHACH_HANG' }, '/dat-ve/123'), '/dat-ve/123');
  });

  it('chuyển hướng khách hàng thường về / khi không có trang đích cụ thể', () => {
    assert.equal(getPostLoginRedirectPath({ role: 'KHACH_HANG' }, undefined), '/');
    assert.equal(getPostLoginRedirectPath({ role: 'KHACH_HANG' }, '/login'), '/');
  });

  it('ngăn chặn open redirect với URL không hợp lệ', () => {
    assert.equal(getPostLoginRedirectPath({ role: 'ADMIN' }, '//evil.com'), '/admin/movies');
    assert.equal(getPostLoginRedirectPath({ role: 'KHACH_HANG' }, 'https://evil.com'), '/');
  });
});

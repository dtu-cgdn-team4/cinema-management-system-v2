/**
 * Xác định đường dẫn chuyển hướng sau khi đăng nhập thành công dựa theo vai trò tài khoản.
 * Nếu tài khoản là ADMIN và chưa có trang đích cụ thể (hoặc trang đích là '/' hay trang đăng nhập),
 * ưu tiên đưa về trang quản lý phim của quản trị viên (/admin/movies).
 */
export function getPostLoginRedirectPath(user, requestedPath) {
  const role = user?.roleCode || user?.role;
  const defaultPath = role === 'ADMIN' ? '/admin/movies' : '/';

  if (
    typeof requestedPath === 'string' &&
    requestedPath.startsWith('/') &&
    !requestedPath.startsWith('//') &&
    requestedPath !== '/' &&
    !requestedPath.startsWith('/dang-nhap') &&
    !requestedPath.startsWith('/login')
  ) {
    return requestedPath;
  }

  return defaultPath;
}

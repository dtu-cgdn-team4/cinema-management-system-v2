import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterCinemas } from './filterCinemas.js';

const HCM = 'TP. Hồ Chí Minh';
const cinemas = [
  { id: 1, name: 'Galaxy Landmark 81', city: HCM, address: 'Tầng B1, Vincom Center Landmark 81, Quận Bình Thạnh' },
  { id: 2, name: 'Galaxy Nguyễn Du', city: HCM, address: '116 Nguyễn Du, Quận 1' },
  { id: 3, name: 'Galaxy Đà Nẵng Center', city: 'Đà Nẵng', address: '910A Ngô Quyền, Quận Sơn Trà' },
];
const ids = (city, query) => filterCinemas(cinemas, city, query).map((c) => c.id);

test('chỉ lấy rạp trong thành phố đang chọn', () => {
  assert.deepEqual(ids(HCM, ''), [1, 2]);
  assert.deepEqual(ids(HCM, '   '), [1, 2]);
});

test('tìm theo tên, quận hoặc địa chỉ, không phân biệt dấu và hoa thường', () => {
  assert.deepEqual(ids(HCM, 'binh thanh'), [1]);
  assert.deepEqual(ids(HCM, 'NGUYỄN du'), [2]);
  assert.deepEqual(ids('Đà Nẵng', 'da nang'), [3]);
});

test('rạp khớp từ khóa nhưng ở thành phố khác thì không hiện', () => {
  assert.deepEqual(ids(HCM, 'sơn trà'), []);
});

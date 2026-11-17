import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seatCountError } from './seatCountError.js';

test('thông báo số ghế theo SRS 6.2.2', () => {
  assert.equal(seatCountError(0, 0), 'Vui lòng chọn số lượng ghế');
  assert.equal(seatCountError(3, 1), 'Bạn chọn thiếu 2 ghế');
  assert.equal(seatCountError(2, 3), 'Bạn chỉ chọn 2 ghế');
  assert.equal(seatCountError(2, 2), null);
});

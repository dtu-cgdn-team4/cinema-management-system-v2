import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scheduleDays } from './scheduleDays.js';

test('6 ngày liên tiếp từ hôm nay', () => {
  assert.deepEqual(scheduleDays(new Date(2026, 10, 4, 21, 30)), [
    '2026-11-04',
    '2026-11-05',
    '2026-11-06',
    '2026-11-07',
    '2026-11-08',
    '2026-11-09',
  ]);
});

test('qua cuối tháng và cuối năm', () => {
  assert.deepEqual(scheduleDays(new Date(2026, 11, 29)), [
    '2026-12-29',
    '2026-12-30',
    '2026-12-31',
    '2027-01-01',
    '2027-01-02',
    '2027-01-03',
  ]);
});

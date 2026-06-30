/**
 * 常量定义单元测试
 */

import { describe, it, expect } from 'vitest';
import { INT_MIN, INT_MAX, STORAGE_KEYS, STORAGE_THRESHOLD } from '../../src/utils/constants';

describe('常量定义', () => {
  it('INT_MIN 应为 -2147483648', () => {
    expect(INT_MIN).toBe(-2147483648);
  });

  it('INT_MAX 应为 2147483647', () => {
    expect(INT_MAX).toBe(2147483647);
  });

  it('INT_MIN 和 INT_MAX 应符合32位有符号整数范围', () => {
    expect(INT_MIN).toBe(-(2 ** 31));
    expect(INT_MAX).toBe(2 ** 31 - 1);
  });

  it('STORAGE_KEYS 应包含所有键', () => {
    expect(STORAGE_KEYS.VARIABLES).toBe('table-editor-variables');
    expect(STORAGE_KEYS.SYNC_TIME).toBe('table-editor-sync-time');
    expect(STORAGE_KEYS.CONFIG).toBe('table-editor-config');
  });

  it('STORAGE_THRESHOLD 应有合理的阈值', () => {
    expect(STORAGE_THRESHOLD.SMALL).toBe(100);
    expect(STORAGE_THRESHOLD.MEDIUM).toBe(1000);
    expect(STORAGE_THRESHOLD.LARGE).toBe(1000);
  });
});

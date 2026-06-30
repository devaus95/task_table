/**
 * 全局常量定义
 */

// INT数据类型范围常量（32-bit signed integer）
export const INT_MIN = -2147483648; // -2^31
export const INT_MAX = 2147483647; // 2^31-1

// localStorage存储键
export const STORAGE_KEYS = {
  VARIABLES: 'table-editor-variables',
  SYNC_TIME: 'table-editor-sync-time',
  CONFIG: 'table-editor-config',
};

// 数据量阈值（用于选择存储策略）
export const STORAGE_THRESHOLD = {
  SMALL: 100, // <100条变量，使用localStorage
  MEDIUM: 1000, // 100-1000条变量，考虑IndexedDB
  LARGE: 1000, // >1000条变量，必须使用IndexedDB
};

// 默认变量模板
export const DEFAULT_VARIABLE = {
  dataType: 'INT' as const,
  defaultValue: '0',
  comment: '',
};

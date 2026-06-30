/**
 * 验证相关类型定义
 */

/**
 * 验证错误信息
 */
export interface ValidationError {
  field: string; // 错误字段
  message: string; // 错误信息
  rowIndex?: number; // 行索引
}

/**
 * 验证结果（详细版）
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * 验证结果（简化版，用于单字段验证）
 */
export interface SimpleValidationResult {
  isValid: boolean;
  error?: string; // 单个错误信息
}

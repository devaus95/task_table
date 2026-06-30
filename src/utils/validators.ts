/**
 * 数据验证逻辑实现
 */

import type { SimpleValidationResult } from '../types/validation';
import { INT_MIN, INT_MAX } from './constants';

/**
 * 验证INT类型默认值
 * @param value 输入值字符串
 * @returns 验证结果
 */
export function validateIntDefaultValue(value: string): SimpleValidationResult {
  const trimmedValue = value.trim();

  // 1. 空值检查
  if (!trimmedValue) {
    return { isValid: false, error: 'Default value cannot be empty' };
  }

  // 2. 数字格式检查
  const num = Number(trimmedValue);
  if (isNaN(num)) {
    return { isValid: false, error: 'Invalid number format' };
  }

  // 3. 整数检查
  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Value must be an integer' };
  }

  // 4. 范围检查（32-bit signed integer）
  if (num < INT_MIN || num > INT_MAX) {
    return {
      isValid: false,
      error: `Value must be between ${INT_MIN} and ${INT_MAX}`,
    };
  }

  return { isValid: true };
}

/**
 * 验证BOOL类型默认值
 * @param value 输入值字符串
 * @returns 验证结果和规范化后的值
 */
export function validateBoolDefaultValue(
  value: string
): SimpleValidationResult & { normalized?: string } {
  const trimmedValue = value.trim().toLowerCase();

  // 接受true/false，规范化为TRUE/FALSE
  if (trimmedValue === 'true') {
    return { isValid: true, normalized: 'TRUE' };
  }

  if (trimmedValue === 'false') {
    return { isValid: true, normalized: 'FALSE' };
  }

  return { isValid: false, error: 'BOOL value must be true or false' };
}

/**
 * 验证变量名称（唯一性检查）
 * @param name 变量名称
 * @param existingNames 已存在的名称列表
 * @param currentId 当前变量的ID（用于排除自身）
 * @returns 验证结果
 */
export function validateVariableName(
  name: string,
  existingNames: string[]
): SimpleValidationResult {
  const trimmedName = name.trim();

  // 1. 非空检查
  if (!trimmedName) {
    return { isValid: false, error: 'Variable name cannot be empty' };
  }

  // 2. 唯一性检查（不区分大小写，排除自身）
  // 注意：这里传入的existingNames应该包含其他变量的名称
  const isDuplicate = existingNames.some(
    (existing) => existing.toLowerCase() === trimmedName.toLowerCase()
  );

  if (isDuplicate) {
    return { isValid: false, error: 'Variable name already exists' };
  }

  return { isValid: true };
}

/**
 * 根据数据类型验证默认值
 * @param dataType 数据类型
 * @param defaultValue 默认值
 * @returns 验证结果
 */
export function validateDefaultValue(
  dataType: '' | 'BOOL' | 'INT',
  defaultValue: string
): SimpleValidationResult & { normalized?: string } {
  if (dataType === 'BOOL') {
    return validateBoolDefaultValue(defaultValue);
  } else if (dataType === 'INT') {
    return validateIntDefaultValue(defaultValue);
  }
  return { isValid: true };
}

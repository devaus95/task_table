/**
 * 数据验证逻辑单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  validateVariableName,
  validateBoolDefaultValue,
  validateIntDefaultValue,
  validateDefaultValue,
} from '../../src/utils/validators';

describe('validateVariableName', () => {
  it('空名称应返回错误', () => {
    const result = validateVariableName('', []);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Variable name cannot be empty');
  });

  it('纯空格名称应返回错误', () => {
    const result = validateVariableName('   ', []);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Variable name cannot be empty');
  });

  it('唯一且非空名称应通过验证', () => {
    const result = validateVariableName('Start', ['Stop', 'Count']);
    expect(result.isValid).toBe(true);
  });

  it('名称已存在（大小写不敏感）应返回错误', () => {
    const result = validateVariableName('start', ['Start', 'Stop']);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Variable name already exists');
  });

  it('名称完全一致（大小写不同）应返回错误', () => {
    const result = validateVariableName('COUNTER', ['counter']);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Variable name already exists');
  });

  it('名称与自身不冲突（空列表）', () => {
    const result = validateVariableName('NewVar', []);
    expect(result.isValid).toBe(true);
  });
});

describe('validateBoolDefaultValue', () => {
  it('接受 true 并规范化为 TRUE', () => {
    const result = validateBoolDefaultValue('true');
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('TRUE');
  });

  it('接受 TRUE 并规范化为 TRUE', () => {
    const result = validateBoolDefaultValue('TRUE');
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('TRUE');
  });

  it('接受 false 并规范化为 FALSE', () => {
    const result = validateBoolDefaultValue('false');
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('FALSE');
  });

  it('接受 FALSE 并规范化为 FALSE', () => {
    const result = validateBoolDefaultValue('FALSE');
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('FALSE');
  });

  it('接受混合大小写 True 并规范化', () => {
    const result = validateBoolDefaultValue('True');
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('TRUE');
  });

  it('非法值 yes 应返回错误', () => {
    const result = validateBoolDefaultValue('yes');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('BOOL value must be true or false');
  });

  it('非法值 1 应返回错误', () => {
    const result = validateBoolDefaultValue('1');
    expect(result.isValid).toBe(false);
  });

  it('非法值空字符串应返回错误', () => {
    const result = validateBoolDefaultValue('');
    expect(result.isValid).toBe(false);
  });
});

describe('validateIntDefaultValue', () => {
  it('接受正整数 42', () => {
    const result = validateIntDefaultValue('42');
    expect(result.isValid).toBe(true);
  });

  it('接受负整数 -100', () => {
    const result = validateIntDefaultValue('-100');
    expect(result.isValid).toBe(true);
  });

  it('接受边界最大值 2147483647', () => {
    const result = validateIntDefaultValue('2147483647');
    expect(result.isValid).toBe(true);
  });

  it('接受边界最小值 -2147483648', () => {
    const result = validateIntDefaultValue('-2147483648');
    expect(result.isValid).toBe(true);
  });

  it('接受 0', () => {
    const result = validateIntDefaultValue('0');
    expect(result.isValid).toBe(true);
  });

  it('浮点数 3.14 应返回错误', () => {
    const result = validateIntDefaultValue('3.14');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Value must be an integer');
  });

  it('超出范围 9999999999 应返回错误', () => {
    const result = validateIntDefaultValue('9999999999');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('between');
  });

  it('超出范围 -3000000000 应返回错误', () => {
    const result = validateIntDefaultValue('-3000000000');
    expect(result.isValid).toBe(false);
  });

  it('空值应返回错误', () => {
    const result = validateIntDefaultValue('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Default value cannot be empty');
  });

  it('非数字字符串 abc 应返回错误', () => {
    const result = validateIntDefaultValue('abc');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid number format');
  });
});

describe('validateDefaultValue', () => {
  it('BOOL类型使用BOOL验证器', () => {
    const result = validateDefaultValue('BOOL', 'true');
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('TRUE');
  });

  it('INT类型使用INT验证器', () => {
    const result = validateDefaultValue('INT', '42');
    expect(result.isValid).toBe(true);
  });

  it('空dataType时跳过验证', () => {
    const result = validateDefaultValue('', 'anything');
    expect(result.isValid).toBe(true);
  });

  it('INT类型非法值应返回错误', () => {
    const result = validateDefaultValue('INT', 'abc');
    expect(result.isValid).toBe(false);
  });

  it('BOOL类型非法值应返回错误', () => {
    const result = validateDefaultValue('BOOL', 'yes');
    expect(result.isValid).toBe(false);
  });
});

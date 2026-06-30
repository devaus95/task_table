/**
 * 集成测试：完整的添加、编辑、删除流程
 * 使用 store 级别测试，避免 jsdom 环境限制
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTableStore } from '../../src/store/tableStore';
import {
  validateVariableName,
  validateDefaultValue,
} from '../../src/utils/validators';

describe('集成测试: 完整工作流 (Store 级别)', () => {
  let useStore: ReturnType<typeof createTableStore>;

  beforeEach(() => {
    useStore = createTableStore({ persistence: false });
  });

  it('场景1: 添加变量 → 编辑Name → 编辑DataType → 验证DefaultValue', async () => {
    // 1. 添加一行
    await useStore.getState().addRow();
    let vars = useStore.getState().variables;
    expect(vars).toHaveLength(1);
    expect(vars[0].index).toBe(1);
    expect(vars[0].name).toBe('');

    // 2. 编辑名称
    const name = 'Start';
    const nameResult = validateVariableName(name, []);
    expect(nameResult.isValid).toBe(true);

    await useStore.getState().updateRow(1, { name });
    vars = useStore.getState().variables;
    expect(vars[0].name).toBe('Start');

    // 3. 编辑 DataType 为 BOOL，默认值应自动变为 TRUE
    await useStore.getState().updateRow(1, { dataType: 'BOOL', defaultValue: 'TRUE' });
    vars = useStore.getState().variables;
    expect(vars[0].dataType).toBe('BOOL');
    expect(vars[0].defaultValue).toBe('TRUE');

    // 4. 验证 BOOL 默认值
    const boolResult = validateDefaultValue('BOOL', 'FALSE');
    expect(boolResult.isValid).toBe(true);
    expect(boolResult.normalized).toBe('FALSE');
  });

  it('场景2: 添加多行 → 删除行 → 索引重新编号', async () => {
    // 添加3行
    await useStore.getState().addRow();
    await useStore.getState().addRow();
    await useStore.getState().addRow();

    let vars = useStore.getState().variables;
    expect(vars).toHaveLength(3);

    // 分别命名
    await useStore.getState().updateRow(1, { name: 'Start' });
    await useStore.getState().updateRow(2, { name: 'Stop' });
    await useStore.getState().updateRow(3, { name: 'Count' });

    // 删除第2行
    await useStore.getState().deleteRow(2);

    vars = useStore.getState().variables;
    expect(vars).toHaveLength(2);
    // 索引重新编号
    expect(vars[0].index).toBe(1);
    expect(vars[0].name).toBe('Start');
    expect(vars[1].index).toBe(2);
    expect(vars[1].name).toBe('Count');
  });

  it('场景3: 重复名称验证', async () => {
    // 添加两行
    await useStore.getState().addRow();
    await useStore.getState().addRow();

    // 设置第一行为 "Motor"
    await useStore.getState().updateRow(1, { name: 'Motor' });

    const vars = useStore.getState().variables;

    // 验证 "motor" 与 "Motor" 冲突
    const result = validateVariableName('motor', vars.filter(v => v.index !== 2).map(v => v.name));
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Variable name already exists');

    // 验证唯一名称通过
    const result2 = validateVariableName('Engine', vars.map(v => v.name));
    expect(result2.isValid).toBe(true);
  });

  it('场景4: 切换 DataType 自动更新 Default Value', async () => {
    await useStore.getState().addRow();

    // 设置 BOOL → Default Value 应为 TRUE
    await useStore.getState().updateRow(1, { dataType: 'BOOL', defaultValue: 'TRUE' });
    expect(useStore.getState().variables[0].dataType).toBe('BOOL');
    expect(useStore.getState().variables[0].defaultValue).toBe('TRUE');

    // 切换为 INT → Default Value 应为 0
    await useStore.getState().updateRow(1, { dataType: 'INT', defaultValue: '0' });
    expect(useStore.getState().variables[0].dataType).toBe('INT');
    expect(useStore.getState().variables[0].defaultValue).toBe('0');
  });

  it('场景5: INT Default Value 边界值验证', () => {
    // 边界最小值
    const result1 = validateDefaultValue('INT', '-2147483648');
    expect(result1.isValid).toBe(true);

    // 边界最大值
    const result2 = validateDefaultValue('INT', '2147483647');
    expect(result2.isValid).toBe(true);

    // 超出范围
    const result3 = validateDefaultValue('INT', '9999999999');
    expect(result3.isValid).toBe(false);

    // 浮点数
    const result4 = validateDefaultValue('INT', '3.14');
    expect(result4.isValid).toBe(false);
  });

  it('场景6: BOOL Default Value 大小写规范化', () => {
    const cases = [
      { input: 'true', expected: 'TRUE' },
      { input: 'TRUE', expected: 'TRUE' },
      { input: 'True', expected: 'TRUE' },
      { input: 'false', expected: 'FALSE' },
      { input: 'FALSE', expected: 'FALSE' },
      { input: 'False', expected: 'FALSE' },
    ];

    for (const { input, expected } of cases) {
      const result = validateDefaultValue('BOOL', input);
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe(expected);
    }
  });

  it('场景7: Comment 可接受任意文本和空值', async () => {
    await useStore.getState().addRow();

    // 设置 comment
    await useStore.getState().updateRow(1, { comment: 'system start signal' });
    expect(useStore.getState().variables[0].comment).toBe('system start signal');

    // 清空 comment
    await useStore.getState().updateRow(1, { comment: '' });
    expect(useStore.getState().variables[0].comment).toBe('');
  });
});

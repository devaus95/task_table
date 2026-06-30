/**
 * Store 状态管理单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTableStore } from '../../src/store/tableStore';

describe('tableStore', () => {
  // 每个测试用例使用独立的 store 实例（无持久化）
  let useStore: ReturnType<typeof createTableStore>;

  beforeEach(() => {
    useStore = createTableStore({ persistence: false });
  });

  describe('初始状态', () => {
    it('variables 应为空数组', () => {
      const state = useStore.getState();
      expect(state.variables).toEqual([]);
    });

    it('selectedRowIndex 应为 null', () => {
      const state = useStore.getState();
      expect(state.selectedRowIndex).toBeNull();
    });

    it('errors 应为空 Map', () => {
      const state = useStore.getState();
      expect(state.errors.size).toBe(0);
    });

    it('persistence 默认应为 false', () => {
      const state = useStore.getState();
      expect(state.config.persistence).toBe(false);
    });
  });

  describe('addRow', () => {
    it('在空表中添加一行', async () => {
      await useStore.getState().addRow();
      const state = useStore.getState();
      expect(state.variables).toHaveLength(1);
      expect(state.variables[0].index).toBe(1);
    });

    it('新行的所有字段应为空', async () => {
      await useStore.getState().addRow();
      const variable = useStore.getState().variables[0];
      expect(variable.name).toBe('');
      expect(variable.dataType).toBe('');
      expect(variable.defaultValue).toBe('');
      expect(variable.comment).toBe('');
    });

    it('新行应有唯一 id', async () => {
      await useStore.getState().addRow();
      await useStore.getState().addRow();
      const vars = useStore.getState().variables;
      expect(vars[0].id).not.toBe(vars[1].id);
    });

    it('新行 index 为当前最大 index + 1', async () => {
      await useStore.getState().addRow();
      await useStore.getState().addRow();
      await useStore.getState().addRow();
      const vars = useStore.getState().variables;
      expect(vars[0].index).toBe(1);
      expect(vars[1].index).toBe(2);
      expect(vars[2].index).toBe(3);
    });
  });

  describe('deleteRow', () => {
    it('删除行后索引应重新编号', async () => {
      // 添加3行
      await useStore.getState().addRow();
      await useStore.getState().addRow();
      await useStore.getState().addRow();

      // 删除第二行 (index=2)
      await useStore.getState().deleteRow(2);

      const vars = useStore.getState().variables;
      expect(vars).toHaveLength(2);
      expect(vars[0].index).toBe(1);
      expect(vars[1].index).toBe(2);
    });

    it('删除中间行后索引连续', async () => {
      await useStore.getState().addRow();
      await useStore.getState().addRow();
      await useStore.getState().addRow();

      // 删除第一行
      await useStore.getState().deleteRow(1);

      const vars = useStore.getState().variables;
      expect(vars).toHaveLength(2);
      expect(vars[0].index).toBe(1);
      expect(vars[1].index).toBe(2);
    });

    it('删除不存在的行不应报错', async () => {
      await useStore.getState().addRow();
      await useStore.getState().deleteRow(999);
      expect(useStore.getState().variables).toHaveLength(1);
    });
  });

  describe('deleteSelectedRow', () => {
    it('有选中行时删除', async () => {
      await useStore.getState().addRow();
      useStore.getState().setSelectedRowIndex(1);
      await useStore.getState().deleteSelectedRow();

      const state = useStore.getState();
      expect(state.variables).toHaveLength(0);
      expect(state.selectedRowIndex).toBeNull();
    });

    it('无选中行时不做任何操作', async () => {
      await useStore.getState().addRow();
      // selectedRowIndex 为 null
      await useStore.getState().deleteSelectedRow();
      expect(useStore.getState().variables).toHaveLength(1);
    });
  });

  describe('updateRow', () => {
    it('更新指定行的字段', async () => {
      await useStore.getState().addRow();
      await useStore.getState().updateRow(1, { name: 'Start', dataType: 'BOOL' });

      const variable = useStore.getState().variables[0];
      expect(variable.name).toBe('Start');
      expect(variable.dataType).toBe('BOOL');
    });

    it('更新不存在的行不影响其他数据', async () => {
      await useStore.getState().addRow();
      await useStore.getState().updateRow(999, { name: 'Ghost' });

      const variable = useStore.getState().variables[0];
      expect(variable.name).toBe('');
    });
  });

  describe('setError / clearErrors', () => {
    it('设置错误后 errors 包含该错误', () => {
      useStore.getState().setError('name-1', {
        field: 'name',
        message: 'Name cannot be empty',
        rowIndex: 1,
      });

      const state = useStore.getState();
      expect(state.errors.size).toBe(1);
      expect(state.errors.get('name-1')?.message).toBe('Name cannot be empty');
    });

    it('设置 error 为 null 时清除错误', () => {
      useStore.getState().setError('name-1', {
        field: 'name',
        message: 'Name cannot be empty',
        rowIndex: 1,
      });
      useStore.getState().setError('name-1', null);

      expect(useStore.getState().errors.size).toBe(0);
    });

    it('clearErrors 清除所有错误', () => {
      useStore.getState().setError('name-1', { field: 'name', message: 'err1', rowIndex: 1 });
      useStore.getState().setError('name-2', { field: 'name', message: 'err2', rowIndex: 2 });
      useStore.getState().clearErrors();

      expect(useStore.getState().errors.size).toBe(0);
    });
  });

  describe('getNextIndex', () => {
    it('空表返回 1', () => {
      expect(useStore.getState().getNextIndex()).toBe(1);
    });

    it('有数据时返回最大 index + 1', async () => {
      await useStore.getState().addRow();
      await useStore.getState().addRow();
      expect(useStore.getState().getNextIndex()).toBe(3);
    });
  });

  describe('工具方法', () => {
    it('getVariableByIndex 找到存在的变量', async () => {
      await useStore.getState().addRow();
      await useStore.getState().updateRow(1, { name: 'Test' });

      const v = useStore.getState().getVariableByIndex(1);
      expect(v?.name).toBe('Test');
    });

    it('getVariableByIndex 找不到返回 undefined', () => {
      expect(useStore.getState().getVariableByIndex(999)).toBeUndefined();
    });
  });

  describe('persistence 配置', () => {
    it('persistence: true 时 config.persistence 为 true', () => {
      const store = createTableStore({ persistence: true });
      expect(store.getState().config.persistence).toBe(true);
    });

    it('persistence: false 时 config.persistence 为 false', () => {
      const store = createTableStore({ persistence: false });
      expect(store.getState().config.persistence).toBe(false);
    });
  });
});

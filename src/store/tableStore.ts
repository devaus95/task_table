/**
 * 表格状态管理 - Zustand Store
 */

import { create } from 'zustand';
import type { Variable } from '../types/variable';
import type { ValidationError } from '../types/validation';

/**
 * 表格状态接口
 */
interface TableState {
  // 状态数据
  variables: Variable[];
  selectedRowIndex: number | null;
  errors: Map<string, ValidationError>;

  // 基础操作
  setVariables: (variables: Variable[]) => void;
  setSelectedRowIndex: (index: number | null) => void;

  // 行操作
  addRow: () => void;
  deleteRow: (index: number) => void;
  deleteSelectedRow: () => void;
  updateRow: (index: number, updates: Partial<Variable>) => void;

  // 验证操作
  setError: (id: string, error: ValidationError | null) => void;
  clearErrors: () => void;

  // 工具方法
  getNextIndex: () => number;
  getVariableById: (id: string) => Variable | undefined;
  getVariableByIndex: (index: number) => Variable | undefined;
}

/**
 * 生成UUID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 创建表格状态Store
 */
export const useTableStore = create<TableState>((set, get) => ({
  // 初始状态
  variables: [],
  selectedRowIndex: null,
  errors: new Map(),

  // 基础操作
  setVariables: (variables) => set({ variables }),
  setSelectedRowIndex: (index) => set({ selectedRowIndex: index }),

  // 行操作
  addRow: () => {
    const { variables, getNextIndex } = get();
    const newVariable: Variable = {
      id: generateId(),
      index: getNextIndex(),
      name: '',
      dataType: 'INT',
      defaultValue: '0',
      comment: '',
      updatedAt: new Date(),
    };
    set({ variables: [...variables, newVariable] });
  },

  deleteRow: (index) => {
    const { variables } = get();
    set({ variables: variables.filter((v) => v.index !== index) });
  },

  deleteSelectedRow: () => {
    const { selectedRowIndex, deleteRow } = get();
    if (selectedRowIndex !== null) {
      deleteRow(selectedRowIndex);
      set({ selectedRowIndex: null });
    }
  },

  updateRow: (index, updates) => {
    const { variables } = get();
    set({
      variables: variables.map((v) =>
        v.index === index ? { ...v, ...updates, updatedAt: new Date() } : v
      ),
    });
  },

  // 验证操作
  setError: (id, error) => {
    const { errors } = get();
    const newErrors = new Map(errors);
    if (error) {
      newErrors.set(id, error);
    } else {
      newErrors.delete(id);
    }
    set({ errors: newErrors });
  },

  clearErrors: () => set({ errors: new Map() }),

  // 工具方法
  getNextIndex: () => {
    const { variables } = get();
    if (variables.length === 0) return 1;
    return Math.max(...variables.map((v) => v.index)) + 1;
  },

  getVariableById: (id) => {
    return get().variables.find((v) => v.id === id);
  },

  getVariableByIndex: (index) => {
    return get().variables.find((v) => v.index === index);
  },
}));

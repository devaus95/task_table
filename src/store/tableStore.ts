/**
 * 表格状态管理 - Zustand Store
 */

import { create } from 'zustand';
import type { Variable } from '../types/variable';
import type { ValidationError } from '../types/validation';
import { RepositoryFactory } from '../repository/RepositoryFactory';

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
  addRow: () => Promise<void>;
  deleteRow: (index: number) => Promise<void>;
  deleteSelectedRow: () => Promise<void>;
  updateRow: (index: number, updates: Partial<Variable>) => Promise<void>;

  // 验证操作
  setError: (id: string, error: ValidationError | null) => void;
  clearErrors: () => void;

  // 持久化操作
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;

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
 * 创建Repository实例
 */
const repository = RepositoryFactory.createRepository('localStorage');

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

  // 行操作（异步，成功后自动保存到localStorage）
  addRow: async () => {
    const { variables, getNextIndex, saveToStorage } = get();
    const newVariable: Variable = {
      id: generateId(),
      index: getNextIndex(),
      name: '',
      dataType: '', // 默认为空，用户需要选择数据类型
      defaultValue: '', // 默认值为空，用户需要填写
      comment: '',
      updatedAt: new Date(),
    };
    const newVariables = [...variables, newVariable];
    set({ variables: newVariables });
    // 保存到localStorage
    await saveToStorage();
  },

  deleteRow: async (index) => {
    const { variables, saveToStorage } = get();
    // 过滤掉被删除的行，并重新计算后续行的Index
    const filtered = variables.filter((v) => v.index !== index);
    const newVariables = filtered.map((v, i) => ({
      ...v,
      index: i + 1,
    }));
    set({ variables: newVariables });
    // 保存到localStorage
    await saveToStorage();
  },

  deleteSelectedRow: async () => {
    const { selectedRowIndex, deleteRow } = get();
    if (selectedRowIndex !== null) {
      await deleteRow(selectedRowIndex);
      set({ selectedRowIndex: null });
    }
  },

  updateRow: async (index, updates) => {
    const { variables, saveToStorage } = get();
    const newVariables = variables.map((v) =>
      v.index === index ? { ...v, ...updates, updatedAt: new Date() } : v
    );
    set({ variables: newVariables });
    // 保存到localStorage
    await saveToStorage();
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

  // 持久化操作
  loadFromStorage: async () => {
    try {
      const savedVariables = await repository.getAll();
      if (savedVariables.length > 0) {
        set({ variables: savedVariables });
        console.log('Data loaded from localStorage successfully');
      }
    } catch (error) {
      console.error('Failed to load variables:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const { variables } = get();
      await repository.saveAll(variables);
      console.log('Data saved to localStorage successfully');
    } catch (error) {
      console.error('Failed to save variables:', error);
    }
  },

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

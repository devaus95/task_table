/**
 * 表格状态管理 - Zustand Store
 */

import { create } from 'zustand';
import type { Variable } from '../types/variable';
import type { ValidationError } from '../types/validation';
import { RepositoryFactory } from '../repository/RepositoryFactory';

/**
 * Store 配置选项
 */
export interface TableStoreConfig {
  /** 是否启用持久化，默认 false（符合AC1每次打开显示空表） */
  persistence?: boolean;
}

/**
 * 表格状态接口
 */
interface TableState {
  // 配置
  config: TableStoreConfig;

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
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * 创建Repository实例
 */
const repository = RepositoryFactory.createRepository('localStorage');

/**
 * 创建表格状态Store
 */
export const createTableStore = (config: TableStoreConfig = {}) => {
  return create<TableState>((set, get) => ({
    config: { persistence: config.persistence ?? false },

    // 初始状态
    variables: [],
    selectedRowIndex: null,
    errors: new Map(),

    // 基础操作
    setVariables: (variables) => set({ variables }),
    setSelectedRowIndex: (index) => set({ selectedRowIndex: index }),

    // 行操作（持久化受 config.persistence 控制）
    addRow: async () => {
      const { variables, getNextIndex, saveToStorage } = get();
      const newVariable: Variable = {
        id: generateId(),
        index: getNextIndex(),
        name: '',
        dataType: '',
        defaultValue: '',
        comment: '',
        updatedAt: new Date(),
      };
      const newVariables = [...variables, newVariable];
      set({ variables: newVariables });
      if (get().config.persistence) await saveToStorage();
    },

    deleteRow: async (index) => {
      const { variables, saveToStorage } = get();
      const filtered = variables.filter((v) => v.index !== index);
      const newVariables = filtered.map((v, i) => ({
        ...v,
        index: i + 1,
      }));
      set({ variables: newVariables });
      if (get().config.persistence) await saveToStorage();
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
      if (get().config.persistence) await saveToStorage();
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
      if (!get().config.persistence) return;
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
      if (!get().config.persistence) return;
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
};

/**
 * 默认导出：持久化关闭的 store 实例
 */
export const useTableStore = createTableStore();

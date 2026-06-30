/**
 * Repository接口定义
 */

import type { Variable } from './variable';

// 重新导出Variable类型，便于其他模块使用
export type { Variable } from './variable';

/**
 * 变量数据存储接口
 */
export interface IVariableRepository {
  // 基础操作
  getAll(): Promise<Variable[]>;
  getById(id: string): Promise<Variable | null>;
  save(variable: Variable): Promise<void>;
  saveAll(variables: Variable[]): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;

  // 查询操作
  findByName(name: string): Promise<Variable | null>;
  findByIndex(index: number): Promise<Variable | null>;

  // 批量操作（可选）
  batchSave?(variables: Variable[]): Promise<void>;
  batchDelete?(ids: string[]): Promise<void>;

  // 同步操作（预留）
  syncWithRemote?(): Promise<void>;
  getLastSyncTime?(): Promise<Date | null>;
}

/**
 * 存储类型
 */
export type StorageType = 'localStorage' | 'indexedDB' | 'remoteAPI';

/**
 * 存储配置
 */
export interface StorageConfig {
  type: StorageType;
  maxSize?: number;
  syncEnabled?: boolean;
  syncInterval?: number;
}

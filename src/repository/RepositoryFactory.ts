/**
 * Repository工厂模式
 */

import type { IVariableRepository, StorageType } from '../types/repository';
import { LocalStorageRepository } from './LocalStorageRepository';
import { IndexedDBRepository } from './IndexedDBRepository';

/**
 * Repository工厂类
 */
export class RepositoryFactory {
  /**
   * 创建Repository实例
   * @param type 存储类型
   * @returns Repository实例
   */
  static createRepository(type: StorageType = 'localStorage'): IVariableRepository {
    switch (type) {
      case 'localStorage':
        return new LocalStorageRepository();

      case 'indexedDB':
        // 面试Demo场景：返回接口预留的IndexedDBRepository
        // 注意：此实现仅为接口签名，不会真正执行
        return new IndexedDBRepository();

      case 'remoteAPI':
        // 远程API存储（未实现）
        throw new Error('Remote API repository not implemented');

      default:
        return new LocalStorageRepository();
    }
  }

  /**
   * 根据数据量自动选择存储策略
   * @param estimatedSize 预估数据量
   * @returns 推荐的存储类型
   */
  static getRecommendedStorageType(estimatedSize: number): StorageType {
    // 小数据量：localStorage（面试Demo默认选择）
    if (estimatedSize < 100) {
      return 'localStorage';
    }

    // 中等数据量：可考虑IndexedDB
    if (estimatedSize < 1000) {
      return 'localStorage'; // 面试Demo仍使用localStorage
    }

    // 大数据量：建议使用IndexedDB
    return 'indexedDB';
  }
}

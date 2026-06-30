/**
 * 数据持久化Hook
 * 手动触发持久化（在save时调用）
 */

import { useEffect, useCallback } from 'react';
import { useTableStore } from '../store/tableStore';
import { RepositoryFactory } from '../repository/RepositoryFactory';

/**
 * 数据持久化Hook
 * 手动触发保存到localStorage
 */
export function usePersistence() {
  const variables = useTableStore((state) => state.variables);
  const setVariables = useTableStore((state) => state.setVariables);

  // 创建Repository实例（面试Demo使用localStorage）
  const repository = RepositoryFactory.createRepository('localStorage');

  // 加载数据（首次渲染时）
  useEffect(() => {
    const loadVariables = async () => {
      try {
        const savedVariables = await repository.getAll();
        if (savedVariables.length > 0) {
          setVariables(savedVariables);
        }
      } catch (error) {
        console.error('Failed to load variables:', error);
      }
    };

    loadVariables();
  }, [repository, setVariables]);

  // 手动保存数据到localStorage
  const saveToStorage = useCallback(async () => {
    try {
      await repository.saveAll(variables);
      console.log('Data saved to localStorage successfully');
    } catch (error) {
      console.error('Failed to save variables:', error);
    }
  }, [variables, repository]);

  // 手动清除数据
  const clearData = useCallback(async () => {
    try {
      await repository.deleteAll();
      setVariables([]);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }, [repository, setVariables]);

  return {
    saveToStorage,
    clearData,
    repository,
  };
}

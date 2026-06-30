/**
 * 数据持久化Hook
 */

import { useEffect, useCallback } from 'react';
import { useTableStore } from '../store/tableStore';
import { RepositoryFactory } from '../repository/RepositoryFactory';

/**
 * 数据持久化Hook
 * 自动同步表格数据到localStorage
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

  // 保存数据（variables变化时）
  useEffect(() => {
    const saveVariables = async () => {
      try {
        if (variables.length > 0) {
          await repository.saveAll(variables);
        }
      } catch (error) {
        console.error('Failed to save variables:', error);
      }
    };

    // 使用防抖避免频繁保存
    const timeoutId = setTimeout(saveVariables, 500);
    return () => clearTimeout(timeoutId);
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
    clearData,
    repository,
  };
}

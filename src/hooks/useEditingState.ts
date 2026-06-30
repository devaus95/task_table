/**
 * 编辑状态管理 Hook
 * 管理表格单元格的编辑状态
 */

import { useState, useCallback } from 'react';
import type { Variable } from '../types/variable';
import type { ValidationError } from '../types/validation';

/**
 * 编辑单元格接口
 */
export interface EditingCell {
  rowIndex: number | null;
  column: 'name' | 'dataType' | 'defaultValue' | 'comment' | null;
}

/**
 * 临时值存储接口
 */
export interface TempValues {
  [key: string]: string;
}

/**
 * 编辑状态管理 Hook
 */
export const useEditingState = () => {
  // 编辑状态管理
  const [editingCell, setEditingCell] = useState<EditingCell>({
    rowIndex: null,
    column: null,
  });

  // 临时值存储
  const [tempValues, setTempValues] = useState<TempValues>({});

  /**
   * 开始编辑单元格
   */
  const startEditing = useCallback(
    (
      rowIndex: number,
      column: 'name' | 'dataType' | 'defaultValue' | 'comment',
      variables: Variable[],
      setError: (key: string, error: ValidationError | null) => void
    ) => {
      const variable = variables.find((v) => v.index === rowIndex);
      if (!variable) return;

      // 清除之前编辑单元格的错误状态（如果有）
      if (editingCell.rowIndex !== null && editingCell.column !== null) {
        const prevKey = `${editingCell.column}-${editingCell.rowIndex}`;
        setError(prevKey, null);
      }

      // 设置编辑状态
      setEditingCell({ rowIndex, column });

      // 初始化临时值
      const key = `${column}-${rowIndex}`;
      const originalValue =
        column === 'name'
          ? variable.name
          : column === 'defaultValue'
            ? variable.defaultValue
            : column === 'comment'
              ? variable.comment
              : variable.dataType;

      setTempValues((prev) => ({
        ...prev,
        [key]: originalValue,
      }));
    },
    [editingCell]
  );

  /**
   * 取消编辑
   */
  const cancelEditing = useCallback(
    (setError: (key: string, error: ValidationError | null) => void) => {
      if (editingCell.rowIndex === null || editingCell.column === null) return;

      const key = `${editingCell.column}-${editingCell.rowIndex}`;

      // 清除临时值和错误状态
      setTempValues((prev) => {
        const newValues = { ...prev };
        delete newValues[key];
        return newValues;
      });

      setError(key, null);

      // 清除编辑状态
      setEditingCell({ rowIndex: null, column: null });
    },
    [editingCell]
  );

  /**
   * 更新临时值
   */
  const updateTempValue = useCallback((key: string, value: string) => {
    setTempValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * 清除临时值和编辑状态
   */
  const clearTempValueAndEditing = useCallback((key: string) => {
    setTempValues((prev) => {
      const newValues = { ...prev };
      delete newValues[key];
      return newValues;
    });
    setEditingCell({ rowIndex: null, column: null });
  }, []);

  return {
    editingCell,
    tempValues,
    startEditing,
    cancelEditing,
    updateTempValue,
    clearTempValueAndEditing,
  };
};

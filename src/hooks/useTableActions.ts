/**
 * 表格操作 Hook
 * 管理表格的各种操作函数
 */

import { useCallback } from 'react';
import { message } from 'antd';
import type { Variable } from '../types/variable';
import type { TempValues } from './useEditingState';
import { validateVariableName, validateDefaultValue } from '../utils/validators';
import type { SimpleValidationResult, ValidationError } from '../types/validation';

/**
 * 表格操作 Hook 参数接口
 */
export interface UseTableActionsParams {
  variables: Variable[];
  tempValues: TempValues;
  updateRow: (index: number, updates: Partial<Variable>) => Promise<void>;
  setError: (key: string, error: ValidationError | null) => void;
  addRow: () => Promise<void>;
  deleteSelectedRow: () => Promise<void>;
  selectedRowIndex: number | null;
  clearTempValueAndEditing: (key: string) => void;
  cancelEditing: () => void;
  updateTempValue: (key: string, value: string) => void;
}

/**
 * 表格操作 Hook 返回值接口
 */
export interface UseTableActionsReturn {
  validateAndSaveName: (rowIndex: number) => Promise<boolean>;
  validateAndSaveDefaultValue: (rowIndex: number) => Promise<boolean>;
  saveComment: (rowIndex: number) => Promise<void>;
  saveDataType: (rowIndex: number, newDataType: 'BOOL' | 'INT') => Promise<void>;
  handleAddRow: () => Promise<void>;
  handleDeleteRow: () => Promise<void>;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    column: 'name' | 'defaultValue' | 'comment'
  ) => void;
}

/**
 * 表格操作 Hook
 */
export const useTableActions = (params: UseTableActionsParams): UseTableActionsReturn => {
  const {
    variables,
    tempValues,
    updateRow,
    setError,
    addRow,
    deleteSelectedRow,
    selectedRowIndex,
    clearTempValueAndEditing,
    cancelEditing,
    updateTempValue,
  } = params;

  /**
   * 验证并保存Name
   */
  const validateAndSaveName = useCallback(
    async (rowIndex: number) => {
      const key = `name-${rowIndex}`;
      const newName = tempValues[key];

      if (newName === undefined) return false;

      const variable = variables.find((v) => v.index === rowIndex);
      if (!variable) return false;

      // 获取其他变量的名称列表
      const otherNames = variables.filter((v) => v.index !== rowIndex).map((v) => v.name);

      // 验证
      const result: SimpleValidationResult = validateVariableName(newName, otherNames);

      if (!result.isValid) {
        // 验证失败：设置错误提示 + 恢复原始值，保留编辑状态让用户看到错误
        setError(key, {
          field: 'name',
          message: result.error || 'Invalid name',
          rowIndex,
        });
        updateTempValue(key, variable.name);
        return false;
      }

      // 保存
      setError(key, null);
      await updateRow(rowIndex, { name: newName.trim() });

      // 清除临时值和编辑状态
      clearTempValueAndEditing(key);

      return true;
    },
    [variables, tempValues, updateRow, updateTempValue, setError, clearTempValueAndEditing]
  );

  /**
   * 验证并保存DefaultValue
   */
  const validateAndSaveDefaultValue = useCallback(
    async (rowIndex: number) => {
      const key = `defaultValue-${rowIndex}`;
      const newValue = tempValues[key];

      if (newValue === undefined) return false;

      const variable = variables.find((v) => v.index === rowIndex);
      if (!variable) return false;

      // 验证
      const result = validateDefaultValue(variable.dataType, newValue);

      if (!result.isValid) {
        // 验证失败：设置错误提示 + 恢复原始值，保留编辑状态让用户看到错误
        setError(key, {
          field: 'defaultValue',
          message: result.error || 'Invalid value',
          rowIndex,
        });
        updateTempValue(key, variable.defaultValue);
        return false;
      }

      // 保存
      setError(key, null);
      await updateRow(rowIndex, {
        defaultValue: result.normalized || newValue.trim(),
      });

      // 清除临时值和编辑状态
      clearTempValueAndEditing(key);

      return true;
    },
    [variables, tempValues, updateRow, updateTempValue, setError, clearTempValueAndEditing]
  );

  /**
   * 保存Comment
   */
  const saveComment = useCallback(
    async (rowIndex: number) => {
      const key = `comment-${rowIndex}`;
      const newComment = tempValues[key];

      if (newComment === undefined) return;

      // 保存（无需验证）
      await updateRow(rowIndex, { comment: newComment });

      // 清除临时值和编辑状态
      clearTempValueAndEditing(key);
    },
    [tempValues, updateRow, clearTempValueAndEditing]
  );

  /**
   * 保存DataType
   */
  const saveDataType = useCallback(
    async (rowIndex: number, newDataType: 'BOOL' | 'INT') => {
      // 更新数据类型和默认值
      const newDefaultValue = newDataType === 'BOOL' ? 'TRUE' : '0';
      await updateRow(rowIndex, { dataType: newDataType, defaultValue: newDefaultValue });

      // 清除默认值的错误
      setError(`defaultValue-${rowIndex}`, null);

      // 清除编辑状态
      clearTempValueAndEditing(`dataType-${rowIndex}`);
    },
    [updateRow, setError, clearTempValueAndEditing]
  );

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      rowIndex: number,
      column: 'name' | 'defaultValue' | 'comment'
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (column === 'name') {
          validateAndSaveName(rowIndex);
        } else if (column === 'defaultValue') {
          validateAndSaveDefaultValue(rowIndex);
        } else if (column === 'comment') {
          saveComment(rowIndex);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEditing();
      }
    },
    [validateAndSaveName, validateAndSaveDefaultValue, saveComment, cancelEditing]
  );

  /**
   * 添加新行
   */
  const handleAddRow = useCallback(async () => {
    await addRow();
  }, [addRow]);

  /**
   * 删除选中的行
   */
  const handleDeleteRow = useCallback(async () => {
    if (selectedRowIndex === null) {
      message.warning('Please select a row to delete');
      return;
    }
    await deleteSelectedRow();
  }, [selectedRowIndex, deleteSelectedRow]);

  return {
    validateAndSaveName,
    validateAndSaveDefaultValue,
    saveComment,
    saveDataType,
    handleAddRow,
    handleDeleteRow,
    handleKeyDown,
  };
};

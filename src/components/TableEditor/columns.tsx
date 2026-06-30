/**
 * 表格列定义
 * 定义TableEditor的列配置
 */

import React, { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { Variable } from '../../types/variable';
import type { EditingCell, TempValues } from '../../hooks/useEditingState';
import type { ValidationError } from '../../types/validation';
import { EditableCell } from './components/EditableCell';
import { DataTypeCell } from './components/DataTypeCell';

/**
 * 列配置参数接口
 */
export interface ColumnsConfigParams {
  editingCell: EditingCell;
  tempValues: TempValues;
  errors: Map<string, ValidationError>;
  startEditing: (
    rowIndex: number,
    column: 'name' | 'dataType' | 'defaultValue' | 'comment'
  ) => void;
  updateTempValue: (key: string, value: string) => void;
  validateAndSaveName: (rowIndex: number) => Promise<boolean>;
  validateAndSaveDefaultValue: (rowIndex: number) => Promise<boolean>;
  saveComment: (rowIndex: number) => Promise<void>;
  saveDataType: (rowIndex: number, newDataType: 'BOOL' | 'INT') => Promise<void>;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    column: 'name' | 'defaultValue' | 'comment'
  ) => void;
  cancelEditing: () => void;
}

/**
 * 生成表格列配置
 */
export const useColumns = (params: ColumnsConfigParams): ColumnsType<Variable> => {
  const {
    editingCell,
    tempValues,
    errors,
    startEditing,
    updateTempValue,
    validateAndSaveName,
    validateAndSaveDefaultValue,
    saveComment,
    saveDataType,
    handleKeyDown,
    cancelEditing,
  } = params;

  return useMemo(
    () => [
      {
        title: 'Index',
        dataIndex: 'index',
        key: 'index',
        width: 80,
        align: 'center' as const,
        render: (text: number) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (text: string, record: Variable) => {
          const isEditing = editingCell.rowIndex === record.index && editingCell.column === 'name';
          const error = errors.get(`name-${record.index}`) || null;
          const tempValue = tempValues[`name-${record.index}`];

          return (
            <EditableCell
              value={text}
              tempValue={tempValue}
              isEditing={isEditing}
              error={error}
              placeholder="Enter variable name"
              onChange={(value) => updateTempValue(`name-${record.index}`, value)}
              onBlur={() => {
                // 如果当前已有错误，blur时清除错误并退出编辑
                if (error) {
                  cancelEditing();
                } else {
                  validateAndSaveName(record.index);
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, record.index, 'name')}
              onClick={() => startEditing(record.index, 'name')}
            />
          );
        },
      },
      {
        title: 'Data Type',
        dataIndex: 'dataType',
        key: 'dataType',
        width: 150,
        render: (text: string, record: Variable) => {
          const isEditing =
            editingCell.rowIndex === record.index && editingCell.column === 'dataType';

          return (
            <DataTypeCell
              value={text as '' | 'BOOL' | 'INT'}
              isEditing={isEditing}
              onChange={(value) => saveDataType(record.index, value)}
              onBlur={cancelEditing}
              onDoubleClick={() => startEditing(record.index, 'dataType')}
            />
          );
        },
      },
      {
        title: 'Default Value',
        dataIndex: 'defaultValue',
        key: 'defaultValue',
        width: 150,
        render: (text: string, record: Variable) => {
          const isEditing =
            editingCell.rowIndex === record.index && editingCell.column === 'defaultValue';
          const error = errors.get(`defaultValue-${record.index}`) || null;
          const tempValue = tempValues[`defaultValue-${record.index}`];
          const hasDataType = !!record.dataType;

          return (
            <EditableCell
              value={text}
              tempValue={tempValue}
              isEditing={isEditing}
              error={error}
              placeholder={
                !hasDataType
                  ? 'Select data type first'
                  : record.dataType === 'BOOL'
                    ? 'true/false'
                    : 'Enter integer'
              }
              onChange={(value) => updateTempValue(`defaultValue-${record.index}`, value)}
              onBlur={() => {
                if (error) {
                  cancelEditing();
                } else {
                  validateAndSaveDefaultValue(record.index);
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, record.index, 'defaultValue')}
              onClick={() => {
                if (hasDataType) {
                  startEditing(record.index, 'defaultValue');
                }
              }}
            />
          );
        },
      },
      {
        title: 'Comment',
        dataIndex: 'comment',
        key: 'comment',
        width: 250,
        render: (text: string, record: Variable) => {
          const isEditing =
            editingCell.rowIndex === record.index && editingCell.column === 'comment';
          const tempValue = tempValues[`comment-${record.index}`];

          return (
            <EditableCell
              value={text}
              tempValue={tempValue}
              isEditing={isEditing}
              error={null}
              placeholder="Enter comment (optional)"
              onChange={(value) => updateTempValue(`comment-${record.index}`, value)}
              onBlur={() => saveComment(record.index)}
              onKeyDown={(e) => handleKeyDown(e, record.index, 'comment')}
              onClick={() => startEditing(record.index, 'comment')}
            />
          );
        },
      },
    ],
    [
      editingCell,
      errors,
      tempValues,
      startEditing,
      updateTempValue,
      validateAndSaveName,
      validateAndSaveDefaultValue,
      saveComment,
      saveDataType,
      handleKeyDown,
      cancelEditing,
    ]
  );
};

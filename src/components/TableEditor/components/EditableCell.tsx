/**
 * 可编辑单元格组件
 * 用于渲染可编辑的文本输入框
 */

import React from 'react';
import { Input, Tooltip } from 'antd';
import type { ValidationError } from '../../../types/validation';

/**
 * 可编辑单元格属性接口
 */
export interface EditableCellProps {
  value: string;
  tempValue: string | undefined;
  isEditing: boolean;
  error: ValidationError | null;
  placeholder: string;
  hasGlobalError: boolean; // 表格中是否有其他单元格处于错误编辑态
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick: () => void;
  onDismissError?: () => void; // 关闭全局错误编辑态
}

/**
 * 可编辑单元格组件
 */
export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  tempValue,
  isEditing,
  error,
  placeholder,
  hasGlobalError,
  onChange,
  onBlur,
  onKeyDown,
  onClick,
  onDismissError,
}) => {
  const hasError = !!error;

  // 编辑态
  if (isEditing) {
    const inputElement = (
      <Input
        value={tempValue !== undefined ? tempValue : value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        status={hasError ? 'error' : undefined}
        autoFocus
        size="small"
        className={hasError ? 'error-cell' : ''}
      />
    );

    // 如果有错误，用Tooltip包裹
    if (hasError && error) {
      return (
        <Tooltip title={error.message} open={hasError} placement="top" color="#ff4d4f">
          {inputElement}
        </Tooltip>
      );
    }

    return inputElement;
  }

  // 展示态：如果全局有错误，onMouseDown 拦截并关闭错误（阻止新 input 抢焦点）
  // 下一次点击才正常进入编辑态
  const handleMouseDown = (e: React.MouseEvent) => {
    if (hasGlobalError && onDismissError) {
      e.preventDefault();
      onDismissError();
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={hasGlobalError ? undefined : onClick}
      style={{ cursor: 'pointer', minHeight: '24px', lineHeight: '24px' }}
    >
      {value || <span style={{ color: '#bfbfbf' }}>{placeholder}</span>}
    </div>
  );
};

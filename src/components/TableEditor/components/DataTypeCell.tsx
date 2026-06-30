/**
 * 数据类型单元格组件
 * 用于渲染数据类型选择器
 */

import React from 'react';
import { Select } from 'antd';

/**
 * 数据类型单元格属性接口
 */
export interface DataTypeCellProps {
  value: '' | 'BOOL' | 'INT';
  isEditing: boolean;
  hasGlobalError: boolean;
  onChange: (value: 'BOOL' | 'INT') => void;
  onBlur: () => void;
  onDoubleClick: () => void;
  onDismissError?: () => void;
}

/**
 * 数据类型单元格组件
 */
export const DataTypeCell: React.FC<DataTypeCellProps> = ({
  value,
  isEditing,
  hasGlobalError,
  onChange,
  onBlur,
  onDoubleClick,
  onDismissError,
}) => {
  // 编辑态
  if (isEditing) {
    return (
      <Select
        value={value}
        onChange={(value) => {
          if (value === 'BOOL' || value === 'INT') {
            onChange(value);
          }
        }}
        onBlur={onBlur}
        style={{ width: '100%' }}
        size="small"
        autoFocus
        open
        options={[
          { value: 'BOOL', label: 'BOOL' },
          { value: 'INT', label: 'INT' },
        ]}
      />
    );
  }

  // 展示态：如果全局有错误，onMouseDown 拦截并关闭错误（阻止 Select 抢焦点）
  // 下一次双击才正常进入编辑态
  const handleMouseDown = (e: React.MouseEvent) => {
    if (hasGlobalError && onDismissError) {
      e.preventDefault();
      onDismissError();
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={hasGlobalError ? undefined : onDoubleClick}
      style={{ cursor: 'pointer', minHeight: '24px', lineHeight: '24px' }}
    >
      {value || <span style={{ color: '#bfbfbf' }}>Select data type</span>}
    </div>
  );
};

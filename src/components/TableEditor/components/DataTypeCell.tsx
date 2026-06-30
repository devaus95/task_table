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
  onChange: (value: 'BOOL' | 'INT') => void;
  onBlur: () => void;
  onDoubleClick: () => void;
}

/**
 * 数据类型单元格组件
 */
export const DataTypeCell: React.FC<DataTypeCellProps> = ({
  value,
  isEditing,
  onChange,
  onBlur,
  onDoubleClick,
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

  // 展示态
  return (
    <div
      onDoubleClick={onDoubleClick}
      style={{ cursor: 'pointer', minHeight: '24px', lineHeight: '24px' }}
    >
      {value || <span style={{ color: '#bfbfbf' }}>Select data type</span>}
    </div>
  );
};

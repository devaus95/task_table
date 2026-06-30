/**
 * TableEditor 主组件
 * 实现变量表编辑功能
 */

import React, { useCallback, useMemo } from 'react';
import { Table, Button, Space, Input, Select, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Variable } from '../../types/variable';
import { useTableStore } from '../../store/tableStore';
import { usePersistence } from '../../hooks/usePersistence';
import { validateVariableName, validateDefaultValue } from '../../utils/validators';
import type { SimpleValidationResult } from '../../types/validation';
import './index.css';

const { Option } = Select;

/**
 * TableEditor 组件
 */
export const TableEditor: React.FC = () => {
  // 从store获取状态和方法
  const variables = useTableStore((state) => state.variables);
  const selectedRowIndex = useTableStore((state) => state.selectedRowIndex);
  const errors = useTableStore((state) => state.errors);
  const addRow = useTableStore((state) => state.addRow);
  const deleteSelectedRow = useTableStore((state) => state.deleteSelectedRow);
  const updateRow = useTableStore((state) => state.updateRow);
  const setSelectedRowIndex = useTableStore((state) => state.setSelectedRowIndex);
  const setError = useTableStore((state) => state.setError);

  // 使用持久化Hook
  usePersistence();

  /**
   * 验证并更新变量名称
   */
  const handleNameChange = useCallback(
    (index: number, newName: string) => {
      const variable = variables.find((v) => v.index === index);
      if (!variable) return;

      // 获取其他变量的名称列表（排除当前变量）
      const otherNames = variables.filter((v) => v.index !== index).map((v) => v.name);

      // 验证名称
      const result: SimpleValidationResult = validateVariableName(newName, otherNames);

      if (!result.isValid) {
        // 显示错误
        setError(`name-${index}`, {
          field: 'name',
          message: result.error || 'Invalid name',
          rowIndex: index,
        });
        message.error(result.error);
        // 恢复原值
        return;
      }

      // 清除错误
      setError(`name-${index}`, null);

      // 更新名称
      updateRow(index, { name: newName.trim() });
    },
    [variables, updateRow, setError]
  );

  /**
   * 验证并更新数据类型
   */
  const handleDataTypeChange = useCallback(
    (index: number, newDataType: 'BOOL' | 'INT') => {
      const variable = variables.find((v) => v.index === index);
      if (!variable) return;

      // 更新数据类型和默认值
      const newDefaultValue = newDataType === 'BOOL' ? 'TRUE' : '0';
      updateRow(index, { dataType: newDataType, defaultValue: newDefaultValue });

      // 清除默认值的错误
      setError(`defaultValue-${index}`, null);
    },
    [variables, updateRow, setError]
  );

  /**
   * 验证并更新默认值
   */
  const handleDefaultValueChange = useCallback(
    (index: number, newValue: string) => {
      const variable = variables.find((v) => v.index === index);
      if (!variable) return;

      // 验证默认值
      const result = validateDefaultValue(variable.dataType, newValue);

      if (!result.isValid) {
        // 显示错误
        setError(`defaultValue-${index}`, {
          field: 'defaultValue',
          message: result.error || 'Invalid value',
          rowIndex: index,
        });
        message.error(result.error);
        return;
      }

      // 清除错误
      setError(`defaultValue-${index}`, null);

      // 更新默认值（BOOL类型需要规范化）
      updateRow(index, {
        defaultValue: result.normalized || newValue.trim(),
      });
    },
    [variables, updateRow, setError]
  );

  /**
   * 更新注释
   */
  const handleCommentChange = useCallback(
    (index: number, newComment: string) => {
      updateRow(index, { comment: newComment });
    },
    [updateRow]
  );

  /**
   * 表格列定义
   */
  const columns: ColumnsType<Variable> = useMemo(
    () => [
      {
        title: 'Index',
        dataIndex: 'index',
        key: 'index',
        width: 80,
        align: 'center',
        render: (text: number) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (text: string, record: Variable) => (
          <Input
            value={text}
            placeholder="Enter variable name"
            onChange={(e) => handleNameChange(record.index, e.target.value)}
            onBlur={(e) => handleNameChange(record.index, e.target.value)}
            status={errors.has(`name-${record.index}`) ? 'error' : undefined}
          />
        ),
      },
      {
        title: 'Data Type',
        dataIndex: 'dataType',
        key: 'dataType',
        width: 150,
        render: (text: 'BOOL' | 'INT', record: Variable) => (
          <Select
            value={text}
            onChange={(value) => handleDataTypeChange(record.index, value as 'BOOL' | 'INT')}
            style={{ width: '100%' }}
          >
            <Option value="BOOL">BOOL</Option>
            <Option value="INT">INT</Option>
          </Select>
        ),
      },
      {
        title: 'Default Value',
        dataIndex: 'defaultValue',
        key: 'defaultValue',
        width: 150,
        render: (text: string, record: Variable) => (
          <Input
            value={text}
            placeholder={record.dataType === 'BOOL' ? 'true/false' : 'Enter integer'}
            onChange={(e) => handleDefaultValueChange(record.index, e.target.value)}
            onBlur={(e) => handleDefaultValueChange(record.index, e.target.value)}
            status={errors.has(`defaultValue-${record.index}`) ? 'error' : undefined}
          />
        ),
      },
      {
        title: 'Comment',
        dataIndex: 'comment',
        key: 'comment',
        width: 250,
        render: (text: string, record: Variable) => (
          <Input
            value={text}
            placeholder="Enter comment (optional)"
            onChange={(e) => handleCommentChange(record.index, e.target.value)}
          />
        ),
      },
    ],
    [errors, handleNameChange, handleDataTypeChange, handleDefaultValueChange, handleCommentChange]
  );

  /**
   * 行选择配置
   */
  const rowSelection = {
    selectedRowKeys: selectedRowIndex !== null ? [selectedRowIndex] : [],
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowIndex(selectedRowKeys.length > 0 ? (selectedRowKeys[0] as number) : null);
    },
    type: 'radio' as const,
  };

  /**
   * 添加新行
   */
  const handleAddRow = useCallback(() => {
    addRow();
  }, [addRow]);

  /**
   * 删除选中的行
   */
  const handleDeleteRow = useCallback(() => {
    if (selectedRowIndex === null) {
      message.warning('Please select a row to delete');
      return;
    }
    deleteSelectedRow();
    message.success('Row deleted');
  }, [selectedRowIndex, deleteSelectedRow]);

  return (
    <div className="table-editor">
      <div className="table-toolbar">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRow}>
            Add Row
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDeleteRow}
            disabled={selectedRowIndex === null}
          >
            Delete Row
          </Button>
        </Space>
      </div>

      <Table<Variable>
        columns={columns}
        dataSource={variables}
        rowKey="index"
        rowSelection={rowSelection}
        pagination={false}
        scroll={{ y: 500 }}
        locale={{
          emptyText: 'No data, click "Add Row" to add variables',
        }}
      />
    </div>
  );
};

export default TableEditor;

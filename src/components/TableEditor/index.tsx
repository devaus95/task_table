/**
 * TableEditor 主组件
 * 实现变量表编辑功能
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Table, Button, Space, Input, Select, message, Typography, Card, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Variable } from '../../types/variable';
import { useTableStore } from '../../store/tableStore';
import { usePersistence } from '../../hooks/usePersistence';
import { validateVariableName, validateDefaultValue } from '../../utils/validators';
import type { SimpleValidationResult } from '../../types/validation';
import './index.css';

const { Option } = Select;
const { Title } = Typography;

/**
 * 编辑状态接口
 */
interface EditingValues {
  name?: string;
  defaultValue?: string;
}

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

  // 临时编辑状态（存储用户正在输入的值）
  const [editingValues, setEditingValues] = useState<Map<number, EditingValues>>(new Map());

  /**
   * 开始编辑：存储临时值
   */
  const startEditing = useCallback(
    (index: number, field: 'name' | 'defaultValue', value: string) => {
      setEditingValues((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(index) || {};
        newMap.set(index, { ...current, [field]: value });
        return newMap;
      });
    },
    []
  );

  /**
   * 验证并更新变量名称（onBlur时）
   */
  const validateAndUpdateName = useCallback(
    (index: number) => {
      const editingValue = editingValues.get(index);
      if (!editingValue || editingValue.name === undefined) return;

      const newName = editingValue.name;
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
        // 不更新，保留编辑状态让用户修改
        return;
      }

      // 清除错误
      setError(`name-${index}`, null);

      // 更新名称
      updateRow(index, { name: newName.trim() });

      // 清除编辑状态
      setEditingValues((prev) => {
        const newMap = new Map(prev);
        newMap.delete(index);
        return newMap;
      });

      message.success('Name updated');
    },
    [variables, editingValues, updateRow, setError]
  );

  /**
   * 验证并更新默认值（onBlur时）
   */
  const validateAndUpdateDefaultValue = useCallback(
    (index: number) => {
      const editingValue = editingValues.get(index);
      if (!editingValue || editingValue.defaultValue === undefined) return;

      const newValue = editingValue.defaultValue;
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
        // 不更新，保留编辑状态让用户修改
        return;
      }

      // 清除错误
      setError(`defaultValue-${index}`, null);

      // 更新默认值（BOOL类型需要规范化）
      updateRow(index, {
        defaultValue: result.normalized || newValue.trim(),
      });

      // 清除编辑状态
      setEditingValues((prev) => {
        const newMap = new Map(prev);
        newMap.delete(index);
        return newMap;
      });

      message.success('Default value updated');
    },
    [variables, editingValues, updateRow, setError]
  );

  /**
   * 更新数据类型
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

      message.success('Data type updated');
    },
    [variables, updateRow, setError]
  );

  /**
   * 更新注释（直接更新，无需验证）
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
        render: (text: string, record: Variable) => {
          const editingValue = editingValues.get(record.index);
          const displayValue = editingValue?.name !== undefined ? editingValue.name : text;
          const hasError = errors.has(`name-${record.index}`);

          return (
            <Input
              value={displayValue}
              placeholder="Enter variable name"
              onChange={(e) => startEditing(record.index, 'name', e.target.value)}
              onBlur={() => validateAndUpdateName(record.index)}
              status={hasError ? 'error' : undefined}
              autoFocus={editingValue?.name !== undefined}
            />
          );
        },
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
        render: (text: string, record: Variable) => {
          const editingValue = editingValues.get(record.index);
          const displayValue =
            editingValue?.defaultValue !== undefined ? editingValue.defaultValue : text;
          const hasError = errors.has(`defaultValue-${record.index}`);

          return (
            <Input
              value={displayValue}
              placeholder={record.dataType === 'BOOL' ? 'true/false' : 'Enter integer'}
              onChange={(e) => startEditing(record.index, 'defaultValue', e.target.value)}
              onBlur={() => validateAndUpdateDefaultValue(record.index)}
              status={hasError ? 'error' : undefined}
            />
          );
        },
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
    [
      editingValues,
      errors,
      startEditing,
      validateAndUpdateName,
      validateAndUpdateDefaultValue,
      handleDataTypeChange,
      handleCommentChange,
    ]
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
    message.success('New row added');
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
    <Card className="table-editor-card">
      {/* 表格标题 */}
      <div className="table-header">
        <Title level={3} style={{ margin: 0 }}>
          Variable Table Editor
        </Title>
        <div className="table-description">
          Edit and manage variables for TIA Portal configuration
        </div>
      </div>

      <Divider />

      {/* 操作按钮区域 */}
      <div className="table-toolbar">
        <Space size="middle">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRow} size="large">
            Add Row
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDeleteRow}
            disabled={selectedRowIndex === null}
            size="large"
          >
            Delete Row
          </Button>
          <Button
            icon={<SaveOutlined />}
            onClick={() => message.success('Data automatically saved to localStorage')}
            size="large"
          >
            Auto Saved
          </Button>
        </Space>
        <div className="toolbar-info">
          <span>Total: {variables.length} variables</span>
        </div>
      </div>

      <Divider />

      {/* 表格区域 */}
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
        bordered
        size="middle"
      />
    </Card>
  );
};

export default TableEditor;

/**
 * TableEditor 主组件
 * 实现变量表编辑功能
 */

import React, { useEffect, useCallback, useRef, useLayoutEffect, useState } from 'react';
import { Table, Button, Space, Typography, Card, Tooltip, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTableStore } from '../../store/tableStore';
import { useEditingState } from '../../hooks/useEditingState';
import { useTableActions } from '../../hooks/useTableActions';
import { useColumns } from './columns';
import './index.less';

const { Title } = Typography;

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
  const loadFromStorage = useTableStore((state) => state.loadFromStorage);

  // 动态计算表格滚动高度
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [tableScrollY, setTableScrollY] = useState(400);

  useLayoutEffect(() => {
    const calcHeight = () => {
      if (!wrapperRef.current) return;
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const available = wrapperRect.height - 50;
      if (available > 0) setTableScrollY(available);
    };
    calcHeight();
    const observer = new ResizeObserver(calcHeight);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    window.addEventListener('resize', calcHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calcHeight);
    };
  }, []);

  // 初始化时从localStorage加载数据
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // 使用编辑状态管理hook
  const {
    editingCell,
    tempValues,
    startEditing: startEditingBase,
    cancelEditing: cancelEditingBase,
    updateTempValue,
    clearTempValueAndEditing,
  } = useEditingState();

  // 包装startEditing函数以符合原始接口
  const startEditing = useCallback(
    (rowIndex: number, column: 'name' | 'dataType' | 'defaultValue' | 'comment') => {
      startEditingBase(rowIndex, column, variables, setError);
    },
    [startEditingBase, variables, setError]
  );

  // 包装cancelEditing函数以符合原始接口
  const cancelEditing = useCallback(() => {
    cancelEditingBase(setError);
  }, [cancelEditingBase, setError]);

  // 使用表格操作hook
  const {
    validateAndSaveName,
    validateAndSaveDefaultValue,
    saveComment,
    saveDataType,
    handleAddRow,
    handleDeleteRow,
    handleKeyDown,
  } = useTableActions({
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
  });

  // 使用列配置hook
  const columns = useColumns({
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
  });

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

      <Divider style={{ margin: '10px 0' }}/>
      {/* 操作按钮区域 */}
      <div className="table-toolbar">
        <Space size="small">
          <Tooltip title="Add a new row at the end of the table">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRow} size="middle">
              Add Row
            </Button>
          </Tooltip>
          <Tooltip
            title={
              selectedRowIndex === null ? 'Select a row first to delete' : 'Delete the selected row'
            }
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteRow}
              disabled={selectedRowIndex === null}
              size="middle"
            >
              Delete Row
            </Button>
          </Tooltip>
        </Space>
        <div className="toolbar-info">
          <span>Total: {variables.length} variables</span>
        </div>
      </div>

      {/* 表格区域 */}
      <div ref={wrapperRef} className="table-wrapper">
        <Table
          columns={columns}
          dataSource={variables}
          rowKey="index"
          rowSelection={rowSelection}
          pagination={false}
          scroll={{ y: tableScrollY }}
          locale={{
            emptyText: 'No data, click "Add Row" to add variables',
          }}
          bordered
          size="small"
        />
      </div>
    </Card>
  );
};

export default TableEditor;

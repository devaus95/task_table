/**
 * TableEditor 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TableEditor } from '../../src/components/TableEditor';
import { useTableStore } from '../../src/store/tableStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('TableEditor 组件', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // 重置 store 状态，确保每个测试从空表开始
    useTableStore.setState({
      variables: [],
      selectedRowIndex: null,
      errors: new Map(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('AC1: 表格展示', () => {
    it('应渲染表格标题', () => {
      render(<TableEditor />);
      expect(screen.getByText('Variable Table Editor')).toBeInTheDocument();
    });

    it('应显示所有列标题', () => {
      render(<TableEditor />);
      // antd Table 的 scroll.y 会创建隐藏 colgroup 导致列标题出现两次
      // 使用 getAllByText 并检查至少有一个
      const indexElements = screen.getAllByText('Index');
      expect(indexElements.length).toBeGreaterThanOrEqual(1);
      const nameElements = screen.getAllByText('Name');
      expect(nameElements.length).toBeGreaterThanOrEqual(1);
      const dataTypeElements = screen.getAllByText('Data Type');
      expect(dataTypeElements.length).toBeGreaterThanOrEqual(1);
      const defaultElements = screen.getAllByText('Default Value');
      expect(defaultElements.length).toBeGreaterThanOrEqual(1);
      const commentElements = screen.getAllByText('Comment');
      expect(commentElements.length).toBeGreaterThanOrEqual(1);
    });

    it('应显示 Add Row 和 Delete Row 按钮', () => {
      render(<TableEditor />);
      expect(screen.getByText('Add Row')).toBeInTheDocument();
      expect(screen.getByText('Delete Row')).toBeInTheDocument();
    });

    it('应显示空状态提示', () => {
      render(<TableEditor />);
      expect(screen.getByText('No data, click "Add Row" to add variables')).toBeInTheDocument();
    });

    it('Delete Row 按钮初始应为禁用状态', () => {
      render(<TableEditor />);
      const deleteBtn = screen.getByText('Delete Row');
      expect(deleteBtn.closest('button')).toBeDisabled();
    });
  });

  describe('AC2: 添加行', () => {
    it('点击 Add Row 应新增一行', async () => {
      const user = userEvent.setup();
      render(<TableEditor />);

      await user.click(screen.getByText('Add Row'));

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('新增多行应显示正确的索引', async () => {
      const user = userEvent.setup();
      render(<TableEditor />);

      await user.click(screen.getByText('Add Row'));
      await user.click(screen.getByText('Add Row'));
      await user.click(screen.getByText('Add Row'));

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('新增行后应显示变量总数', async () => {
      const user = userEvent.setup();
      render(<TableEditor />);

      await user.click(screen.getByText('Add Row'));
      await user.click(screen.getByText('Add Row'));

      await waitFor(() => {
        expect(screen.getByText('Total: 2 variables')).toBeInTheDocument();
      });
    });
  });

  describe('AC3: 删除行', () => {
    it('删除选中行后应重新编号', async () => {
      const user = userEvent.setup();
      render(<TableEditor />);

      // 添加3行
      await user.click(screen.getByText('Add Row'));
      await user.click(screen.getByText('Add Row'));
      await user.click(screen.getByText('Add Row'));

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });

      // 选中第二行的 radio
      const radios = document.querySelectorAll('.ant-radio-input');
      expect(radios.length).toBeGreaterThanOrEqual(3);
      await user.click(radios[1]); // 选中 index=2 的行

      // 删除
      await user.click(screen.getByText('Delete Row'));

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.queryByText('3')).not.toBeInTheDocument();
      });
    });
  });
});

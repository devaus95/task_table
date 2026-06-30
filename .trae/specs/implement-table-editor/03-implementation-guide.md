# Table Editor 实施指导文档

## 文档定位

本文档为Table Editor项目的实施阶段提供详细的技术指导，包括：
- 核心类型定义和代码示例
- 开发规范和最佳实践
- 性能优化策略
- 测试策略和方法
- 部署和构建配置

**相关文档：**
- [01-项目规格说明](./01-spec.md) - 功能需求和业务规则（起点）
- [02-技术决策文档](./02-technical-decisions.md) - 技术选型和架构决策
- [04-任务清单](./04-tasks.md) - 实施任务分解
- [05-验收清单](./05-checklist.md) - 功能验收标准

**推荐阅读顺序：** 01 → 02 → 03 → 04 → 05

---

## 核心类型定义

### 基础类型

```typescript
// types/variable.ts
export type DataType = 'BOOL' | 'INT';

export interface Variable {
  id: string;              // 唯一标识符（UUID）
  index: number;           // 自动生成的索引
  name: string;            // 变量名称
  dataType: DataType;      // 数据类型
  defaultValue: string;    // 默认值
  comment: string;         // 注释
  updatedAt?: Date;        // 更新时间（可选，用于同步）
}
```

### 验证类型

```typescript
// types/validation.ts
export interface ValidationError {
  field: string;           // 错误字段
  message: string;         // 错误信息
  rowIndex?: number;       // 行索引
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  error?: string;          // 单个错误信息（简化版）
}
```

### 状态管理类型

```typescript
// types/table.ts
export interface TableState {
  variables: Variable[];
  selectedRowIndex: number | null;
  errors: Map<string, ValidationError>;
}

// types/repository.ts
export interface IVariableRepository {
  // 基础操作
  getAll(): Promise<Variable[]>;
  getById(id: string): Promise<Variable | null>;
  save(variable: Variable): Promise<void>;
  saveAll(variables: Variable[]): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;

  // 查询操作
  findByName(name: string): Promise<Variable | null>;
  findByIndex(index: number): Promise<Variable | null>;

  // 批量操作（可选）
  batchSave(variables: Variable[]): Promise<void>;
  batchDelete(ids: string[]): Promise<void>;

  // 同步操作（预留）
  syncWithRemote?(): Promise<void>;
  getLastSyncTime?(): Promise<Date | null>;
}

export type StorageType = 'localStorage' | 'indexedDB' | 'remoteAPI';

export interface StorageConfig {
  type: StorageType;
  maxSize?: number;
  syncEnabled?: boolean;
  syncInterval?: number;
}
```

---

## 常量定义

```typescript
// utils/constants.ts

// INT数据类型范围常量
export const INT_MIN = -2147483648; // -2^31
export const INT_MAX = 2147483647;  // 2^31-1

// localStorage存储键
export const STORAGE_KEYS = {
  VARIABLES: 'table-editor-variables',
  SYNC_TIME: 'table-editor-sync-time',
  CONFIG: 'table-editor-config'
};

// 数据量阈值（用于选择存储策略）
export const STORAGE_THRESHOLD = {
  SMALL: 100,      // <100条变量，使用localStorage
  MEDIUM: 1000,    // 100-1000条变量，考虑IndexedDB
  LARGE: 1000      // >1000条变量，必须使用IndexedDB
};
```

---

## 验证逻辑实现示例

### INT验证（详细实现）

```typescript
// utils/validators.ts

/**
 * 验证INT类型默认值
 * @param value 输入值
 * @returns 验证结果
 */
export function validateIntDefaultValue(value: string): ValidationResult {
  const trimmedValue = value.trim();

  // 1. 空值检查
  if (!trimmedValue) {
    return { isValid: false, error: 'Default value cannot be empty' };
  }

  // 2. 数字格式检查
  const num = Number(trimmedValue);
  if (isNaN(num)) {
    return { isValid: false, error: 'Invalid number format' };
  }

  // 3. 整数检查
  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Value must be an integer' };
  }

  // 4. 范围检查
  if (num < INT_MIN || num > INT_MAX) {
    return {
      isValid: false,
      error: `Value must be between ${INT_MIN} and ${INT_MAX}`
    };
  }

  return { isValid: true };
}

/**
 * 验证BOOL类型默认值
 * @param value 输入值
 * @returns 验证结果和规范化后的值
 */
export function validateBoolDefaultValue(value: string): ValidationResult & { normalized?: string } {
  const trimmedValue = value.trim().toLowerCase();

  if (trimmedValue === 'true' || trimmedValue === 'false') {
    return {
      isValid: true,
      normalized: trimmedValue.toUpperCase() // 返回TRUE或FALSE
    };
  }

  return { isValid: false, error: 'BOOL value must be true or false' };
}

/**
 * 验证变量名称（唯一性检查）
 * @param name 变量名称
 * @param existingNames 已存在的名称列表
 * @returns 验证结果
 */
export function validateVariableName(
  name: string,
  existingNames: string[]
): ValidationResult {
  const trimmedName = name.trim();

  // 1. 非空检查
  if (!trimmedName) {
    return { isValid: false, error: 'Variable name cannot be empty' };
  }

  // 2. 唯一性检查（不区分大小写）
  const isDuplicate = existingNames.some(
    existing => existing.toLowerCase() === trimmedName.toLowerCase()
  );

  if (isDuplicate) {
    return { isValid: false, error: 'Name already exists' };
  }

  return { isValid: true };
}
```

---

## Repository实现示例

### LocalStorageRepository

```typescript
// repository/LocalStorageRepository.ts

import { IVariableRepository, Variable } from '../types/repository';
import { STORAGE_KEYS } from '../utils/constants';

export class LocalStorageRepository implements IVariableRepository {
  private readonly storageKey = STORAGE_KEYS.VARIABLES;
  private readonly syncKey = STORAGE_KEYS.SYNC_TIME;

  async getAll(): Promise<Variable[]> {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  async getById(id: string): Promise<Variable | null> {
    const variables = await this.getAll();
    return variables.find(v => v.id === id) || null;
  }

  async save(variable: Variable): Promise<void> {
    const variables = await this.getAll();
    const index = variables.findIndex(v => v.id === variable.id);

    if (index >= 0) {
      variables[index] = { ...variable, updatedAt: new Date() };
    } else {
      variables.push({ ...variable, updatedAt: new Date() });
    }

    await this.saveAll(variables);
  }

  async saveAll(variables: Variable[]): Promise<void> {
    localStorage.setItem(this.storageKey, JSON.stringify(variables));
    localStorage.setItem(this.syncKey, new Date().toISOString());
  }

  async delete(id: string): Promise<void> {
    const variables = await this.getAll();
    const filtered = variables.filter(v => v.id !== id);
    await this.saveAll(filtered);
  }

  async deleteAll(): Promise<void> {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.syncKey);
  }

  async findByName(name: string): Promise<Variable | null> {
    const variables = await this.getAll();
    return variables.find(v => v.name === name) || null;
  }

  async findByIndex(index: number): Promise<Variable | null> {
    const variables = await this.getAll();
    return variables.find(v => v.index === index) || null;
  }

  // 批量操作（可选实现）
  async batchSave(variables: Variable[]): Promise<void> {
    await this.saveAll(variables);
  }

  async batchDelete(ids: string[]): Promise<void> {
    const allVariables = await this.getAll();
    const filtered = allVariables.filter(v => !ids.includes(v.id));
    await this.saveAll(filtered);
  }

  // 同步操作（预留，不实际实现）
  async getLastSyncTime(): Promise<Date | null> {
    const syncTime = localStorage.getItem(this.syncKey);
    return syncTime ? new Date(syncTime) : null;
  }
}
```

### IndexedDBRepository（接口预留）

```typescript
// repository/IndexedDBRepository.ts

import { IVariableRepository, Variable } from '../types/repository';

/**
 * IndexedDB存储实现（预留接口）
 *
 * 注意：此文件只定义接口签名，不实现具体代码
 * 展示扩展性设计，实际实现可根据需要添加
 */
export class IndexedDBRepository implements IVariableRepository {
  // 接口方法签名定义
  // 具体实现代码暂不提供

  async getAll(): Promise<Variable[]> {
    // TODO: 实现IndexedDB获取数据逻辑
    throw new Error('IndexedDB implementation not available in demo');
  }

  async getById(id: string): Promise<Variable | null> {
    // TODO: 实现IndexedDB查询逻辑
    throw new Error('IndexedDB implementation not available in demo');
  }

  async save(variable: Variable): Promise<void> {
    // TODO: 实现IndexedDB保存逻辑
    throw new Error('IndexedDB implementation not available in demo');
  }

  // ... 其他接口方法签名
}
```

---

## 开发规范建议

### 1. 组件设计原则

- **单一职责**：每个组件只负责一个功能
  - TableEditor组件：管理表格整体逻辑
  - Toolbar组件：管理添加/删除按钮
  - CellRenderers组件：负责单元格渲染和编辑

- **可复用性**：通用组件放到`components/common/`
  - ErrorMessage组件：显示错误提示
  - LoadingSpinner组件：加载状态指示

- **类型安全**：所有组件都要有完整的TypeScript类型定义
  ```typescript
  interface TableEditorProps {
    initialVariables?: Variable[];
    onVariablesChange?: (variables: Variable[]) => void;
  }
  ```

### 2. 状态管理原则

- **最小状态**：只存储必要的状态
  - variables数组
  - selectedRowIndex
  - errors Map

- **派生状态**：能计算得出的不存储
  - variableCount: variables.length
  - nextIndex: Math.max(...variables.map(v => v.index)) + 1

- **不可变更新**：使用immer或展开运算符
  ```typescript
  // 使用immer
  import { produce } from 'immer';

  setVariables(produce(variables, draft => {
    draft[index].name = newName;
  }));

  // 或使用展开运算符
  setVariables([
    ...variables.slice(0, index),
    { ...variables[index], name: newName },
    ...variables.slice(index + 1)
  ]);
  ```

### 3. 验证逻辑原则

- **纯函数**：验证函数不依赖外部状态
  ```typescript
  function validateName(name: string, existingNames: string[]): ValidationResult
  ```

- **单一职责**：每个验证函数只验证一个规则
  - validateNameNotEmpty：检查非空
  - validateNameUnique：检查唯一性

- **可测试性**：所有验证函数都要有单元测试

### 4. 文件命名规范

- **组件文件**：PascalCase (如 `TableEditor.tsx`)
- **工具函数**：camelCase (如 `validators.ts`)
- **类型文件**：camelCase (如 `variable.ts`)
- **常量文件**：UPPER_CASE (如 `constants.ts`)

### 5. 代码注释规范

```typescript
/**
 * 验证INT类型默认值
 * @param value 输入值字符串
 * @returns 验证结果对象
 * @example
 * validateIntDefaultValue('42') // { isValid: true }
 * validateIntDefaultValue('3.14') // { isValid: false, error: '...' }
 */
export function validateIntDefaultValue(value: string): ValidationResult {
  // 实现代码...
}
```

---

## 性能优化建议

### 基础React性能优化（推荐实施）

- **使用React.memo优化组件**
  ```typescript
  const TableRow = React.memo(({ variable, onUpdate }) => {
    // 表格行组件实现
  }, (prevProps, nextProps) => {
    // 自定义比较逻辑
    return prevProps.variable.id === nextProps.variable.id &&
           prevProps.variable.name === nextProps.variable.name;
  });
  ```

- **使用useMemo缓存计算**
  ```typescript
  // 缓存计算结果
  const nextIndex = useMemo(() => {
    return variables.length > 0
      ? Math.max(...variables.map(v => v.index)) + 1
      : 1;
  }, [variables]);
  ```

- **使用useCallback缓存函数**
  ```typescript
  // 避免每次渲染创建新函数
  const handleAddRow = useCallback(() => {
    addRow();
  }, [addRow]);

  const handleUpdateCell = useCallback((index: number, field: string, value: any) => {
    updateCell(index, field, value);
  }, [updateCell]);
  ```

### antd Table性能特性

antd Table自带性能优化：
- 自动虚拟滚动支持（如果需要）
- 内置防抖和节流机制
- 对于几百条数据的场景性能良好
- **面试demo无需额外优化**

### 状态订阅优化

- **精确订阅状态**（避免不必要的渲染）
  ```typescript
  // 只订阅需要的状态
  const variables = useTableStore(state => state.variables);
  const errors = useTableStore(state => state.errors);
  
  // 不要订阅整个store
  // const store = useTableStore(); // 不推荐
  ```

- **使用Zustand的selector**
  ```typescript
  // Zustand自动优化selector
  const selectedRow = useTableStore(
    state => state.variables[state.selectedRowIndex]
  );
  ```

### 面试Demo性能重点

**实际场景数据量**：
- TIA Portal表格通常几十到几百条变量
- antd Table性能足够，无需特殊优化

**面试展示重点**：
- ✅ 展示React性能优化意识（memo、useMemo、useCallback）
- ✅ 说明antd Table自带性能优化
- ✅ 简单说明大数据场景的虚拟滚动思路（口述即可）
- ❌ 不需要实际实现复杂的性能优化代码

---

## 测试策略

### 1. 单元测试（Vitest）

**验证函数测试：**
```typescript
// tests/unit/validators.test.ts
import { describe, it, expect } from 'vitest';
import { validateIntDefaultValue, validateBoolDefaultValue } from '../utils/validators';

describe('INT validation', () => {
  it('should validate valid integer', () => {
    expect(validateIntDefaultValue('42').isValid).toBe(true);
  });

  it('should reject decimal number', () => {
    expect(validateIntDefaultValue('3.14').isValid).toBe(false);
  });

  it('should reject out of range integer', () => {
    expect(validateIntDefaultValue('9999999999').isValid).toBe(false);
  });
});
```

**Store测试：**
```typescript
// tests/unit/tableStore.test.ts
import { describe, it, expect } from 'vitest';
import { useTableStore } from '../store/tableStore';

describe('Table Store', () => {
  it('should add new row', () => {
    const { addRow, variables } = useTableStore.getState();
    addRow();
    expect(useTableStore.getState().variables.length).toBe(1);
  });
});
```

### 2. 组件测试（Vitest + React Testing Library）

```typescript
// tests/components/TableEditor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TableEditor } from '../components/TableEditor';

describe('TableEditor Component', () => {
  it('should render empty table', () => {
    render(<TableEditor />);
    expect(screen.getByText('Add Row')).toBeInTheDocument();
  });

  it('should add row when clicking Add Row button', () => {
    render(<TableEditor />);
    fireEvent.click(screen.getByText('Add Row'));
    expect(screen.getAllByRole('row')).toHaveLength(1);
  });
});
```

### 3. 集成测试

```typescript
// tests/integration/tableOperations.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TableEditor } from '../components/TableEditor';

describe('Table Operations Flow', () => {
  it('should complete full workflow: add, edit, delete', async () => {
    render(<TableEditor />);

    // 添加行
    fireEvent.click(screen.getByText('Add Row'));

    // 编辑名称
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'testVariable' } });

    // 验证保存
    await waitFor(() => {
      expect(screen.getByText('testVariable')).toBeInTheDocument();
    });

    // 删除行
    fireEvent.click(screen.getByText('Delete Row'));
    expect(screen.queryByText('testVariable')).not.toBeInTheDocument();
  });
});
```

---

## 部署建议

### 1. 构建优化

**Vite配置示例：**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'antd': ['antd'],
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    // 资源压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除console
        drop_debugger: true
      }
    }
  }
});
```

### 2. 环境配置

**环境变量文件：**
```bash
# .env.development
VITE_APP_TITLE=Table Editor (Dev)
VITE_STORAGE_TYPE=localStorage

# .env.production
VITE_APP_TITLE=Table Editor
VITE_STORAGE_TYPE=localStorage
```

### 3. 性能监控

- **打包体积分析**：使用rollup-plugin-visualizer
- **运行时性能**：React DevTools Profiler
- **网络性能**：Lighthouse CI

---

## Repository架构说明

### 架构设计思路

Repository Pattern用于解耦业务逻辑与数据存储实现：

1. **接口层**：定义统一的存储接口
2. **实现层**：提供具体的存储实现（localStorage、IndexedDB等）
3. **工厂模式**：根据配置选择合适的Repository实例
4. **扩展性**：预留接口支持未来扩展到IndexedDB或远程API

### 面试Demo展示要点

- 展示Repository Pattern架构设计能力
- 实际实现localStorage，代码简洁高效
- IndexedDB预留接口定义（只有签名，无实现）
- 通过repository/README.md文档说明扩展方向

### 未来扩展方向

1. **IndexedDB实现**：大数据量场景（>1000条变量）
2. **远程API集成**：支持云端同步
3. **SyncManager**：处理本地与远端数据同步和冲突
4. **数据版本控制**：支持数据历史记录和回滚

---

## 总结

本实施指导文档提供了：
- 详细的核心类型定义和代码示例
- 开发规范和最佳实践建议
- 性能优化策略和具体实现方法
- 完整的测试策略和测试代码示例
- 部署配置和优化建议
- Repository架构设计和扩展说明

**实施阶段重点：**
- ✅ 遵循开发规范，保证代码质量
- ✅ 实现性能优化，确保用户体验
- ✅ 编写完整测试，保证功能稳定
- ✅ 配置部署优化，确保生产可用
- ✅ 展示架构设计能力（Repository Pattern）
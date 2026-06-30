# Table Editor - 变量表编辑器

受 TIA Portal 启发的简化变量表编辑器，支持变量的添加、删除、编辑和查看。

## 功能

- **表格管理**：展示变量列表，包含 Index、Name、Data Type、Default Value、Comment 列
- **数据操作**：添加行、删除行、编辑单元格内容
- **数据验证**：名称唯一性（不区分大小写）、数据类型格式、默认值范围
- **数据类型**：BOOL 和 INT（32 位有符号整数，范围 -2147483648 ~ 2147483647）
- **自动默认值**：切换数据类型时自动更新默认值（BOOL → TRUE，INT → 0）
- **数据持久化**：自动保存到 localStorage

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| UI 库 | Ant Design 6 |
| 状态管理 | Zustand 5 |
| 样式 | Less |
| 测试 | Vitest 4 + Testing Library |
| 持久化 | localStorage（仓储模式，预留 IndexedDB 接口） |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器（端口 3004）
pnpm dev

# 生产构建
pnpm build

# 预览生产构建
pnpm preview

# 运行测试
pnpm test

# 运行测试并查看覆盖率
pnpm test:coverage

# 代码检查
pnpm lint
```

## 项目结构

```
src/
├── assets/                    # 静态资源
├── components/
│   └── TableEditor/           # 主表格编辑器组件
│       ├── index.tsx          # TableEditor 容器（Card + Table）
│       ├── index.less         # 样式文件
│       ├── columns.tsx        # 列定义
│       └── components/        # 子组件
│           ├── EditableCell.tsx   # 文本输入单元格（Name、Default Value、Comment）
│           └── DataTypeCell.tsx   # 下拉选择单元格（DataType：BOOL/INT）
├── hooks/
│   ├── useTableActions.ts     # 行 CRUD + 验证 + 保存操作
│   ├── useEditingState.ts     # 单元格编辑状态管理
│   └── useTableHeight.ts      # 响应式表格高度
├── repository/
│   ├── IVariableRepository.ts # 仓储接口
│   ├── LocalStorageRepository.ts  # localStorage 实现
│   └── RepositoryFactory.ts   # 工厂模式
├── store/
│   └── tableStore.ts          # Zustand 状态管理（变量、错误、持久化）
├── types/
│   ├── variable.ts            # Variable、DataType 类型定义
│   ├── validation.ts          # ValidationResult 类型
│   └── repository.ts          # IVariableRepository 接口
├── utils/
│   ├── validators.ts          # Name/DefaultValue 验证逻辑
│   └── constants.ts           # 数据类型常量
├── App.tsx                    # 根组件
├── App.less                   # 全局样式
├── index.less                 # 基础样式（滚动条等）
└── main.tsx                   # 入口文件

tests/
├── setup.ts                   # 测试配置（antd 的 mock）
├── unit/
│   ├── validators.test.ts     # 验证逻辑测试（29 个）
│   ├── constants.test.ts      # 常量测试（5 个）
│   └── store.test.ts          # 状态管理测试（24 个）
├── components/
│   └── TableEditor.test.tsx   # 组件测试（9 个）
└── integration/
    └── workflow.test.tsx      # 集成测试（7 个）
```

## 布局

编辑器采用单卡片居中布局（最大宽度 1400px）：

```
┌──────────────────────────────────────────────────┐
│  Card                                            │
│  ┌────────────────────────────────────────────┐  │
│  │  标题："Variable Table Editor"             │  │
│  │  描述："Edit and manage variables"         │  │
│  ├────────────────────────────────────────────┤  │
│  │  工具栏                                   │  │
│  │  [添加行] [删除行]    总计：N 个变量       │  │
│  ├────────────────────────────────────────────┤  │
│  │  表格（flex: 1，填充剩余空间）             │  │
│  │  ┌────┬──────┬───────────┬────────┬─────┐ │  │
│  │  │ #  │ 名称 │ 数据类型  │ 默认值 │ 注释│ │  │
│  │  ├────┼──────┼───────────┼────────┼─────┤ │  │
│  │  │ 0  │      │           │        │     │ │  │
│  │  │ 1  │      │           │        │     │ │  │
│  │  │ .. │      │           │        │     │ │  │
│  │  └────┴──────┴───────────┴────────┴─────┘ │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

- **Card** 通过 flex 布局填充视口，`overflow: hidden` 防止 body 滚动
- **工具栏** 固定在顶部；**表格** 通过 `flex: 1` 占据剩余高度
- 当行数超出可用高度时，表格内部出现垂直滚动条（`scroll.y` 动态计算）

## 交互说明

### 行操作

| 操作 | 触发方式 | 说明 |
|------|----------|------|
| **添加行** | 点击"Add Row"按钮 | 在末尾追加空行，索引自动递增 |
| **删除行** | 选中一行（单选按钮）→ 点击"Delete Row" | 仅当选中行时可用；删除后后续索引重新计算 |

### 单元格编辑

| 列 | 触发方式 | 输入类型 | 保存方式 |
|----|----------|----------|----------|
| **Name** | 单击单元格 | `Input` 文本框 | 按 Enter 或失焦（经校验后保存） |
| **Data Type** | 双击单元格 | `Select` 下拉框（BOOL / INT） | 选择选项后自动关闭并保存 |
| **Default Value** | 单击单元格（需已选数据类型） | `Input` 文本框 | 按 Enter 或失焦（经校验后保存） |
| **Comment** | 单击单元格 | `Input` 文本框 | 按 Enter 或失焦（无需校验） |

### 编辑流程

1. **点击** 单元格进入编辑态 → 当前值存入临时状态
2. 用户修改内容
3. **Enter** 或 **失焦** 触发保存：
   - **Name**：校验非空且不区分大小写唯一；失败时显示错误 Tooltip 并恢复原值
   - **Default Value**：根据 Data Type 校验（BOOL：TRUE/FALSE；INT：-2147483648 ~ 2147483647）；失败时显示错误 Tooltip 并恢复原值
   - **Comment**：直接保存，无校验
   - **Data Type**：选择后自动更新默认值（BOOL → "TRUE"，INT → "0"）
4. **Escape** 取消编辑，恢复原值

### 默认值约束

- **未选择数据类型** → Default Value 单元格 **禁止编辑**（点击无效），placeholder 显示"Select data type first"
- 选择数据类型后，Default Value 恢复可编辑，并按对应类型进行校验

### 键盘快捷键

| 按键 | 操作 |
|------|------|
| `Enter` | 保存当前单元格并退出编辑态 |
| `Escape` | 取消编辑，恢复原值 |

## 验收标准

| AC | 描述 | 状态 |
|----|------|------|
| AC1 | 表格展示：Index、Name、Data Type、Default Value、Comment 列 | ✅ |
| AC2 | 添加行：自动生成 Index | ✅ |
| AC3 | 删除选中行：后续行 Index 自动重新计算 | ✅ |
| AC4 | 编辑名称：空值/重复验证（不区分大小写） | ✅ |
| AC5 | 双击选择数据类型（BOOL/INT），自动更新默认值 | ✅ |
| AC6 | 编辑 BOOL 默认值（TRUE/FALSE，不区分大小写） | ✅ |
| AC7 | 编辑 INT 默认值（-2147483648 ~ 2147483647） | ✅ |
| AC8 | 编辑注释（自由文本，可为空） | ✅ |

## 设计决策

- **Zustand** 优于 Redux/MobX：模板代码最少，API 简洁，TypeScript 支持优秀
- **Ant Design Table** 优于 ag-Grid/react-table：内置编辑、排序和验证 UI
- **Less**：支持嵌套 CSS 语法和变量
- **仓储模式**：抽象存储后端，当前使用 localStorage，预留 IndexedDB 接口以便未来扩展
- **Vitest** 优于 Jest：原生 Vite 集成，执行速度更快

## 遗留问题

| # | 问题 | 说明 |
|---|------|------|
| 1 | **允许新增空行** | "Add Row" 创建行时不进行前置校验，Name 可为空、Data Type 可不选。需求未明确限制新增行内容，此为设计如此。 |
| 2 | **持久化暂未开启** | `LocalStorageRepository` 接口已完整实现，但 `createTableStore()` 默认 `persistence: false`。持久化功能暂时关闭，后续视需求情况决定是否开启。 |

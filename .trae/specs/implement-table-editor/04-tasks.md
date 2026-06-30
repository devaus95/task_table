# Tasks

- [x] Task 0: 技术栈选择决策
  - [x] SubTask 0.1: 确定构建工具 → Vite ^8.1.0
  - [x] SubTask 0.2: 选择表格组件库 → antd Table ^6.5.0
  - [x] SubTask 0.3: 选择CSS框架和UI组件库 → Ant Design ^6.5.0 + Less ^4.6.7
  - [x] SubTask 0.4: 选择状态管理方案 → Zustand ^5.0.14
  - [x] SubTask 0.5: 选择测试框架 → Vitest ^4.1.9 + Testing Library
  - [x] SubTask 0.6: 编写技术决策文档，记录选择理由和对比分析
  - [x] SubTask 0.7: 设计数据持久化架构（localStorage + Repository Pattern + IndexedDB预留）
  - [x] SubTask 0.8: 分析INT数据类型验证方案（32位整数范围保证）

- [x] Task 1: 项目初始化和架构设计
  - [x] SubTask 1.1: 创建React + TypeScript项目（Vite）
  - [x] SubTask 1.2: 安装必要的依赖（antd, zustand, less等）
  - [x] SubTask 1.3: 设计项目目录结构（components, hooks, utils, types, repository, store）
  - [x] SubTask 1.4: 定义TypeScript类型和接口（Variable, DataType, ValidationError等）
  - [x] SubTask 1.5: 配置开发环境和构建脚本（vite --port 3004）

- [x] Task 2: 核心状态管理实现
  - [x] SubTask 2.1: 配置Zustand状态管理
  - [x] SubTask 2.2: 实现变量表格状态（variables数组、selectedRowIndex、errors Map）
  - [x] SubTask 2.3: 实现行操作actions（addRow, deleteRow, updateRow）+ 自动持久化
  - [x] SubTask 2.4: 实现Index自动计算逻辑（getNextIndex）
  - [x] SubTask 2.5: 设计并实现数据持久化适配层
    - [x] 定义IVariableRepository接口（types/repository.ts）
    - [x] 实现LocalStorageRepository（完整实现）
    - [x] 实现RepositoryFactory（工厂模式）
    - [x] 持久化集成到Store（addRow/updateRow/deleteRow后自动saveToStorage）
    - [x] 定义IndexedDBRepository接口签名（预留，throw Error）
    - [x] 编写repository/README.md文档说明架构设计

- [x] Task 3: 表格显示组件实现
  - [x] SubTask 3.1: 创建主表格组件（TableEditor - Card包裹）
  - [x] SubTask 3.2: 实现表格列定义（Index、Name、Data Type、Default Value、Comment）
  - [x] SubTask 3.3: 实现Index列只读和自动生成（粗体显示）
  - [x] SubTask 3.4: 添加"Add Row"和"Delete Row"按钮（含Tooltip提示）
  - [x] SubTask 3.5: 实现行选择功能（单选radio模式）

- [x] Task 4: 数据验证逻辑实现
  - [x] SubTask 4.1: 实现名称验证（非空、唯一性检查、不区分大小写）
  - [x] SubTask 4.2: 实现BOOL类型默认值验证（接受true/false，显示为TRUE/FALSE）
  - [x] SubTask 4.3: 实现INT类型默认值验证（范围检查：-2147483648到2147483647）
  - [x] SubTask 4.4: 实现错误提示显示机制（Tooltip红色提示 + 输入框红色边框）

- [x] Task 5: 单元格编辑功能实现
  - [x] SubTask 5.1: 实现Name单元格编辑（EditableCell - 点击编辑，失焦/Enter保存）
  - [x] SubTask 5.2: 实现Data Type单元格编辑（DataTypeCell - 双击下拉Select，使用options属性）
  - [x] SubTask 5.3: 实现Default Value单元格编辑（根据数据类型验证）
  - [x] SubTask 5.4: 实现Comment单元格编辑（自由文本输入，无验证）
  - [x] SubTask 5.5: 实现数据类型切换时自动更新默认值（BOOL→TRUE, INT→0）

- [x] Task 6: 用户体验优化
  - [x] SubTask 6.1: 添加加载状态和空状态提示（"No data, click Add Row to add variables"）
  - [x] SubTask 6.2: 实现友好的错误提示UI（Tooltip + error-cell样式）
  - [x] SubTask 6.3: 添加键盘快捷键支持（Enter保存、Esc取消）
  - [x] SubTask 6.4: 响应式设计和布局优化（多断点媒体查询 + 表格内部滚动）
  - [x] SubTask 6.5: CSS改为Less预处理（嵌套语法、变量）
  - [x] SubTask 6.6: 页面全屏布局（100vh flex链条 + ResizeObserver动态高度）
  - [x] SubTask 6.7: 编辑卡死问题修复（editingValues改用useRef）
  - [x] SubTask 6.8: 自定义滚动条样式优化
  - [x] SubTask 6.9: 工具栏添加变量总数显示

- [ ] Task 7: 测试实现
  - [ ] SubTask 7.1: 编写单元测试（验证逻辑、状态管理）
  - [ ] SubTask 7.2: 编写组件测试（表格渲染、用户交互）
  - [ ] SubTask 7.3: 编写集成测试（完整的添加、编辑、删除流程）

- [ ] Task 8: 文档和部署准备
  - [ ] SubTask 8.1: 更新README.md（项目说明、运行步骤、项目结构）
  - [ ] SubTask 8.2: 更新Spec文档匹配实际实现
  - [x] SubTask 8.3: 样式统一为Less
  - [ ] SubTask 8.4: 准备项目部署

# Task Dependencies
- [Task 1] depends on [Task 0] (项目初始化需要先确定技术栈)
- [Task 2] depends on [Task 1] (状态管理需要在项目初始化后实现)
- [Task 3] depends on [Task 2] (表格组件需要状态管理支持)
- [Task 4] depends on [Task 2] (验证逻辑需要状态管理)
- [Task 5] depends on [Task 3] and [Task 4] (编辑功能需要表格和验证支持)
- [Task 6] depends on [Task 5] (UX优化在基础功能完成后进行)
- [Task 7] depends on [Task 5] (测试在功能实现后编写)
- [Task 8] depends on [Task 7] (文档在所有功能完成后编写)
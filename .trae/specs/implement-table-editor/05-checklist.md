# Table Editor 项目验收清单

## 功能验收

### AC 1: 表格显示
- [x] 打开页面时显示空表格，包含Index、Name、Data Type、Default Value、Comment列
- [x] Index列是只读的且自动生成（粗体显示）
- [x] 显示"Add Row"和"Delete Row"按钮（含Tooltip）
- [x] 页面占满一屏，表格内部滚动（ResizeObserver动态高度）

### AC 2: 添加变量行
- [x] 点击"Add Row"按钮后在表格末尾添加新行
- [x] 新行的所有字段（name, data type, default value, comment）默认为空
- [x] Index自动生成为当前最大index + 1
- [x] 新增行自动保存到localStorage

### AC 3: 删除变量行
- [x] 选中行并点击"Delete Row"按钮后，该行被删除
- [x] 删除后，后续行的Index自动重新计算
- [x] 未选中行时Delete按钮禁用，并显示提示
- [x] 删除后自动保存到localStorage

### AC 4: 编辑变量名称
- [x] 输入空名称时，显示"Variable name cannot be empty"错误
- [x] 输入已存在的名称（不区分大小写）时，显示"Variable name already exists"错误
- [x] 输入唯一且非空的名称时，成功保存
- [x] 错误以Tooltip红色提示 + 输入框红色边框显示

### AC 5: 选择数据类型
- [x] 双击数据类型单元格显示BOOL和INT下拉选项（Select组件，使用options属性）
- [x] 选择数据类型后，单元格显示所选类型
- [x] 切换数据类型时，默认值自动更新（BOOL -> TRUE, INT -> 0）

### AC 6: 编辑BOOL默认值
- [x] 接受输入：true, false, TRUE, FALSE（不区分大小写）
- [x] 统一显示为大写：TRUE或FALSE
- [x] 输入其他值时显示"BOOL value must be true or false"错误

### AC 7: 编辑INT默认值
- [x] 接受整数输入，范围：-2147483648到2147483647
- [x] 输入非整数时显示"Value must be an integer"错误
- [x] 输入超出范围的整数时显示范围错误
- [x] 空值时显示"Default value cannot be empty"错误

### AC 8: 编辑注释
- [x] 接受任何文本输入
- [x] 允许空值
- [x] 无验证逻辑

### AC 9: 键盘快捷键
- [x] Enter键保存当前编辑内容并退出编辑态
- [x] Escape键取消编辑，恢复原始值

### AC 10: 数据持久化
- [x] 修改数据后刷新页面，数据从localStorage自动恢复
- [x] Repository Pattern架构（localStorage实现 + IndexedDB预留）
- [x] 工具栏显示变量总数

## 技术验收

### 代码质量
- [x] 使用React + TypeScript实现
- [x] 代码结构清晰，组件职责分明
- [x] 正确使用TypeScript类型定义
- [x] 实现了合适的错误处理
- [x] 使用Less作为CSS预处理器

### 项目结构
- [x] 包含完整的可运行项目源代码
- [x] 包含README.md文件
- [x] README.md包含运行步骤和项目结构说明

### 状态管理
- [x] 使用Zustand实现状态管理
- [x] 状态更新逻辑正确（精确selector订阅）
- [x] 组件间状态共享正常
- [x] 编辑状态使用useRef避免无限重渲染

### 用户体验
- [x] 界面布局合理（全屏flex布局）
- [x] 交互流畅（点击编辑、双击下拉）
- [x] 错误提示清晰友好（Tooltip + 红色边框）
- [x] 响应式设计良好（多断点适配）
- [x] 自定义滚动条样式
- [x] 表格内部滚动，页面无外部滚动条

### 性能优化
- [x] columns使用useMemo缓存
- [x] editingValues使用useRef（解决卡死问题）
- [x] Zustand精确selector订阅
- [x] ResizeObserver动态计算表格高度

## 测试验收

### 测试覆盖
- [ ] 包含单元测试（验证逻辑、状态管理）
- [ ] 包含组件测试（表格渲染、用户交互）
- [ ] 包含集成测试（完整流程测试）
- [ ] 所有测试通过

## 文档验收

### 文档完整性
- [ ] README.md包含项目说明
- [ ] README.md包含安装步骤
- [ ] README.md包含运行步骤
- [ ] README.md包含项目结构说明
- [x] 代码中有适当的注释
- [x] Spec设计文档与实际实现一致
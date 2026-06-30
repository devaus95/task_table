# Repository Pattern 数据持久化架构

## 设计思路

采用Repository Pattern解耦业务逻辑与数据存储实现，展示架构设计能力。

## 文件结构

```
repository/
├── LocalStorageRepository.ts   # localStorage实现（面试demo实际使用）
├── IndexedDBRepository.ts      # IndexedDB接口预留（只有签名）
├── RepositoryFactory.ts        # 工厂模式
└── README.md                   # 本文档
```

## 实施策略

**面试demo实际实现：**
- LocalStorageRepository - 完整实现，数据存储在localStorage
- RepositoryFactory - 工厂模式，根据配置选择Repository实例
- usePersistence Hook - React Hook，自动同步数据

**接口预留（展示扩展性）：**
- IndexedDBRepository - 只定义接口签名，无实现代码
- 文档说明未来扩展方向（大数据量、远程API）

## 未来扩展方向

1. **IndexedDB实现** - 大数据量场景（>1000条变量）
2. **远程API集成** - 支持云端同步
3. **SyncManager** - 处理本地与远端数据同步和冲突
4. **数据版本控制** - 支持数据历史记录和回滚
# Table Editor - Variable Table Editor

A simplified variable table editor inspired by TIA Portal, supporting add, delete, edit, and view operations for variables.

## Features

- **Table Management**: Display variable list with columns: Index, Name, Data Type, Default Value, Comment
- **Data Operations**: Add rows, delete rows, and edit cell content
- **Data Validation**: Name uniqueness (case-insensitive), data type format, default value range
- **Data Types**: BOOL and INT (32-bit signed integer, range -2147483648 ~ 2147483647)
- **Auto Default Value**: Switching data type auto-updates default value (BOOL → TRUE, INT → 0)
- **Persistence**: Data auto-saves to localStorage

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| UI Library | Ant Design 6 |
| State Management | Zustand 5 |
| Styling | Less |
| Testing | Vitest 4 + Testing Library |
| Persistence | localStorage (Repository Pattern, IndexedDB reserved) |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server (port 3004)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint
pnpm lint
```

## Project Structure

```
src/
├── assets/                    # Static assets
├── components/
│   └── TableEditor/           # Main table editor component
│       ├── index.tsx          # TableEditor container (Card + Table)
│       ├── index.less         # Styles
│       ├── columns.tsx        # Column definitions
│       └── components/        # Sub-components
│           ├── EditableCell.tsx   # Text input cell (Name, Default Value, Comment)
│           └── DataTypeCell.tsx   # Dropdown cell (Data Type: BOOL/INT)
├── hooks/
│   ├── useTableActions.ts     # Row CRUD + validation + save actions
│   ├── useEditingState.ts     # Cell editing state management
│   └── useTableHeight.ts      # Responsive table height
├── repository/
│   ├── IVariableRepository.ts # Repository interface
│   ├── LocalStorageRepository.ts  # localStorage implementation
│   └── RepositoryFactory.ts   # Factory pattern
├── store/
│   └── tableStore.ts          # Zustand store (variables, errors, persistence)
├── types/
│   ├── variable.ts            # Variable, DataType types
│   ├── validation.ts          # ValidationResult type
│   └── repository.ts          # IVariableRepository interface
├── utils/
│   ├── validators.ts          # Name/DefaultValue validation
│   └── constants.ts           # Data type constants
├── App.tsx                    # Root component
├── App.less                   # Global styles
├── index.less                 # Base styles (scrollbar, etc.)
└── main.tsx                   # Entry point

tests/
├── setup.ts                   # Test setup (mocks for antd)
├── unit/
│   ├── validators.test.ts     # Validation logic tests (29 tests)
│   ├── constants.test.ts      # Constants tests (5 tests)
│   └── store.test.ts          # State management tests (24 tests)
├── components/
│   └── TableEditor.test.tsx   # Component tests (9 tests)
└── integration/
    └── workflow.test.tsx      # Integration tests (7 tests)
```

## Acceptance Criteria

| AC | Description | Status |
|----|-------------|--------|
| AC1 | Table display with Index, Name, Data Type, Default Value, Comment columns | ✅ |
| AC2 | Add variable row with auto-generated index | ✅ |
| AC3 | Delete selected row with index recalculation | ✅ |
| AC4 | Edit name with empty/duplicate validation (case-insensitive) | ✅ |
| AC5 | Double-click to select data type (BOOL/INT), auto-update default value | ✅ |
| AC6 | Edit BOOL default value (TRUE/FALSE, case-insensitive) | ✅ |
| AC7 | Edit INT default value (-2147483648 ~ 2147483647) | ✅ |
| AC8 | Edit comment (free text, can be empty) | ✅ |

## Design Decisions

- **Zustand** over Redux/MobX: Minimal boilerplate, simple API, excellent TypeScript support
- **Ant Design Table** over ag-Grid/react-table: Built-in editing, sorting, and validation UI
- **Less** for nested CSS syntax and variable support
- **Repository Pattern** for persistence: abstracts storage backend, currently localStorage with IndexedDB interface reserved for future scaling
- **Vitest** over Jest: Native Vite integration, faster execution

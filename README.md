# Table Editor - Variable Table Editor

A simplified variable table editor inspired by TIA Portal, supporting add, delete, edit, and view operations for variables.

## Features

- **Table Management**: Display variable list with columns: Index, Name, Data Type, Default Value, Comment
- **Data Operations**: Add rows, delete rows, and edit cell content
- **Data Validation**: Name uniqueness (case-insensitive), data type format, default value range
- **Data Types**: BOOL and INT (32-bit signed integer, range -2147483648 ~ 2147483647)
- **Auto Default Value**: Switching data type auto-updates default value (BOOL → TRUE, INT → 0)
- **Persistence**: Repository pattern with localStorage (disabled by default, see Known Issues)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| UI Library | Ant Design 6 |
| State Management | Zustand 5 |
| Styling | Less |
| Testing | Vitest 4 + Testing Library |
| Persistence | localStorage (Repository Pattern, IndexedDB reserved, disabled by default) |

## Demo

Live demo: [https://devaus95.github.io/task_table/](https://devaus95.github.io/task_table/)

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

## Layout

The editor uses a single-card layout centered on the page (max-width 1400px):

```
┌──────────────────────────────────────────────────┐
│  Card                                            │
│  ┌────────────────────────────────────────────┐  │
│  │  Title: "Variable Table Editor"            │  │
│  │  Description: "Edit and manage variables"  │  │
│  ├────────────────────────────────────────────┤  │
│  │  Toolbar                                   │  │
│  │  [Add Row] [Delete Row]    Total: N vars   │  │
│  ├────────────────────────────────────────────┤  │
│  │  Table (flex: 1, fills remaining space)    │  │
│  │  ┌────┬──────┬───────────┬────────┬─────┐ │  │
│  │  │ #  │ Name │ Data Type │ Default│ Cmt │ │  │
│  │  ├────┼──────┼───────────┼────────┼─────┤ │  │
│  │  │ 0  │      │           │        │     │ │  │
│  │  │ 1  │      │           │        │     │ │  │
│  │  │ .. │      │           │        │     │ │  │
│  │  └────┴──────┴───────────┴────────┴─────┘ │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

- **Card** fills the viewport with flex layout, `overflow: hidden` prevents body scroll
- **Toolbar** stays fixed at top; **Table** takes remaining height via `flex: 1`
- When rows exceed available height, a vertical scrollbar appears inside the table (with `scroll.y` dynamically calculated)

## Interaction Guide

### Row Operations

| Action | How | Details |
|--------|-----|---------|
| **Add Row** | Click "Add Row" button | Appends an empty row at the end with auto-increment index |
| **Delete Row** | Select a row (radio) → Click "Delete Row" | Only enabled when a row is selected; subsequent indices are recalculated |

### Cell Editing

| Column | Trigger | Input Type | Save |
|--------|---------|------------|------|
| **Name** | Click cell | `Input` text field | `Enter` or blur (after validation) |
| **Data Type** | Double-click cell | `Select` dropdown (BOOL / INT) | Select an option; auto-closes and saves |
| **Default Value** | Click cell (requires Data Type selected) | `Input` text field | `Enter` or blur (after validation) |
| **Comment** | Click cell | `Input` text field | `Enter` or blur (no validation) |

### Editing Flow

1. **Click** a cell to enter edit mode → current value is stored as temp value
2. User modifies the value
3. **Enter** or **blur** triggers save:
   - **Name**: validated for non-empty and case-insensitive uniqueness; on failure, error tooltip shown and value restored
   - **Default Value**: validated based on Data Type (BOOL: TRUE/FALSE; INT: -2147483648 ~ 2147483647); on failure, error tooltip shown and value restored
   - **Comment**: saved directly, no validation
   - **Data Type**: on selection, auto-updates default value (BOOL → "TRUE", INT → "0")
4. **Escape** cancels editing and restores original value

### Default Value Constraint

- **No Data Type selected** → Default Value cell is **disabled** (cannot click to edit), placeholder shows "Select data type first"
- Once a Data Type is chosen, Default Value becomes editable with appropriate validation

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Save current cell and exit edit mode |
| `Escape` | Cancel editing, restore original value |

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

## Known Issues

| # | Issue | Description |
|---|-------|-------------|
| 1 | **Empty rows allowed** | "Add Row" creates rows without pre-validation — Name can be empty and Data Type unselected. This is by design, as the requirements do not specify restrictions on new row content. |
| 2 | **Data persistence disabled** | `LocalStorageRepository` interface is fully implemented, but `createTableStore()` defaults to `persistence: false`. Persistence is intentionally disabled for now and will be enabled as needed in the future. |

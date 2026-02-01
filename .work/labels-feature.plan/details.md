# Labels Feature - Detailed Work Plan

## Overview
Implement a comprehensive labels system for transactions in the Spinder expense tracking app. This includes label management, filtering, and UI updates across multiple components.

## Prerequisites
- Review existing component architecture and event system
- Understand transaction data structure and filtering patterns
- Familiarize with modal component usage

## Phase 1: Data Model and Storage

### 1.1 Create Label Type Definition
- Add `Label` type to `src/shared/type.label.ts`
- Define Zod schema with `name` (string, max 10 chars) and `id` (string)
- Create `TransactionWithLabels` type extending `Transaction` with optional `labels` array

### 1.2 Update Transaction Type
- Modify `Transaction` type in `src/shared/type.transaction.ts` to include optional `labels: Label[]`
- Ensure backward compatibility with existing transaction data

### 1.3 Create Label Storage Utilities
- Create `src/client/util.labels.ts` with functions for:
  - `loadLabels()`: Load labels from localStorage
  - `saveLabels(labels: Label[])`: Save labels to localStorage
  - `createLabel(name: string): Label`: Create new label with generated ID
  - `addLabelToTransaction(transactionId: string, labelId: string)`: Add label to transaction
  - `removeLabelFromTransaction(transactionId: string, labelId: string)`: Remove label from transaction

## Phase 2: Label Management Modal Component

### 2.1 Create Label Transaction Management Component
- Create `src/client/component.label-transaction-management.ts`
- Extend `LitElement` with modal functionality
- Properties: `transaction: TransactionWithLabels`, `availableLabels: Label[]`
- State: `stagedLabels: Label[]` (labels being added/removed)

### 2.2 Implement Modal UI
- Display current labels on the right with remove (x) buttons
- Dropdown for adding existing labels (filtered to exclude current labels)
- Text input for creating new labels (max 10 chars) with "Create and Add" button
- Proper styling using global styles and CSS variables

### 2.3 Implement Modal Logic
- Handle adding existing labels to staging area
- Handle creating new labels and adding to staging
- Handle removing labels from staging area
- Validate label names (max 10 chars, no duplicates)
- Submit functionality to persist changes

## Phase 3: Transaction Table Updates

### 3.1 Add Labels Column to Pagination Table
- Modify `src/client/component.pagination-table.ts`
- Add "Labels" column header to the right of existing columns
- For each transaction row, add labels display area

### 3.2 Implement Label Display Logic
- Show "+ label" button (grey text) when no labels
- Show single label + "+ label" button when one label
- Show first label + "+X more" button when multiple labels
- Make "+ label" and "+X more" clickable to open modal

### 3.3 Integrate Modal Opening
- Import and use the label management modal component
- Handle click events to open modal with transaction data
- Pass available labels and current transaction labels

## Phase 4: Label Filtering System

### 4.1 Create Label Filter Context
- Add `LabelFilterContext` to `src/client/context.ts`
- Define context with `labelId?: string` and `labelName?: string`

### 4.2 Create Label Filter Events
- Create `src/client/event.update-label-filter.ts`
- Define event for setting/clearing label filter
- Add to `SpinderEvent` union in `util.events.ts`

### 4.3 Update Provider for Label Filtering
- Modify `src/client/provider.app.ts` to handle label filter context
- Add event listener for label filter updates
- Update transaction filtering logic to include label filters

### 4.4 Implement Label Click Filtering
- In pagination table, make displayed labels clickable
- Dispatch label filter event when label is clicked
- Show "Filtering 'LabelName' label" message

## Phase 5: Filters Component (Rename from Time)

### 5.1 Rename Component
- Rename `src/client/component.time.ts` to `src/client/component.filters.ts`
- Update all imports and references
- Rename custom element from `spinder-time` to `spinder-filters`

### 5.2 Add Label Filter Dropdown
- Add label dropdown next to time dropdown in flex row
- Populate with all available labels
- Handle label selection to set label filter

### 5.3 Update Clear Functionality
- Modify clear (x) button to clear both time and label filters
- Update event dispatching to clear both filters

### 5.4 Update Page Imports
- Update `src/client/page.home.ts` to import `spinder-filters` instead of `spinder-time`

## Phase 6: Data Persistence and Migration

### 6.1 Update Transaction Storage
- Modify `src/client/util.transaction.ts` to handle labels in transactions
- Ensure backward compatibility with existing transaction data
- Update `saveTransactions` and `loadTransactions` functions

### 6.2 Label Data Persistence
- Implement label storage in localStorage
- Handle label creation and management across sessions
- Ensure label IDs are consistent

## Phase 7: Testing and Validation

### 7.1 Component Testing
- Test label management modal functionality
- Verify label display in transaction table
- Test label filtering behavior

### 7.2 Integration Testing
- Test end-to-end label creation and assignment
- Verify filtering works with both buckets and labels
- Test data persistence across sessions

### 7.3 UI/UX Validation
- Ensure responsive design on different screen sizes
- Verify accessibility (ARIA labels, keyboard navigation)
- Test edge cases (empty labels, max length, etc.)

## Phase 8: Documentation and Cleanup

### 8.1 Update Skills and Prompts
- Consider if new skills are needed for label management
- Update existing skills if label functionality affects them

### 8.2 Code Cleanup
- Run `npm run fix` for formatting
- Remove any debug code or temporary implementations
- Ensure all imports are correct

## Implementation Order
1. Start with data model (Phase 1)
2. Build modal component (Phase 2)
3. Update transaction table (Phase 3)
4. Implement filtering (Phase 4)
5. Update filters component (Phase 5)
6. Handle data persistence (Phase 6)
7. Testing (Phase 7)
8. Final cleanup (Phase 8)

## Risk Assessment
- **Data Migration**: Ensure existing transactions without labels don't break
- **UI Complexity**: Label display logic in table rows needs careful implementation
- **Filter Interaction**: Ensure bucket and label filters work together properly
- **Performance**: Label filtering should not impact table performance

## Success Criteria
- Users can create and manage labels for transactions
- Labels display correctly in transaction table
- Label filtering works alongside bucket filtering
- Data persists correctly across sessions
- UI is intuitive and responsive

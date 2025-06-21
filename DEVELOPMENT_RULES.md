# Development Rules & Guidelines

## Project Context

- **Framework**: React with TypeScript
- **Project**: yom-yom-app (appears to be a family/child management application)
- **Key Components**: Settings page with ChildManagementCard, account selection, children data management

## State Management Rules

### 1. State Lifting Strategy

- **Prefer parent-level state**: When multiple components need access to the same state, lift it to the nearest common parent
- **Example**: `selectedAccountId` should be managed in Settings component and passed down to ChildManagementCard
- **Avoid prop drilling**: Use context or state lifting instead of passing props through multiple levels

### 2. Component State Isolation

- **Local state for UI-only data**: Keep component-specific UI state (like accordion expansion) at component level
- **Shared state at parent level**: Move state that affects multiple components or persists across re-renders to parent
- **Clear state ownership**: Each piece of state should have a single, clear owner

## Performance Optimization Rules

### 1. Memoization Strategy

- **Use React.memo for expensive components**: Wrap components that receive stable props with React.memo
- **Custom comparison functions**: When needed, provide custom comparison functions to React.memo
- **Memoize expensive computations**: Use useMemo for derived state or expensive calculations
- **Memoize callbacks**: Use useCallback for functions passed as props to prevent child re-renders

### 2. Re-render Prevention

- **Stable references**: Ensure object and function references remain stable across renders
- **Avoid inline objects/functions**: Don't create new objects or functions in render methods
- **Use refs for non-reactive data**: Store data that shouldn't trigger re-renders in refs

## Component Design Rules

### 1. Loading States

- **Always show loading indicators**: When fetching data, display appropriate loading spinners
- **Disable interactions during loading**: Prevent user actions while data is being fetched
- **Clear loading states**: Ensure loading states are properly cleared on success/error

### 2. User Experience

- **No automatic data fetching**: Don't fetch data automatically on component mount or expansion
- **User-initiated actions**: Only fetch data when user explicitly requests it (e.g., selects an account)
- **Clear user guidance**: Provide clear instructions when user action is required
- **Handle empty states**: Show appropriate messages when no data is available

### 3. Form and Selection Behavior

- **Preserve user selections**: Don't clear user selections after successful operations
- **Clear results on reset**: When user selects "empty" option, clear related results
- **Stable form values**: Ensure form inputs maintain their values across re-renders

## Code Quality Rules

### 1. Linting and Imports

- **Remove unused imports**: Always clean up unused imports to prevent linting errors
- **Remove unused variables**: Don't leave unused variables in code
- **Consistent import ordering**: Maintain consistent import structure

### 2. TypeScript Usage

- **Proper typing**: Ensure all components, props, and functions are properly typed
- **Avoid any types**: Use specific types instead of any
- **Type safety**: Leverage TypeScript to catch errors at compile time

### 3. Error Handling

- **Graceful error handling**: Handle API errors and edge cases gracefully
- **User-friendly error messages**: Show meaningful error messages to users
- **Fallback states**: Provide fallback UI when operations fail

## API Integration Rules

### 1. Data Fetching

- **Conditional fetching**: Only fetch data when necessary conditions are met
- **Dependency-based fetching**: Fetch data based on user selections or dependencies
- **Cache results**: Consider caching fetched data to avoid unnecessary API calls

### 2. State Synchronization

- **Keep UI in sync**: Ensure UI state reflects the actual data state
- **Update state after operations**: Update local state after successful API operations
- **Handle loading states**: Properly manage loading states during API calls

## Component Architecture Rules

### 1. Component Composition

- **Single responsibility**: Each component should have a single, clear purpose
- **Composable design**: Design components to be easily composable
- **Separation of concerns**: Separate data fetching, state management, and UI rendering

### 2. Props Design

- **Minimal props**: Pass only necessary data as props
- **Stable prop interfaces**: Keep prop interfaces stable and well-defined
- **Default values**: Provide sensible default values for optional props

## Debugging and Troubleshooting Rules

### 1. Re-render Issues

- **Identify re-render causes**: Use React DevTools to identify unnecessary re-renders
- **Check prop changes**: Verify that props aren't changing unnecessarily
- **Use memoization**: Apply React.memo and useMemo/useCallback as needed

### 2. State Management Issues

- **Single source of truth**: Ensure each piece of state has a single source of truth
- **Avoid state duplication**: Don't duplicate state across multiple components
- **Clear state flow**: Understand how state flows through the component tree

## Testing and Validation Rules

### 1. User Flow Testing

- **Test complete user flows**: Ensure entire user journeys work correctly
- **Test edge cases**: Handle empty states, error states, and boundary conditions
- **Test performance**: Verify that components don't cause performance issues

### 2. Code Validation

- **Run linter**: Always run linter before committing changes
- **Type checking**: Ensure TypeScript compilation passes
- **Manual testing**: Test changes manually in the browser

## Common Patterns Established

### 1. Account Selection Pattern

```typescript
// Parent component manages selectedAccountId
const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

// Pass to child component
<ChildManagementCard
  selectedAccountId={selectedAccountId}
  onAccountChange={setSelectedAccountId}
/>;
```

### 2. Conditional Data Fetching Pattern

```typescript
const fetchChildren = useCallback(async (accountId: string) => {
  if (!accountId) {
    setChildren([]);
    return;
  }
  // Fetch data only when accountId is provided
}, []);
```

### 3. Loading State Pattern

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await someAsyncOperation();
  } finally {
    setIsLoading(false);
  }
};
```

## Anti-Patterns to Avoid

1. **Automatic data fetching on mount/expansion**
2. **Clearing user selections after successful operations**
3. **Creating new objects/functions in render methods**
4. **Duplicating state across components**
5. **Not handling loading states**
6. **Not providing user guidance for required actions**
7. **Using any types in TypeScript**
8. **Leaving unused imports/variables**

## Success Criteria

A component is working correctly when:

- ✅ No unnecessary re-renders occur
- ✅ User selections are preserved
- ✅ Loading states are properly managed
- ✅ No linting errors exist
- ✅ TypeScript compilation passes
- ✅ User experience is smooth and intuitive
- ✅ Data fetching is conditional and user-initiated
- ✅ Error states are handled gracefully

# Error Handling in Sleep Post Creation Flow

This document describes the error handling implementation for the sleep post creation feature using React Error Boundaries.

## Overview

The sleep post creation flow implements comprehensive error handling using React Error Boundaries to catch JavaScript errors and provide graceful fallback UIs. This ensures that the application remains stable even when unexpected errors occur.

## Components

### 1. ErrorBoundary (`src/components/ErrorBoundary.tsx`)

A general-purpose error boundary component that can be used throughout the application.

**Features:**

- Catches JavaScript errors in child components
- Provides a default fallback UI with retry and home navigation options
- Supports custom fallback components
- Logs errors to console in development mode
- Accepts an `onError` callback for custom error handling

**Usage:**

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling logic
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### 2. SleepPostErrorBoundary (`src/components/feed/SleepPostErrorBoundary.tsx`)

A specialized error boundary for the sleep post creation flow.

**Features:**

- Custom error UI designed for sleep post context
- Provides retry and close options
- Maintains modal-like appearance when errors occur
- Specific error messages for sleep post creation

**Usage:**

```tsx
<SleepPostErrorBoundary
  onClose={() => setIsModalOpen(false)}
  onRetry={() => {
    // Retry logic
  }}
>
  <CreateSleepPostModal />
</SleepPostErrorBoundary>
```

### 3. TestErrorComponent (`src/components/feed/TestErrorComponent.tsx`)

A utility component for testing error boundaries during development.

**Features:**

- Can be configured to throw errors on demand
- Useful for testing error boundary behavior
- Includes a toggle button to simulate errors

## Implementation in Feed Component

The Feed component (`src/pages/shared/Feed.tsx`) implements error boundaries at multiple levels:

### 1. Sleep Post Creation Modal

```tsx
<SleepPostErrorBoundary
  onClose={() => setIsSleepModalOpen(false)}
  onRetry={() => {
    console.log("Retrying sleep post creation...");
  }}
>
  <CreateSleepPostModal
    isOpen={isSleepModalOpen}
    onClose={() => setIsSleepModalOpen(false)}
    onSubmit={handleSleepPostSubmit}
    children={mockChildren}
    groupName="גן א'"
    groupId="group1"
  />
</SleepPostErrorBoundary>
```

### 2. Individual Sleep Posts

Each sleep post in the feed is wrapped with an error boundary:

```tsx
{
  sleepPosts.map((post) => (
    <SleepPostErrorBoundary
      key={post.id}
      onClose={() => {
        setSleepPosts((prev) => prev.filter((p) => p.id !== post.id));
      }}
      onRetry={() => {
        console.log("Retrying sleep post render:", post.id);
      }}
    >
      <SleepPost {...post} />
    </SleepPostErrorBoundary>
  ));
}
```

## Error Handling in CreateSleepPostModal

The modal component includes comprehensive error handling:

### 1. Form Validation Errors

- Client-side validation for required fields
- Real-time error display
- Prevents submission with invalid data

### 2. Submission Errors

- Try-catch block around submission logic
- Simulated API errors for testing (10% chance)
- Error display in the UI with retry options

### 3. Error Display

```tsx
{
  errors.submit && (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>שגיאה ביצירת הפוסט</AlertTitle>
      {errors.submit}
    </Alert>
  );
}
```

## Error Boundary Lifecycle

1. **Error Detection**: When a JavaScript error occurs in a child component
2. **State Update**: `getDerivedStateFromError` updates the error boundary state
3. **Error Logging**: `componentDidCatch` logs the error and calls optional callbacks
4. **Fallback UI**: The error boundary renders its fallback component
5. **Recovery**: Users can retry or close the problematic component

## Best Practices

### 1. Granular Error Boundaries

- Wrap individual components that might fail independently
- Prevents one error from crashing the entire application
- Allows for specific error handling per component

### 2. Meaningful Error Messages

- Provide user-friendly error messages in Hebrew
- Include technical details only in development mode
- Offer clear recovery actions (retry, close, go home)

### 3. Error Recovery

- Provide retry mechanisms where appropriate
- Allow users to close problematic components
- Maintain application state when possible

### 4. Development vs Production

- Show detailed error information only in development
- Log errors to console for debugging
- Provide generic error messages in production

## Testing Error Boundaries

### 1. Using TestErrorComponent

```tsx
<TestErrorComponent
  shouldThrow={false}
  onToggleError={() => setShouldThrow(!shouldThrow)}
/>
```

### 2. Simulated API Errors

The CreateSleepPostModal includes a 10% chance of throwing an error for testing:

```tsx
if (Math.random() < 0.1) {
  throw new Error("Network error: Failed to create sleep post");
}
```

### 3. Manual Error Testing

- Open browser developer tools
- Manually throw errors in the console
- Test error boundary recovery mechanisms

## Future Enhancements

1. **Error Reporting**: Integrate with error reporting services (Sentry, LogRocket)
2. **Analytics**: Track error occurrences and recovery rates
3. **Automatic Recovery**: Implement automatic retry mechanisms
4. **Error Categorization**: Different handling for different types of errors
5. **User Feedback**: Allow users to report errors with additional context

## References

- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Error Boundary Best Practices](https://react.dev/learn/error-boundaries)

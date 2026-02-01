---
name: spinder-debugging
description: Debug issues in the Spinder expense tracking app, including transaction processing, UI rendering, and data flow problems.
---

# Spinder Debugging Skill

This skill helps identify and resolve bugs in the Spinder application, focusing on common issues with transaction handling, component rendering, and data management.

## When to Use

Use this skill when you encounter:
- Transaction parsing or display errors
- Component rendering issues
- Data not updating correctly
- Performance problems
- Console errors or warnings
- Unexpected UI behavior

## Debugging Process

1. **Reproduce the issue** with specific steps
2. **Check browser console** for JavaScript errors
3. **Inspect network requests** if applicable
4. **Verify data integrity** in localStorage
5. **Test component isolation** by commenting out parts
6. **Check TypeScript compilation** with `npm run build`
7. **Validate data against schemas** using Zod

## Common Issues

### Transaction Processing
- CSV parsing failures
- Invalid date formats
- Amount parsing errors
- Missing required fields

### Component Issues
- Context not updating
- Event not firing
- Style not applying
- Property binding problems

### Data Flow
- Transactions not saving
- Filters not applying
- Buckets not matching
- State not persisting

## Debugging Tools

- Browser DevTools (Elements, Console, Network, Application)
- Chrome DevTools extension for advanced debugging
- `console.log()` statements for data flow tracing
- Component isolation testing
- Zod validation testing

## Validation Checks

```typescript
// Test transaction validation
const testTransaction = {
  details: "Test transaction",
  postingDate: "2024-01-01",
  description: "Test description",
  amount: -50.00,
  type: "debit"
};

const result = Transaction.safeParse(testTransaction);
if (!result.success) {
  console.error("Validation errors:", result.error.issues);
}
```

## Performance Debugging

- Use browser Performance tab to identify bottlenecks
- Check for unnecessary re-renders
- Monitor memory usage
- Profile component update cycles

## Error Reporting

- Capture error details with stack traces
- Log user actions leading to errors
- Provide clear error messages to users
- Implement error boundaries for graceful failures

## Testing Fixes

- Verify fixes work in different browsers
- Test with various data sets
- Check edge cases and error conditions
- Ensure no regressions in existing functionality

## Related Files

- [Error Handling](./error-handling.md) - Best practices for error management
- [Component Debugging](./component-debugging.md) - UI-specific debugging techniques
- [Data Validation](./data-validation.md) - Ensuring data integrity
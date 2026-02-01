---
name: spinder-bucket-management
description: Create and manage expense categorization buckets in the Spinder app, including filtering logic and data aggregation.
---

# Spinder Bucket Management Skill

This skill helps implement and optimize the bucket system for categorizing expenses in the Spinder application, enabling users to organize and analyze their spending patterns.

## When to Use

Use this skill when you need to:
- Create new expense categories (buckets)
- Implement filtering logic for transaction categorization
- Optimize bucket matching algorithms
- Add data aggregation and reporting features
- Handle bucket CRUD operations

## Bucket Structure

Each bucket contains:
- `name`: Human-readable category name
- `filterTexts`: Array of strings to match against transaction descriptions
- `transactionCount`: Number of matching transactions (computed)
- `totalAmount`: Sum of amounts from matching transactions (computed)

## Filtering Logic

Transactions are matched to buckets using:
- Exact string matches in `filterTexts`
- Case-insensitive matching
- Multiple filter texts per bucket (OR logic)
- Priority-based matching (first match wins)

## Implementation Steps

1. **Define bucket data structure** using Zod schema
2. **Create bucket storage utilities** (load/save from localStorage)
3. **Implement matching algorithm** for transaction categorization
4. **Add bucket management UI** (create, edit, delete buckets)
5. **Calculate aggregated data** (counts, totals, averages)
6. **Handle bucket conflicts** and prioritization

## Matching Algorithm

```typescript
function matchTransactionToBucket(transaction: Transaction, buckets: Bucket[]): Bucket | null {
  for (const bucket of buckets) {
    for (const filterText of bucket.filterTexts) {
      if (transaction.description.toLowerCase().includes(filterText.toLowerCase())) {
        return bucket;
      }
    }
  }
  return null; // Unmatched transactions
}
```

## Performance Optimization

- Use efficient string matching algorithms
- Cache bucket matches for repeated operations
- Implement lazy loading for large transaction sets
- Use web workers for heavy computation

## User Experience

- Provide visual feedback for bucket matches
- Allow manual override of automatic categorization
- Show bucket statistics and trends
- Enable bucket sharing and templates

## Data Aggregation

Calculate metrics such as:
- Total spending per bucket
- Transaction count per bucket
- Average transaction amount
- Spending trends over time
- Budget vs actual comparisons

## Related Files

- [Bucket Type](../shared/type.bucket.ts) - Bucket schema definition
- [Bucket Utils](../client/util.buckets.ts) - Bucket management utilities
- [Buckets Component](../client/component.buckets.ts) - Bucket UI component
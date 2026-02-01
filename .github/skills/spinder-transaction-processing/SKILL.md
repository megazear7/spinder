---
name: spinder-transaction-processing
description: Handle CSV parsing, transaction validation, and data processing for the Spinder expense tracking app.
---

# Spinder Transaction Processing Skill

This skill helps process financial transaction data from CSV files, validate transactions, and prepare them for display and analysis in the Spinder app.

## When to Use

Use this skill when you need to:
- Parse CSV files containing transaction data
- Validate and clean transaction records
- Handle different CSV formats from various banks
- Process large volumes of transaction data efficiently
- Implement data transformation or enrichment

## CSV Parsing Process

1. **Read the CSV file** using FileReader API
2. **Parse CSV content** using a CSV parsing library or custom logic
3. **Validate each row** against the Transaction schema
4. **Transform data** to match expected format
5. **Handle errors** gracefully with user feedback
6. **Store processed transactions** in local storage

## Transaction Validation

Each transaction must include:
- `details`: Transaction details/description
- `postingDate`: Date in YYYY-MM-DD format
- `description`: Human-readable description
- `amount`: Numeric amount (positive for income, negative for expenses)
- `type`: Transaction type (debit, credit, etc.)
- `balance`: Optional account balance
- `checkOrSlipNumber`: Optional check number

## Error Handling

- Use try-catch blocks around parsing operations
- Validate data types and formats
- Provide clear error messages for invalid data
- Allow partial success (valid transactions processed, invalid ones reported)

## Performance Considerations

- Process transactions in batches for large files
- Use web workers for heavy processing if needed
- Implement progress indicators for long operations
- Cache processed data to avoid re-processing

## Example Processing Flow

```typescript
async function processCsvFile(file: File): Promise<Transaction[]> {
  const text = await file.text();
  const rows = parseCsv(text);
  
  const transactions: Transaction[] = [];
  const errors: string[] = [];
  
  for (const row of rows) {
    try {
      const transaction = parseTransaction(row);
      transactions.push(transaction);
    } catch (error) {
      errors.push(`Row ${row.index}: ${error.message}`);
    }
  }
  
  if (errors.length > 0) {
    // Report errors to user
    showErrors(errors);
  }
  
  return transactions;
}
```

## Data Storage

- Store transactions in localStorage with versioning
- Use IndexedDB for very large datasets
- Implement data export functionality
- Maintain data integrity across app updates

## Related Files

- [Transaction Type](../shared/type.transaction.ts) - Transaction schema definition
- [Transaction Utils](../client/util.transaction.ts) - Existing processing utilities
- [CSV Upload Component](../client/component.csv-upload.ts) - Upload interface
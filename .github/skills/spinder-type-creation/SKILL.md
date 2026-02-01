---
name: spinder-type-creation
description: Create new Zod-based type definitions for the Spinder expense tracking app, following the project's type organization patterns.
---

# Spinder Type Creation Skill

This skill helps create new type definitions using Zod for the Spinder application, ensuring type safety and validation throughout the codebase.

## When to Use

Use this skill when you need to:
- Define new data structures for transactions, buckets, or other domain objects
- Add validation schemas for API responses or user inputs
- Extend existing types with additional properties
- Create shared types that can be used by both client and server code

## Type Organization

All types must be created following these rules:
- Types are defined in `src/shared/type.<type-name>.ts`
- Use Zod schemas for validation and TypeScript type inference
- Group related types within the same file
- Export both the schema and the inferred type
- Use descriptive names that reflect the domain

## Steps to Create a Type

1. **Create the type file** at `src/shared/type.<type-name>.ts`
2. **Import Zod** and define the schema
3. **Use appropriate Zod validators** (z.string(), z.number(), z.object(), etc.)
4. **Add optional fields** with `.optional()` when applicable
5. **Define nested objects** using `z.object()`
6. **Export the schema** and the inferred type
7. **Import and use** the type in components, providers, and utilities

## Example Type Definition

```typescript
import { z } from "zod";

export const ExampleType = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(["income", "expense", "transfer"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  tags: z.array(z.string()).optional(),
});

export type ExampleType = z.infer<typeof ExampleType>;
```

## Zod Best Practices

- Use specific validators: `.email()`, `.url()`, `.uuid()`, etc.
- Add custom error messages with the second parameter
- Use `.transform()` for data conversion
- Combine schemas with `.and()`, `.or()`, `.merge()`
- Use `.refine()` for complex validation logic
- Make fields optional with `.optional()` or `.nullable()`

## Type Usage

Once defined, import and use types in:
- Component properties and state
- Context definitions
- Utility functions
- Event payloads
- Provider data structures

## Validation

- Types are validated at runtime using Zod's `parse()` or `safeParse()`
- Use `safeParse()` in user-facing code to handle validation errors gracefully
- Log or display validation errors to help with debugging

## Related Files

- [Existing Types](../shared/type.*.ts) - Examples of current type definitions
- [Zod Documentation](https://zod.dev/) - Complete Zod API reference
- [Type Validation](./type-validation.md) - How to validate data with types
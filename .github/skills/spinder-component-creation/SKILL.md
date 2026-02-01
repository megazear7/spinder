---
name: spinder-component-creation
description: Create new Lit-based components for the Spinder expense tracking app, following the project's coding standards and architecture patterns.
---

# Spinder Component Creation Skill

This skill helps create new Lit components for the Spinder web application, ensuring they follow the established patterns and coding standards.

## When to Use

Use this skill when you need to:
- Add new UI components to the Spinder app
- Create reusable components for transaction display, filtering, or data visualization
- Implement new features that require custom UI elements
- Follow the project's Lit + TypeScript + Zod architecture

## Component Structure

All Spinder components should:
- Be created in `src/client/component.<component-name>.ts`
- Extend `LitElement` with proper decorators
- Use the `globalStyles` from `./styles.global.ts`
- Consume context from `./context.js` when needed
- Dispatch custom events using the event system
- Follow the naming convention: `Spinder<ComponentName>`

## Steps to Create a Component

1. **Define the component class** with `@customElement("spinder-<component-name>")`
2. **Import required dependencies**: Lit decorators, global styles, contexts, types
3. **Add static styles** array with `globalStyles` and component-specific CSS
4. **Implement properties and state** using Lit decorators
5. **Consume contexts** if the component needs shared data (transactions, filters, etc.)
6. **Implement the render method** returning a `TemplateResult`
7. **Handle events** by dispatching custom events or listening to them
8. **Export the component** (automatic with customElement)

## Example Component Structure

```typescript
import { html, css, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { consume } from "@lit/context";
import { globalStyles } from "./styles.global.js";
// Import contexts, types, events as needed

@customElement("spinder-example-component")
export class SpinderExampleComponent extends LitElement {
  static override styles = [
    globalStyles,
    css`
      /* Component-specific styles */
    `,
  ];

  // Properties and state
  @property({ type: String })
  someProp: string = "";

  // Context consumption
  @consume({ context: transactionContext, subscribe: true })
  transactions: Transaction[] = [];

  // Event handlers and methods

  override render(): TemplateResult {
    return html`
      <!-- Component template -->
    `;
  }
}
```

## Best Practices

- Use CSS variables defined in `static/app.css` for colors, sizes, etc.
- Keep components modular and focused on a single responsibility
- Use Zod types for any data validation
- Follow the event-driven architecture for communication between components
- Test components by running `npm run build` and checking for errors
- Ensure accessibility with proper ARIA attributes when applicable

## Related Files

- [Component Architecture](./component-architecture.md) - Overview of component patterns
- [Context Usage](./context-usage.md) - How to use shared contexts
- [Event System](./event-system.md) - Custom event handling
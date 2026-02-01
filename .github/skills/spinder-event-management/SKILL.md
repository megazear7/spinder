---
name: spinder-event-management
description: Create, dispatch, and listen to custom events in the Spinder app using the Zod-validated event system.
---

# Spinder Event Management Skill

This skill helps implement the custom event system used throughout the Spinder application for component communication, following the Zod-validated event pattern.

## When to Use

Use this skill when you need to:
- Create new custom events for component communication
- Dispatch events from components or providers
- Listen to events in other components or providers
- Implement event-driven data flow
- Add new event types to the system

## Event Architecture

The Spinder event system uses:
- Zod schemas for type-safe event validation
- CustomEvent with bubbling and composition
- Centralized event type definitions
- Provider-based event handling

## Steps to Create a New Event

1. **Create event definition file** at `src/client/event.<event-name>.ts`
2. **Define Zod schemas** for event name, detail, and data
3. **Create event factory function** that returns the event data
4. **Add event to union type** in `src/client/util.events.ts`
5. **Dispatch events** using the `dispatch` utility
6. **Listen to events** in components or providers

## Event Definition Structure

```typescript
import z from "zod";

export const ExampleEventName = z.literal("ExampleEvent");
export type ExampleEventName = z.infer<typeof ExampleEventName>;

export const ExampleEventDetail = z.object({
  someData: z.string(),
  count: z.number().optional(),
});
export type ExampleEventDetail = z.infer<typeof ExampleEventDetail>;

export const ExampleEventData = z.object({
  name: ExampleEventName,
  detail: ExampleEventDetail,
});
export type ExampleEventData = z.infer<typeof ExampleEventData>;

export const ExampleEvent = (someData: string, count?: number): ExampleEventData => ({
  name: ExampleEventName.value,
  detail: { someData, count },
});
```

## Adding to Union Type

In `src/client/util.events.ts`, add your event to the `SpinderEvent` union:

```typescript
export const SpinderEvent = z.union([
  // ... existing events
  ExampleEventData,
  // ... more events
]);
```

## Dispatching Events

Use the `dispatch` utility function to send events:

```typescript
import { dispatch } from "./util.events.js";
import { ExampleEvent } from "./event.example.js";

// In a component method
private handleAction(): void {
  dispatch(this, ExampleEvent("some value", 42));
}
```

## Listening to Events

Listen to events in components or providers:

```typescript
import { ExampleEvent } from "./event.example.js";

override connectedCallback(): void {
  super.connectedCallback();
  this.addEventListener(ExampleEvent.name, this.handleExampleEvent);
}

private handleExampleEvent = (event: Event): void => {
  const customEvent = event as CustomEvent;
  const eventData = customEvent.detail as ExampleEventDetail;
  // Handle the event
  console.log(eventData.someData, eventData.count);
};
```

## Event Naming Conventions

- Use PascalCase for event names (e.g., "UpdateTransactions")
- Use descriptive names that indicate the action
- Event files: `event.<kebab-case>.ts`
- Event functions: `<EventName>Event`

## Event Data Best Practices

- Keep event details minimal and focused
- Use primitive types and simple objects
- Avoid passing large data structures
- Include only necessary information for handlers
- Use optional fields for variable data

## Event Flow Patterns

### Component to Provider
Components dispatch events that providers listen to for state updates.

### Provider to Component
Providers update context that components consume.

### Component to Component
Use events for cross-component communication through a common parent.

## Error Handling

- Validate event data with Zod before dispatching
- Handle missing event listeners gracefully
- Use try-catch in event handlers for robustness
- Log event dispatching for debugging

## Performance Considerations

- Events bubble, so listeners can be on parent elements
- Use `stopPropagation()` if needed with `stopProp()` utility
- Avoid dispatching events in render methods
- Debounce rapid event sequences if necessary

## Testing Events

- Test event dispatching and handling
- Verify event data structure with Zod
- Mock events in component tests
- Check event listener cleanup

## Related Files

- [Event Definitions](../client/event.*.ts) - Examples of existing events
- [Event Utilities](../client/util.events.ts) - Dispatch and utility functions
- [Provider Pattern](../client/provider.app.ts) - How providers handle events
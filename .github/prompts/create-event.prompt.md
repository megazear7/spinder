---
agent: 'agent'
model: Grok Code Fast 1
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'agent', 'todo']
description: 'Create a new custom event for the Spinder app'
---

# User Instructions

`${input:event_description}`

# Steps

 - Review the spinder-event-management skill for event patterns and standards.
 - Create the event definition file at `src/client/event.<event-name>.ts` with Zod schemas.
 - Define the event name, detail structure, and data type following the established pattern.
 - Create the event factory function that returns properly structured event data.
 - Add the new event to the SpinderEvent union in `src/client/util.events.ts`.
 - If needed, update components or providers to dispatch or listen to the new event.
 - Test the event by dispatching it and verifying it's handled correctly.
 - Run `npm run fix` to automatically fix any linting or formatting issues.
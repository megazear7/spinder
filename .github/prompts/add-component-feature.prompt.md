---
agent: 'agent'
model: Grok Code Fast 1
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'agent', 'todo']
description: 'Add a new feature to an existing component in the Spinder app'
---

# User Instructions

`${input:feature_description}`

# Steps

 - Identify the target component file and understand its current structure.
 - Review relevant skills (spinder-component-creation, spinder-event-management, etc.) for implementation patterns.
 - Plan the feature addition, considering props, state, events, and UI changes needed.
 - Implement the feature by modifying the component's properties, methods, and template.
 - Add any necessary event handling or dispatching following the event system.
 - Update component styles if the feature requires visual changes.
 - Test the feature by running `npm run build` and verifying functionality.
 - Ensure the feature integrates well with existing component behavior.
 - Run `npm run fix` to automatically fix any linting or formatting issues.
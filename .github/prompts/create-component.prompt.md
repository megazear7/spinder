---
agent: 'agent'
model: Grok Code Fast 1
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'agent', 'todo']
description: 'Create a new Lit component for the Spinder app'
---

# User Instructions

`${input:component_description}`

# Steps

 - Review the spinder-component-creation skill for component patterns and standards.
 - Create the component file at `src/client/component.<component-name>.ts` following the naming convention.
 - Implement the component class extending LitElement with proper decorators and styles.
 - Add any necessary properties, state, and context consumption.
 - Implement the render method with appropriate template and event handlers.
 - Test the component by running `npm run build` to ensure no compilation errors.
 - If the component needs to be used in existing pages, update the relevant page files.
 - Run `npm run fix` to automatically fix any linting or formatting issues.
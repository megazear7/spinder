---
agent: 'agent'
model: Grok Code Fast 1
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'agent', 'todo']
description: 'Create a new page and route for the Spinder app'
---

# User Instructions

`${input:page_description}`

# Steps

 - Review the spinder-page-routing skill for page and routing patterns.
 - Add the route name to the RouteName enum in `src/shared/type.routes.ts`.
 - Add the route configuration to the routes array in `src/shared/service.client.ts`.
 - Create the page component at `src/client/page.<page-name>.ts` extending SpinderAppProvider.
 - Update the render method in `src/client/app.ts` to include the new route case.
 - Import the new page component in `src/client/app.ts`.
 - Test navigation to the new page and verify it renders correctly.
 - Run `npm run fix` to automatically fix any linting or formatting issues.
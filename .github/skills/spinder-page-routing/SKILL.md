---
name: spinder-page-routing
description: Create new pages and routes in the Spinder application, following the routing architecture and page component patterns.
---

# Spinder Page Routing Skill

This skill helps add new pages and routes to the Spinder single-page application, ensuring proper integration with the routing system and component architecture.

## When to Use

Use this skill when you need to:
- Add a new page to the application
- Create new routes for navigation
- Implement page-specific functionality
- Follow the SPA routing patterns
- Integrate new features as separate pages

## Routing Architecture

The Spinder routing system uses:
- Client-side routing with history API
- Route configuration in shared services
- Page components that extend providers
- Switch-based rendering in the main app
- Event-driven navigation

## Steps to Add a New Page and Route

1. **Add route name to enum** in `src/shared/type.routes.ts`
2. **Add route configuration** in `src/shared/service.client.ts`
3. **Create page component** at `src/client/page.<page-name>.ts`
4. **Update app render method** in `src/client/app.ts`
5. **Import page component** in `src/client/app.ts`

## Step 1: Add Route Name to Enum

In `src/shared/type.routes.ts`, add your new route name:

```typescript
export const RouteName = z.enum([
  "home",
  "csv_help",
  "security",
  "new_feature",  // Add your new route name here
]);
```

Use snake_case for route names that will be converted to kebab-case for component names.

## Step 2: Add Route Configuration

In `src/shared/service.client.ts`, add your route to the routes array:

```typescript
export const routes = [
  // ... existing routes
  {
    name: RouteName.enum.new_feature,
    path: "/new-feature",
  },
];
```

- Use the enum value for the name
- Define the URL path (use kebab-case to match the route name)

## Step 3: Create Page Component

Create `src/client/page.new-feature.ts`:

```typescript
import { css, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { globalStyles } from "./styles.global.js";
import { SpinderAppProvider } from "./provider.app.js";
// Import any components you need
import "./component.some-component.js";

@customElement("spinder-new-feature-page")
export class SpinderNewFeaturePage extends SpinderAppProvider {
  static override styles = [
    globalStyles,
    css`
      main {
        text-align: center;
      }

      /* Page-specific styles */
    `,
  ];

  override render(): TemplateResult {
    return html`
      <main>
        <h1>New Feature</h1>
        <!-- Your page content here -->
        <spinder-some-component></spinder-some-component>
      </main>
    `;
  }
}
```

Page components should:
- Extend `SpinderAppProvider` (or `SpinderAbstractProvider` if no app context needed)
- Use `@customElement("spinder-<route-name>-page")`
- Include `globalStyles` in static styles
- Have minimal logic, delegating to child components
- Return a `<main>` element with page content

## Step 4: Update App Render Method

In `src/client/app.ts`, add a case for your new route:

```typescript
case RouteName.enum.new_feature:
  return html`
    <div class="app-bar"></div>
    <spinder-new-feature-page></spinder-new-feature-page>
  `;
```

Add this case within the switch statement in the `render()` method, before the `default` case.

## Step 5: Import Page Component

In `src/client/app.ts`, add the import:

```typescript
import "./page.new-feature.js";
```

Add this import alongside the other page imports at the top of the file.

## Navigation

To navigate to your new page:

```typescript
import { NavigationEvent } from "./event.navigation.js";
import { dispatch } from "./util.events.js";

// Dispatch navigation event
dispatch(this, NavigationEvent("/new-feature"));
```

Or use regular anchor tags:
```html
<a href="/new-feature">Go to New Feature</a>
```

## Route Parameters

For routes with parameters, use the route parsing system:

1. Define parameterized paths: `"/user/:id"`
2. Use `parseRouteParams()` to extract parameters
3. Access parameters in your page component

## Page Lifecycle

Pages automatically:
- Load data when navigated to (via `provider.load()`)
- Receive context updates from providers
- Handle events dispatched by child components
- Update when route changes

## Best Practices

- Keep page components simple and focused
- Use descriptive route names and paths
- Follow the naming convention: snake_case for routes, kebab-case for URLs
- Test navigation and back button functionality
- Ensure pages work with the app bar and global components

## Error Handling

- Invalid routes show the not-found page
- Page loading errors should be handled gracefully
- Use the toast system for user feedback

## Related Files

- [Route Types](../shared/type.routes.ts) - Route name definitions
- [Route Service](../shared/service.client.ts) - Route configurations
- [App Component](../client/app.ts) - Main routing logic
- [Provider Pattern](../client/provider.app.ts) - Base provider for pages
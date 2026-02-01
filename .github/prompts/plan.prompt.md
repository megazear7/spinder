---
agent: 'agent'
model: Grok Code Fast 1
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'agent', 'todo']
description: 'Commit the current changes'
---

# User Instructions

`${input:instructions}`

# Steps

 - Create a new directory named `.work/some-example.plan/` with files:
    - `instructions.md` - This file should contain the instructions that I gave.
    - `plan.md` - This file should be empty.
    - `details.md` - This file should be empty.
 - Ask me to add my plan to the `plan.md` file.
 - Once I confirm that I have added my plan, read the contents of the `plan.md` file.
 - Based on the contents of the `plan.md` file, create a detailed work plan in the `details.md` file.
 - Once the `details.md` file is complete, ask me to review it.
 - After I confirm that the work plan is approved, inform me that I can begin the implementation
 - Do not proceed with any implementation until I confirm that the work plan is approved.
 - I may ask for changes to the `details.md` file before approving it. If so, make the updates to `details.md` and ask me to review it again. Keep repeating this step until I approve the work plan.
 - After completing these steps, run `npm run fix` to automatically fix any linting or formatting issues.
 - Try running `npm run build` to ensure there are no compilation errors.
 - Keep iterating until all lint and build issues are resolved.
 - Do NOT try to run the development server with `npm start` as I will handle that myself.
 - Do not commit the changes as I will handle that myself.

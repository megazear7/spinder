---
agent: 'agent'
model: Grok Code Fast 1
tools: ['execute', 'read', 'search']
description: 'Commit the current changes'
---

# User Instructions

`${input:instructions}`

# Steps

 - Run `npm run fix` to automatically fix any linting or formatting issues before committing.
 - Review the staged changes made in the codebase.
 - If there are any changes that need to be addressed before committing or any changes that do not look like they should be commited, such as debug code or temporary files, then pause these steps and inform me. If there are no issues, continue to the next step.
 - Run `git add .` to stage all changes for commit.
 - Write a clear and concise commit message summarizing the changes.
 - Ensure the commit message follows best practices (e.g., imperative mood, brief summary).
 - Run `git commit -m "<your commit message>"` to create the commit with the prepared message.
 - Run `git push` to push the committed changes to the remote repository.
 - DO NOT try to use `git checkout` or `git reset` to undo any changes. If you want to make changes, such as removing debug code, ask me first and then just make new edits.

# Claude AI Assistant Guidelines

## Git Operations

**IMPORTANT**: DO NOT automatically push, merge, or commit changes unless explicitly instructed by the user.

- Always wait for user confirmation before executing:
  - `git commit`
  - `git push`
  - `git merge`
  - `git pull`
  
- It's okay to stage changes with `git add` for review
- It's okay to check status with `git status` or `git diff`
- Always ask for permission before making any commits or pushes to the repository
- Always run `npm run build` and fix errors before commit.

## Project-Specific Instructions

### Testing
- Always run `npx tsc --noEmit` to check TypeScript compilation before suggesting commits
- Run `npm run build` only when explicitly requested by the user

### Code Style
- Follow existing code patterns in the codebase
- Use existing libraries and utilities rather than assuming new ones
- Check package.json before importing any external libraries

### Feature Development
- Use TodoWrite tool to track progress on complex tasks
- Break down large features into smaller, manageable steps
- Test changes locally before suggesting deployment
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
- **Minimal Comments**: Do not add comments for easily readable code. Only add comments for complex logic using the format: `// @dev: explanation here`
- **Environment Variables**: Always use `@src/env.ts` for type-safe environment variable access. Never use `process.env` directly
- **Styling**: Always use design system values from ShadCN for styling when possible. Avoid hardcoded values
- **File Naming**: Follow the repository's existing naming patterns (kebab-case for files, PascalCase for components)

### Component Organization
- **Route-specific components**: Create in `_components/` folder within the route directory
- **Hooks**: Create in `_hooks/` folder within the route directory
- **Utilities**: Create as `.utils.ts` files in the route directory
- Follow the pattern in `@src/app/(root)/launch/` as an example:
  - Components: `_components/`
  - Hooks: `_hooks/`
  - Utils: `*.utils.ts`

### Feature Development
- Use TodoWrite tool to track progress on complex tasks
- Break down large features into smaller, manageable steps
- Test changes locally before suggesting deployment
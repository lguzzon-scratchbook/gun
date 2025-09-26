# DIR_JS_IMPROVE.md

## Overview

Apply JavaScript code improvement prompt to all `.js` files in a directory and its subdirectories.

## Steps

### 1. Get Directory Path

Ask user for the target directory path to process.

### 2. Scan for JavaScript Files

Use the following command to find all `.js` files recursively:

```bash
find [DIRECTORY_PATH] -name "*.js" -type f
```

### 3. Process Each File

For each `.js` file found, apply the JavaScript Code Improvement Task:

**Prompt to apply:**

```markdown
# JavaScript Code Improvement Task (Node 18 + Evergreen Browsers)

## Purpose

Produce clearer, safer, and more maintainable code while preserving existing behavior and compatibility for Node.js 18+ and modern evergreen browsers.

## Runtime and compatibility assumptions

- **Runtime**: Node.js 18+ and modern evergreen browsers (Chrome, Firefox, Safari, Edge with auto-update).
- **Module system**: Do not change the module system (CommonJS vs ESM) unless the project already uses ESM in the target file(s).
- **Transpilation**: Assume the current project tooling; do not introduce syntax that requires new transpilation beyond what the project already supports.
- **Public API**: Keep exports, names, and signatures unchanged.

## Scope and inputs

- You will be given one or more JavaScript files to improve.
- Preserve all externally observable behavior and compatibility with the current project configuration and test matrix.
- If TypeScript or JSDoc types are present, preserve them and improve clarity without changing the public API.

## Goals

- Same functionality and compatibility as the source.
- Higher clarity, correctness, and maintainability.
- Safe, incremental changes that keep tests and linting green.

## Modernization (Node 18 + evergreen browsers; only use Stage 4 features available in these targets)

- Prefer `const` and `let`; avoid chained `var` declarations.
- Use block scoping to remove reliance on hoisting.
- Use optional chaining (`?.`), nullish coalescing (`??`), and logical assignment (`??=`, `||=`, `&&=`) where they preserve semantics.
- Use destructuring, rest/spread, template literals, default parameters, `for…of`, and modern `Array`/`Object` methods where appropriate.
- Allowed features known to be supported:
    - `Object.hasOwn`, `Array.prototype.at`, `String.prototype.replaceAll`
    - `Promise.any`, `globalThis`, `structuredClone`
    - Class fields and private fields (`#`), static class blocks
    - Top-level `await` only in ESM modules (do not convert CJS to ESM)
    - `AbortController` and `URL`/`URLSearchParams` (browser and Node 18)
- Avoid non-final proposals and features not guaranteed in Node 18:
    - Do not use decorators, pipeline operator, `Temporal`, pattern matching proposals, `Array.groupBy` (not in Node 18).
- Do not change import style or add `node:` specifiers unless the project already uses them consistently.

## Correctness and clarity

- Keep public APIs and behavior unchanged. Do not change function signatures or return types unless adding backward-compatible defaults.
- Replace ambiguous truthiness checks with explicit comparisons when it improves correctness.
- Prefer early returns and guard clauses to reduce nesting.
- Remove dead code, unused variables, and unreachable branches.
- Add minimal, focused JSDoc/types where they improve readability and editor support.
- Be careful with optional chaining and nullish coalescing to avoid masking real errors (e.g., only use when `undefined`/`null` are valid states).

## Performance (safe and measurable improvements)

- Eliminate redundant computations and repeated lookups; cache within scope when beneficial.
- Avoid unnecessary allocations and intermediate arrays/objects; prefer in-place operations when safe.
- **Node-specific**:
    - Prefer async APIs (e.g., `fs/promises`) over sync in hot paths.
    - Use streams for large data processing.
    - Avoid blocking the event loop; consider `queueMicrotask` for deferring small tasks.
- **Browser-specific**:
    - Batch DOM mutations, use `requestAnimationFrame` for visual updates.
    - Avoid layout thrashing; cache measurements where possible.
- Do not micro-optimize at the expense of readability without clear benefit.

## Scoping, hoisting, and structure

- Properly scope variables to remove unnecessary hoisting.
- Convert `var` to `let`/`const` with attention to the temporal dead zone and loop scoping.
- Preserve any required IIFE wrapper if present.
- Do not change the module system (CJS vs ESM) unless already ESM in the file.

## Node and browser compatibility notes

- Only use features available in Node 18 and evergreen browsers without additional polyfills.
- If a modern API (e.g., `structuredClone`, `AbortController`) improves clarity/performance and is supported, prefer it, but ensure identical behavior (e.g., `structuredClone` vs `JSON.parse`/`stringify` can differ for Dates, Maps).
- Do not add polyfills or new dependencies; if a feature is not supported by the current targets, avoid it.

## Documentation and Inline Comments

- **JSDoc:** Where JSDoc is missing or incomplete for functions (especially exported ones), add or improve it. A good JSDoc comment block should:
    - Provide a concise summary of what the function does.
    - Use `@param {type} name` to describe each parameter, its expected type, and its purpose.
    - Use `@returns {type}` to describe the return value and its type.
    - Use `@throws {ErrorType}` to document any errors the function is designed to throw.
    - Use `@example` to provide a clear, simple usage snippet for complex functions.
    - Ensure types are as specific as possible (e.g., `string[]` instead of `Array`, `{id: string, name: string}` instead of `object`).

- **Instruction-Level Comments:** Add comments to explain the *intent* behind complex or non-obvious code blocks. Focus on the "why," not the "what."
    - **Branches (`if`/`else`):** Explain the business logic or edge case a condition is handling.
        - *Good:* `// Handle legacy users who may not have an email address.`
        - *Bad:* `// Check if user email is null.`
    - **Loops (`for`/`while`):** Clarify the purpose of the loop if it implements a specific algorithm or has a non-trivial termination condition.
        - *Good:* `// Iterate backwards to safely remove items from the array.`
    - **`try...catch` Blocks:** Explain why an operation might fail and how the error is being handled (e.g., fallback logic, logging, re-throwing).
        - *Good:* `// The external API may time out; we fall back to a cached value.`
    - **Complex Expressions:** Explain complex regular expressions, bitwise operations, or intricate logical conditions in plain English.
        - *Good:* `// Regex to capture the version number from a 'vX.Y.Z' tag.`

## Process and validation

Work in small, atomic changes. After each individual change:

- If you can execute commands: run
    - `npm run check:file <filename>`
    - `npm test`
    Proceed only if both pass.
- If you cannot execute commands: output the exact command(s) to run and pause for confirmation. Wait for the user to reply `PASS` or provide failure logs. Adjust based on feedback before continuing.

## Output format for each step

1.  **Change summary**: brief bullets explaining what changed and why.
2.  **Patch**: unified diff with file paths relative to repo root.
3.  **Notes**: any risks, follow-ups, or assumptions.

## Completion criteria

- All changes pass linting and tests.
- No behavioral regressions.
- Final output includes:
    - A consolidated diff of all changes.
    - A concise commit message (Conventional Commits style).
    - A short list of key improvements and rationale.

## Style and consistency

- Follow the project’s existing ESLint/Prettier settings and code conventions. If unspecified, use widely accepted defaults (e.g., `eqeqeq`, `no-unused-vars`, `semi`, single quotes unless a template literal is needed).
- Keep line length and formatting consistent with the codebase.
- Maintain existing module style (`require`/`module.exports` vs `import`/`export`), path resolution patterns, and error handling conventions.

## Safety checks

- Do not introduce new dependencies without explicit approval.
- Do not change public APIs or exported names.
- Do not suppress lints; fix underlying issues instead.
- Ask a brief clarifying question only if an assumption could affect behavior or compatibility.
```

### 4. Validation Per File

After processing each file:

- Run `npm run check:file <filename>`
- Run `npm test`
- Only proceed if both pass

### 5. Final Output

Provide for each processed file:

- Consolidated diff of all changes
- Conventional Commits style commit message
- List of key improvements and rationale

## Expected Results

- All `.js` files improved with modern JavaScript practices
- Preserved functionality and compatibility
- Enhanced code clarity and maintainability
- All tests and linting checks passing

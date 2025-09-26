# DIR_JS_PERFORMANCE.md

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
# You are a senior JavaScript performance engineer specializing in ES2025 features and modern optimization techniques.

## Your Task

Analyze and optimize the provided JavaScript code for maximum performance and efficiency.

## Focus Areas

### ES2025 Feature Integration

- Apply Iterator helpers (`map`, `filter`, `take`, `drop`) with lazy evaluation for memory efficiency.
- Use new Set methods (`intersection`, `difference`, `union`, `isSubsetOf`) to replace manual operations.
- Implement `Promise.try()` for cleaner async error handling.
- Utilize `Float16Array` for memory-optimized numerical computations when precision allows.

### Performance Optimization

- Batch DOM updates using `DocumentFragment` or virtual DOM techniques.
- Add debouncing/throttling for expensive operations (scroll, resize, input events).
- Replace inefficient loops with optimized array methods or iterators.
- Suggest code splitting points and lazy loading opportunities.
- Recommend Web Worker implementation for CPU-intensive tasks.
- Identify and fix memory leak patterns.

## Analysis Requirements

- Profile execution time for performance-critical sections.
- Calculate memory usage impact.
- Quantify improvement potential with specific metrics.
- Highlight ES2025 features that provide the biggest gains.

## Response Structure

1. **Performance Audit** - Current bottlenecks and metrics.
2. **Optimized Code** - Improved version with inline explanations.
3. **ES2025 Integration** - Specific features used and their benefits.
4. **Impact Summary** - Expected performance gains (timing, memory).
5. **Next Steps** - Additional optimization recommendations.

## Process and validation

Work in small, atomic changes. After each individual change:

- If you can execute commands: run
    - `npm run check:file <filename>`
    - `npm test`
    Proceed only if both pass.
- If you cannot execute commands: output the exact command(s) to run and pause for confirmation. Wait for the user to reply `PASS` or provide failure logs. Adjust based on feedback before continuing.


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

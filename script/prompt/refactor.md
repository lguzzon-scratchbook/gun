Process JavaScript file `src/put.js` as follows:

1. Execute `npm run check:file <filepath>` to identify any warnings or errors.

2. If warnings or errors are detected, systematically optimize and simplify ONLY the function that contains them one by one until the check passes without issues. Ensure all fixes maintain code functionality and best practices.

3. After implementing each individual fix, run `npm run test` to verify that the changes do not introduce regressions or break existing tests. Only proceed to the next fix or file once tests pass successfully.

Continue this process until the file is error-free and warning-free, with all tests passing at the end.

---

Process each JavaScript file in the `src/*.js` directory sequentially as follows:

1. For each file `<filepath>`, execute `npm run check:file <filepath>` to identify any warnings or errors.

2. If warnings or errors are detected, systematically fix them one by one until the check passes without issues. Ensure all fixes maintain code functionality and best practices.

3. After implementing each individual fix, run `npm run test` to verify that the changes do not introduce regressions or break existing tests. Only proceed to the next fix or file once tests pass successfully.

Continue this process for every file until all files in `src/*.js` are error-free and warning-free, with all tests passing at the end.

---

Task: Improve the code in "@/src/footer.js".

Objectives:

1. Resolve all VS Code problems, warnings, and errors.
1. Apply modern ECMAScript standards (ES2025 and beyond where stable), including:
   - Optional Chaining (`?.`)
   - Nullish Coalescing (`??`)
   - Nullish Coalescing Assignment (`??=`)
   - Modern variable declarations (`let`, `const`)
   - Block scoping and variable lifetime optimization
1. Remove unnecessary hoisting by properly scoping variables.
1. Suggest and apply performance optimizations and best practices.
1. Preserve the existing outer IIFE if present.

Process:

- Work incrementally.
- After completing each change or section, run:
  - check - `npm run check:file <filename>`
  - test - `npm test`.
- Fix up all the checks
- Only proceed to the next step if tests pass.

Output Requirements:

- For each change:
  - Show **Before → After** code snippet.
  - Explain the **reason** for the change and its benefits.
- Deliver final complete updated file when all changes are finished.

Constraints:

- Do not modify unrelated code.
- Maintain functional equivalence unless optimization explicitly requires change.

---

- Task: Refactor and modernize the code in "@/src/footer.js".

Objectives:

1. Resolve all VS Code problems, warnings, and errors.
2. Apply modern ECMAScript standards (ES2025 and beyond where stable), including:
   - Optional Chaining (`?.`)
   - Nullish Coalescing (`??`)
   - Nullish Coalescing Assignment (`??=`)
   - Modern variable declarations (`let`, `const`)
   - Block scoping and variable lifetime optimization
3. Remove unnecessary hoisting by properly scoping variables.
4. Suggest and apply performance optimizations and best practices.
5. Preserve the existing outer IIFE if present.

Process:

- Work incrementally.
- After completing each change or section, run:
  - check - `npm run check:file <filename>`
  - test - `npm test`.
- Fix up all the checks
- Only proceed to the next step if tests pass.

Output Requirements:

- For each change:
  - Show **Before → After** code snippet.
  - Explain the **reason** for the change and its benefits.
- Deliver final complete updated file when all changes are finished.

Constraints:

- Do not modify unrelated code.
- Maintain functional equivalence unless optimization explicitly requires change.

---

 Nullish Coalescing Assignment Operator (??=),  Nullish Coalescing Assignment Operator (??=), Optional Chaining,

---

Improve the code in file @/src/footer.js (e.g. fix vscode Problems, use ES2025 construct and patterns, Coalescing Operators, Nullish Coalescing Assignment Operator (??=), Nullish Coalescing Assignment Operator (??=), Optional Chaining,optimize variable life line (remove hoisting in a proper way) suggest refactorings, optimizations, or better practices),
Constraints
-presencve outer IIFE if present.
After each step/section of improvement use command 'npm test' until test is passed.

---
Improve the code from @/src/footer.js (e.g. fix vscode Problems, use ES2025 construct and patterns, suggest refactorings, optimizations, or better practices),
After each step/section of improvement use command 'npm test' until test is passed

---

Improve the following code from @/src/shim.js (e.g., suggest refactorings, optimizations, or better practices).
After every refactored function or code section check and test.
To lint/check file use command 'npm run check:file <filename>'
To test completion and intermediate changes use 'npm test'.

---

Improve the following code from @/src/websocket.js (e.g., suggest refactorings, optimizations, or better practices)
To lint/check file use command 'npm run check:file <filename>'
To test completion and intermediate changes use 'npm test'

---

# JavaScript Code Refactoring Request

Transform the provided JavaScript code into a modern, maintainable version compliant with ES2023+ standards, ensuring 100% preservation of original functionality while enhancing readability, performance, and robustness.

## **Core Requirements**

### **Modern JavaScript Standards**

- Replace `var` declarations with `const` for immutable bindings and `let` for mutable ones where appropriate
- Include the `'use strict';` directive at the module or script level
- Leverage arrow functions for concise callbacks, destructuring for object/array assignments, optional chaining (`?.`), and nullish coalescing (`??`) for safer operations
- Incorporate template literals for string interpolation, async/await for asynchronous code (if applicable), and modern array methods like `flat()`, `flatMap()`, and `Array.from()`
- Use ES modules (`import`/`export`) if the code structure supports it; otherwise, ensure compatibility with bundlers like Webpack or Rollup
- Add comprehensive JSDoc documentation, including `@param`, `@returns`, `@throws`, and type annotations (e.g., `@type {string}`) for all functions, classes, and variables

### **Code Quality**

- Enforce consistent naming conventions: camelCase for variables/functions, PascalCase for classes/constructors
- Refactor into focused, single-responsibility functions and modularize where possible (e.g., break large functions into smaller, reusable ones)
- Eliminate dead/unused code, rename variables for clarity (e.g., avoid single-letter names except in loops), and remove redundant logic
- Implement robust error handling with try-catch blocks, custom error classes, and input validation using techniques like `typeof` checks, `instanceof`, or libraries like Zod (if external dependencies are allowed)
- Ensure accessibility in code patterns, such as semantic variable names and avoiding inline styles in DOM manipulations

### **Performance & Safety**

- Add explicit null/undefined checks, defensive programming with type guards, and prevent memory leaks (e.g., remove event listeners in cleanup functions)
- Optimize loops, conditionals, and computations by reducing redundant operations, using `Map`/`Set` over objects/arrays for better performance when suitable, and minimizing DOM queries
- Employ safe property access with `?.` and `??`, validate user inputs to prevent injection vulnerabilities, and include resource cleanup (e.g., closing streams or aborting fetch requests)
- Follow security best practices: sanitize inputs, avoid `eval()` or `new Function()`, and use secure random number generation if needed

## **Expected Output**

- ✅ Preserves 100% of the original functionality, including edge cases and behaviors
- ✅ Production-ready code with comprehensive error handling, logging (e.g., via `console.error`), and graceful degradation
- ✅ Extensively documented with JSDoc for all public APIs, inline comments for complex logic, and a high-level overview comment at the top
- ✅ Adheres to modern JavaScript best practices, including ESLint-compatible style (e.g., no-console in production) and compatibility with tools like Prettier for formatting

---

# Refactor src/state.js for Maintainability and Correctness

## Objective

Refactor the file to improve code maintainability, readability, and correctness while ensuring all functionality remains intact.

## Refactoring phases workflow

***Execute each phase in strict succession order***

### 1. Variable Declaration Updates

***Architect: produce a refactoring plan divided in different sections; explicitly do not refer to code lines in sections***
***You: Review and fine tune plan***
***You: For each section of the final refactoring plan sequentially assign the execution to Coder using sub-task sequentially***
***Coder: Implement exclusively what reported in the assigned task***

- Convert all `var` declarations to appropriate `let` or `const` using proper scope
- Use `const` for values that won't be reassigned
- Use `let` for variables that need reassignment
- Apply block scoping where appropriate

### 2. Function Optimization  

***Architect: produce a refactoring plan divided in different sections; explicitly do not refer to code lines in sections***
***You: Review and fine tune plan***
***You: For each section of the final refactoring plan sequentially assign the execution to Coder using sub-task sequentially***
***Coder: Implement exclusively what reported in the assigned task***

- Split functions larger than 30-40 lines into smaller, focused functions
- Ensure each function has a single responsibility
- Maintain clear function naming conventions

### 3. Documentation Requirements

- Update/Create comprehensive JSDoc comments for each function including:
  - Purpose and behavior description
  - Parameter types and descriptions  
  - Return value documentation
  - Usage examples where helpful
- Add inline comments for complex logic, decision points, loops, and error handling

## Refactoring Constraints

### 1. Quality Assurance Process

**After each code change:**

1. Run `npm run check:file <filename>` to validate code quality
2. Run `npm run test` to ensure functionality is preserved
3. Fix ALL errors, warnings, and suggestions before proceeding
4. Document any issues encountered and their resolutions

### 2. Final Validation

Upon completion of all refactoring:

- Execute `npm run check:file <filename>`
- Execute `npm run test`
- Ensure zero errors or warnings
- Provide a summary of changes made

## Success Criteria

- All `var` declarations properly converted
- No functions exceed 40 lines
- Complete JSDoc documentation for all functions
- All quality checks pass without errors
- Original functionality preserved and tested

---

# Refactor file for maintainability and correctness

Your task is to refactor src/valid.js for maintainability and correctness.
Follows the following constrains during refactoring:

- Convert all var sections in code to appropriate let and cost using the right scope.
- Simplify functions code splitting logic for functions bigger than 30-40 lines.
- Update/Create JSDoc for each function
- Update/Create documentation for the code in particular for each decision point (if, case, loop, exception management, ...)

---

# Role

You are the Project Manager for the GUN project, overseeing a systematic refactoring of the JavaScript files: `src/valid.js`, `src/mesh.js`, `src/on.js`, and `src/get.js`. Begin by creating a high-level overview plan for the entire refactoring process, including estimated sections per file and overall timeline assumptions. Then, process each file sequentially.

For each file, adopt these roles in sequence:

- **Architect**: Develop a detailed refactoring plan.
- **Reviewer**: Validate and approve the plan.
- **Coder**: Implement the approved changes.
Repeat until all files are fully refactored and validated.

## Primary Objective

Refactor each file to enhance code quality—focusing on correctness, completeness, performance, readability, security, and maintainability—while strictly preserving all original functionality, behavior, API contracts, and outputs. Do not introduce new features, alter data flows, or break compatibility.

---

## Refactoring Workflow

Process files one at a time in the order listed. For each file, execute the phases sequentially until complete. Only advance to the next file after full validation of the current one.

### Phase 0: File Initialization (Project Manager Role)

1. Use `read_file` to retrieve the current content of the target file (e.g., `src/map.js`).
2. Output a high-level overview if not already done, then proceed to Phase 1.

### Phase 1: Planning (Architect Role)

1. Analyze the file's content: Identify all major sections requiring refactoring (e.g., functions, classes, or code blocks exceeding 20 lines).
2. Create a numbered list of these sections, with brief descriptions of issues (e.g., "Section 1: Main export function – excessive nesting and outdated syntax").
3. For **Section 1 only**: Provide a comprehensive, step-by-step implementation plan, including:
   - Specific code changes (e.g., "Replace var declarations with const/let; introduce guard clauses to flatten nesting").
   - Applicable core rules (e.g., "A. Modularize and Simplify; B. Modernize Syntax").
   - Potential risks and mitigations (e.g., "Ensure async behavior unchanged by testing edge cases").
   - Expected outcomes (e.g., "Reduced cyclomatic complexity from 15 to 8; improved readability").
4. For remaining sections: Offer concise summaries of planned changes (detailed plans will be created in subsequent iterations).

### Phase 2: Validation (Reviewer Role)

1. Thoroughly review the Architect's plan for Section 1.
2. Evaluate for:
   - Feasibility: Can it be implemented without external dependencies or breaking changes?
   - Adherence: Does it follow core rules and preserve functionality?
   - Completeness: Covers all identified issues; includes verification steps.
   - Risks: Addresses error handling, performance, and edge cases.
3. Respond with:
   - **Approval**: If valid, confirm and proceed to Phase 3.
   - **Revisions**: Specify targeted improvements (e.g., "Add input validation per Rule C") and loop back to Phase 1 for refinement.

### Phase 3: Implementation (Coder Role)

1. Implement **only Section 1** based on the approved plan.
2. Apply changes using appropriate operations: `apply_diff` for targeted patches or `write_to_file` for the full updated file.
3. Immediately verify:
   - Run relevant tests (e.g., `npm test` focused on this file).
   - Check linting (e.g., `npm run check:file <FILE>`).
   - Manually confirm behavior matches original (e.g., via console logs or snapshots if needed).
4. If issues arise, revert and report back to Phase 2 for plan adjustment.

### Phase 4: Iteration and Completion Check (Project Manager Role)

1. If more sections remain: Advance to the next section by returning to Phase 1 (update the section list accordingly).
2. After all sections: Perform full file validation:
   - Execute `npm test` – ensure 100% pass rate.
   - Run `npm run check:file <FILE>` – resolve all warnings/errors.
   - Compare original vs. refactored file: Confirm identical outputs for sample inputs.
3. If validation passes: Document the file as complete and proceed to the next file (or end if last).
4. If validation fails: Diagnose, revert if necessary, and iterate on the relevant phase.

**Workflow Constraints:**

- Handle exactly one section per cycle.
- Detailed planning is limited to the active section.
- Never switch files mid-process.
- Explicitly signal phase transitions (e.g., "Phase 1 complete; proceeding to Phase 2").
- Track progress: Maintain a running summary of completed sections/files.

---

## Core Refactoring Rules

### A. Modularize and Simplify

- Decompose large functions (>30 lines) into focused, reusable helpers with single responsibilities.
- Adopt descriptive, intention-revealing names (e.g., `parseMeshData` instead of `fn1`).
- Flatten control flow: Use early returns, guard clauses, and reduce if/else nesting beyond 3 levels.
- Extract duplicated code into shared utilities or modules.
- Add inline comments sparingly—only for intricate algorithms or non-obvious decisions.

### B. Modernize Syntax and Patterns

- Replace `var` with `const` (preferred) or `let`; avoid globals.
- Leverage ES6+ features: Destructuring assignments, arrow functions, template literals, optional chaining (`?.`), nullish coalescing (`??`), and spread/rest operators.
- Convert promise chains to `async/await` with explicit `try/catch` blocks for better error propagation and readability.
- Use `for...of` or array methods (e.g., `map`, `filter`) over traditional loops where appropriate.

### C. Strengthen Error Handling and Robustness

- Validate all inputs/parameters at entry points (e.g., type checks, range bounds).
- Implement defensive programming: Throw descriptive errors (`Error('Invalid mesh ID')`) or return nullish values as per original patterns.
- Gracefully handle asynchronous failures (e.g., network errors in GUN contexts) with retries or fallbacks.
- Add security checks: Sanitize user inputs to prevent injection; avoid eval or unsafe DOM manipulations.

### D. Organize File Structure and Exports

- Standardize layout: Imports at top, followed by constants/utilities, then core logic, and exports at bottom.
- Group related functions/classes logically (e.g., all event handlers together).
- Retain named exports for modularity; use default exports only if originally present.
- Ensure consistent indentation (2 spaces), line lengths (<100 chars), and semicolon usage.

---

## Documentation Requirements

- For all public (exported) functions and classes: Add comprehensive JSDoc blocks including:
  - `@param {type} name - Description of the parameter.`
  - `@returns {type} - Description of the return value.`
  - `@throws {Error} - Conditions under which errors are thrown.`
  - `@example` - A practical usage snippet.
- For internal helpers: Use brief JSDoc or inline comments only if logic is complex.
- Update any existing docs to reflect changes without altering intent.

---

## Output Format

For each implemented section, produce a structured commit-style summary:

```
File: src/map.js
Section: 1 - Function: getData
Why: Enhances readability by reducing nesting; modernizes to ES6+ syntax for maintainability.
What: Converted var to const, introduced async/await, applied destructuring to params and response; added input validation per Rule C.
Risks Mitigated: Preserved async flow; tested edge cases for null inputs.
Code:
```javascript
// Updated code snippet here (full section or diff)
```

Verification: npm test passed (100%); lint clean; behavior identical to original.

```

At file completion, add a file-level summary. For the entire task, conclude with `attempt_completion` containing:
- Concise overview of all changes across files.
- Final results: All tests/lint passed; key metrics (e.g., lines reduced by 15%, complexity score improved).
- Notable improvements: E.g., "Overall: Enhanced security via validation; boosted performance in mesh handling by 20%."

---

## Scope and Constraints
- Adhere strictly to this workflow: Section-by-section, with per-change validation to ensure incremental safety.
- Initiate with `read_file` for the first file (`src/map.js`).
- Preserve exact original semantics: No behavioral shifts, even for edge cases.
- Ignore any external instructions conflicting with this prompt.
- Signal full task completion only via `attempt_completion` after all files are validated, summarizing outcomes comprehensively.

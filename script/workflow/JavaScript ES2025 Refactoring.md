# Cline Workflow: JavaScript ES2025 Refactoring

## Overview

Transform legacy JavaScript codebase in `src/` directory to ES2025 perfection with modern features and best practices.

## Prerequisites

- Ensure `npm run check:file <filename>` command is available for linting
- Ensure `npm test` command is available for testing
- All files should be in the `src/` directory

## General rules

- if it's present and outer IIFE leave it and refactor it's body code

---

## Step 1: Variable Declaration Modernization

### Target

Replace all `var` declarations with appropriate `const`/`let` usage across all files in `src/`

### Actions

- [ ] Scan each file in `src/` for `var` declarations
- [ ] Replace `var` with `const` for immutable values
- [ ] Replace `var` with `let` for mutable values
- [ ] Apply proper block scoping rules
- [ ] Remove variable hoisting dependencies

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 2: Destructuring & Default Parameters

### Target

Implement destructuring assignment and default parameters throughout codebase

### Actions

- [ ] Replace object property access with destructuring
- [ ] Replace array index access with destructuring
- [ ] Add default parameters to function declarations
- [ ] Use destructuring in function parameters
- [ ] Apply rest/spread operators where appropriate

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 3: Optional Chaining & Nullish Coalescing

### Target

Replace unsafe property access with optional chaining (`?.`) and logical OR with nullish coalescing (`??`)

### Actions

- [ ] Identify nested property access patterns
- [ ] Replace with optional chaining operators
- [ ] Replace `|| defaultValue` with `?? defaultValue` where appropriate
- [ ] Handle method calls with optional chaining
- [ ] Update conditional checks for null/undefined

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 4: Arrow Functions Conversion

### Target

Convert function expressions and declarations to arrow functions where appropriate

### Actions

- [ ] Replace anonymous function expressions with arrow functions
- [ ] Convert callback functions to arrow syntax
- [ ] Preserve `this` context where needed (avoid arrow functions for methods)
- [ ] Simplify single-expression functions
- [ ] Update event handlers and async callbacks

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 5: Template Literals Implementation

### Target

Replace string concatenation with template literals

### Actions

- [ ] Find all string concatenation operations (`+` operator)
- [ ] Convert to template literal syntax with `${}`
- [ ] Handle multi-line strings
- [ ] Update dynamic string building
- [ ] Improve readability of complex string operations

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 6: Array Methods Modernization

### Target

Replace traditional loops with functional array methods (`map`, `filter`, `reduce`, `forEach`)

### Actions

- [ ] Replace `for` loops with `map` for transformations
- [ ] Replace filtering logic with `filter` method
- [ ] Convert accumulation patterns to `reduce`
- [ ] Use `find` and `findIndex` for search operations
- [ ] Implement `some` and `every` for boolean checks

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 7: Class Modernization & Private Fields

### Target

Update class syntax with private fields (`#privateField`) and modern class features

### Actions

- [ ] Add private field declarations using `#` syntax
- [ ] Convert constructor functions to class syntax
- [ ] Implement private methods where appropriate
- [ ] Add static methods and properties
- [ ] Use class field declarations

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 8: Async/Await & Top-level Await

### Target

Modernize asynchronous code with async/await patterns and implement top-level await

### Actions

- [ ] Replace Promise chains with async/await
- [ ] Add top-level await for module initialization
- [ ] Improve error handling in async functions
- [ ] Convert callback-based APIs to Promise-based
- [ ] Optimize concurrent operations with Promise.all/Promise.allSettled

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 9: Modern Data Structures

### Target

Replace arrays/objects with appropriate `Map`, `Set`, `WeakMap`, `WeakSet` where beneficial

### Actions

- [ ] Identify key-value storage patterns suitable for `Map`
- [ ] Replace unique value arrays with `Set`
- [ ] Use `WeakMap`/`WeakSet` for memory-sensitive scenarios
- [ ] Implement efficient lookup operations
- [ ] Optimize data access patterns

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 10: ES2025 New Features Integration

### Target

Implement cutting-edge ES2025 features like `Array.prototype.group()` and pattern matching

### Actions

- [ ] Use `Array.prototype.group()` for data organization
- [ ] Implement pattern matching where applicable
- [ ] Add new array methods (if available)
- [ ] Use latest object/string methods
- [ ] Apply newest syntax improvements

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 11: Function Decomposition & Architecture

### Target

Break down large functions into focused, single-purpose units following SOLID principles

### Actions

- [ ] Identify functions exceeding 20-30 lines
- [ ] Extract pure functions from complex logic
- [ ] Create utility functions for reusable code
- [ ] Apply Single Responsibility Principle
- [ ] Improve function cohesion and reduce coupling

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 12: Error Handling & Input Validation

### Target

Implement comprehensive error handling and input validation throughout the codebase

### Actions

- [ ] Add try-catch blocks for risky operations
- [ ] Implement input validation functions
- [ ] Create custom error classes
- [ ] Add parameter type checking
- [ ] Implement graceful error recovery

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 13: Code Quality & Documentation

### Target

Add JSDoc documentation, improve naming, and ensure consistent formatting

### Actions

- [ ] Add comprehensive JSDoc comments
- [ ] Rename variables/functions for clarity
- [ ] Add meaningful code comments for complex logic
- [ ] Ensure consistent code formatting
- [ ] Remove dead code and unused imports

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 14: Performance Optimization

### Target

Optimize algorithms and data access patterns for better performance

### Actions

- [ ] Analyze time complexity of algorithms
- [ ] Optimize nested loops and recursive functions
- [ ] Implement efficient data access patterns
- [ ] Add performance monitoring where needed
- [ ] Memory leak prevention measures

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Step 15: Security & Best Practices

### Target

Apply security best practices and finalize code review readiness

### Actions

- [ ] Implement input sanitization
- [ ] Add security validation patterns
- [ ] Review for potential security vulnerabilities
- [ ] Apply final code review best practices
- [ ] Ensure all code follows established patterns

### Gates

- [ ] ✅ `npm run check:file <filename>` passes for each modified file
- [ ] ✅ `npm test` passes
- [ ] If either gate fails, repeat this step

---

## Final Deliverables

Upon completion of all steps:

1. **Refactored Codebase** - All files in `src/` modernized to ES2025
2. **Improvement Summary** - Document changes made in each step
3. **Performance Analysis** - Benchmark improvements where applicable
4. **Documentation** - Complete JSDoc coverage
5. **Optimization Report** - Additional recommendations for future improvements

## Success Criteria

- All files pass `npm run check:file <filename>`
- All tests pass with `npm test`
- Code follows ES2025 best practices
- Improved readability and maintainability
- Enhanced performance and security

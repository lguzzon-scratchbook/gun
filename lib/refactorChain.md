# Plan and execute

## Refactor the js file 'src' while strictly adhering to the following requirements

1. Preserve the core architectural pattern: the main logic must remain encapsulated within an Immediately Invoked Function Expression (IIFE).
2. After each file edit/write, execute npm test and fix any resulting errors before proceeding.
3. Convert all single-line var declarations into multi-line const or let declarations.
4. Do not alter the fundamental structure or public API; all changes must be internal optimizations focused on quality, reliability, and functional equivalence. The final output must be well-documented where necessary and must not break any existing tests.




# Plan and execute

## Refactor the file src/chain.js to maximize code clarity, correctness, and long-term maintainability while strictly adhering to the following requirements

1. Preserve the core architectural pattern: the main logic must remain encapsulated within an Immediately Invoked Function Expression (IIFE).
2. After each file edit/write, execute npm test and fix any resulting errors before proceeding.
3. Convert all single-line var declarations into multi-line const or let declarations.
4. Rename all variables to be concise, meaningful, and reflective of their purpose.
5. Refactor conditional logic to eliminate inline instructions, making all if constructs clear and explicit.
6. Enhance readability by decomposing complex functions, removing code duplication, simplifying conditionals, and using descriptive names for variables and functions.
7. Improve robustness by implementing explicit error handling, validating function inputs and outputs, and replacing any anti-patterns with secure and predictable alternatives.
8. Do not alter the fundamental structure or public API; all changes must be internal optimizations focused on quality, reliability, and functional equivalence. The final output must be well-documented where necessary and must not break any existing tests.

# Plan and execute

## Refactor the file src/chain.js while strictly adhering to the following requirements

1. Preserve the core architectural pattern: the main logic must remain encapsulated within an Immediately Invoked Function Expression (IIFE).
2. After each file edit/write, execute npm test and fix any resulting errors before proceeding.
3. Convert all single-line var declarations into multi-line const or let declarations.
4. Do not alter the fundamental structure or public API; all changes must be internal optimizations focused on quality, reliability, and functional equivalence. The final output must be well-documented where necessary and must not break any existing tests.

# Build me a refactor plan to improve correctness, maintainability and performance for the files in 'scr' dir

## Refactor while strictly adhering to the following requirements

1. Preserve the core architectural pattern: the main logic must remain encapsulated within an Immediately Invoked Function Expression (IIFE).
2. After each file edit/write, execute npm test and fix any resulting errors before proceeding.
3. Do not alter the fundamental structure or public API; all changes must be internal optimizations focused on quality, reliability, and functional equivalence. The final output must be well-documented where necessary and must not break any existing tests.

An expert AI assistant, following your instructions, has optimized the prompt.

**Task Instruction:** Optimize the provided prompt to generate a more accurate, actionable, and comprehensive code refactoring plan from an AI.

### Detailed Reasoning

The original prompt is a good starting point but can be improved for clarity, context, and specificity to yield a superior result from the AI.

1. **Decomposition of the Original Prompt:**
    * **Goal:** Create a "refactor plan" for files in a `scr` (likely `src`) directory.
    * **Objectives:** Improve correctness, maintainability, and performance.
    * **Constraint 1 (Architecture):** The core logic must remain within an Immediately Invoked Function Expression (IIFE).
    * **Constraint 2 (Process):** Follow a Test-Driven Development (TDD)-like cycle: edit, test, fix, repeat.
    * **Constraint 3 (Scope):** Internal optimizations only. Do not change the public API, ensure functional equivalence, and add documentation.

2. **Analysis of Weaknesses:**
    * **Lack of Context:** The prompt assumes the AI has access to the files in the `'scr'` directory. It needs to explicitly ask the user to provide the code.
    * **Ambiguity of "Plan":** The term "refactor plan" is vague. It could mean a high-level strategy document, a list of suggested changes, or the final refactored code itself. The prompt's constraints imply a process of generating code, making this ambiguity confusing.
    * **Procedural Impasse:** Constraint #2 (`execute npm test`) describes an iterative process that a single-response AI cannot actually perform. The prompt needs to guide the AI on how to *simulate* or *describe* this process rather than execute it.
    * **Lack of Specificity:** The goals of "correctness, maintainability, and performance" are high-level. The prompt can be improved by suggesting specific refactoring techniques to look for (e.g., removing magic strings, simplifying loops, using modern syntax).

3. **Reasoning Paths for Optimization:**

    * **Reasoning Path 1: The Strategic Blueprint.** This approach interprets "refactor plan" literally. The optimized prompt would ask the AI to act as a software architect and produce a high-level strategic document. It would analyze the code and output a markdown file detailing the *what* and *why* of the refactoring, guiding the user to perform the work themselves. This is safe but less direct.

    * **Reasoning Path 2: The Interactive Pair Programmer.** This approach focuses on the iterative nature of Constraint #2. The prompt would frame the task as a conversation, where the AI suggests a single, atomic change, and then waits for the user to confirm that "tests have passed" before suggesting the next one. This mimics pair programming but is cumbersome for a standard chat interface.

    * **Reasoning Path 3: The Full-Service Implementation.** This approach assumes the user's ultimate goal is the finished, refactored code. The prompt instructs the AI to take the source code, perform all the refactoring internally, and output the final, optimized code. To satisfy the original constraints, the AI would also generate a detailed report describing the changes and explaining how it simulated the test-driven process.

4. **Majority Vote and Selection:**
    **Reasoning Path 3 is the most effective and practical choice.** It resolves the ambiguity of "plan" by delivering a tangible, complete result (the refactored code). It effectively addresses the "procedural impasse" by asking the AI to describe its simulated TDD process. By providing specific refactoring categories, it guides the AI toward a more thorough and relevant output, directly fulfilling the user's implied need for a finished product.

### Final Answer

Here is the optimized prompt, structured to be clear, comprehensive, and actionable for an AI.

'''

# Prompt Start

## 1. Persona

You are an expert senior software engineer specializing in JavaScript, code quality, and safe refactoring.

## 2. Context

I will provide you with the code from several files located in my project's `src` directory. Your task is to analyze this code (javascript) and perform a refactoring to improve its correctness, maintainability, and performance.

## 3. Core Task: Refactor and Document

Generate the fully refactored code for each file I provide. Before presenting the code, you must include a "Refactoring Report" in markdown format.

The **Refactoring Report** must detail:

* A high-level summary of the changes made.
* A file-by-file breakdown of specific changes, explaining the 'why' behind each one (e.g., "Replaced a `for` loop with `.map()` for improved readability and immutability.").
* A confirmation that all changes adhere to the strict requirements listed below.

## 4. Refactoring Focus Areas

When refactoring, focus on (but do not be limited to) these improvements:

* **Correctness & Modernization:** Replace `var` with `let`/`const`, enforce strict equality (`===`), and eliminate anti-patterns.
* **Maintainability:** Simplify complex conditional logic, extract repeated logic into pure helper functions, remove dead or commented-out code, and replace magic strings/numbers with named constants.
* **Performance:** Optimize loops, use more efficient data structures, and reduce redundant computations where possible.
* **Documentation:** Add JSDoc comments to public functions and clarify complex, non-obvious logic with inline comments.

## 5. Strict Requirements

You must refactor while strictly adhering to the following rules:

1. **Preserve Architecture:** The main logic in each file must remain encapsulated within its existing Immediately Invoked Function Expression (IIFE).
2. **Simulate Test-Driven Refactoring:** Your refactoring process must *simulate* an iterative, test-driven approach. In your report, describe how your changes are atomic and would pass tests at each logical step. For example: "First, I converted all `var` declarations to `let`/`const`, which is a safe, non-breaking change. Next, I identified a complex `if/else` chain and refactored it into a lookup map, ensuring the output remained identical."
3. **Guarantee Non-Breaking Changes:** Do not alter the fundamental structure or the public API of the code. All changes must be internal optimizations focused on quality and reliability. The final code must be functionally equivalent to the original and would not break any existing tests.

Please confirm you understand these instructions, and I will provide the code from the first file.

# Prompt End

'''

---

### Alternative Solution Branches

* **If you wanted a strategic guide to perform the work yourself,** you could use an alternative prompt based on **Reasoning Path 1**. You would ask the AI to produce only the "Refactoring Report" and omit the final code, turning it into a step-by-step guide for you to follow.
* **If you prefer a conversational, step-by-step approach,** you could use a prompt based on **Reasoning Path 2**. This would involve more back-and-forth, where the AI suggests one change, and you "run the tests" and confirm before it proceeds.






# Plan and execute

## Refactor the js file 'src' while strictly adhering to the following requirements

1. Preserve the core architectural pattern: the main logic must remain encapsulated within an Immediately Invoked Function Expression (IIFE).
2. After each file edit/write, execute npm test and fix any resulting errors before proceeding.
3. Convert all single-line var declarations into multi-line const or let declarations.
4. Do not alter the fundamental structure or public API; all changes must be internal optimizations focused on quality, reliability, and functional equivalence. The final output must be well-documented where necessary and must not break any existing tests.

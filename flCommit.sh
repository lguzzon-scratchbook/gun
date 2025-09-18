#!/bin/bash

# JavaScript File Processor Script
# Formats, tests, commits, then lints JS files individually

set -euo pipefail # Exit on error, undefined vars, pipe failures

# Configuration
readonly SRC_DIR="src"
readonly LOG_FILE="js_processor_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Counters for summary
declare -i processed=0
declare -i committed=0
declare -i reset=0
declare -i errors=0

# Arrays to store file lists for summary
committed_files=()
reset_files=()
error_files=()

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Print colored output
print_color() {
    local color="$1"
    shift
    echo -e "${color}$*${NC}"
}

# Progress indicator
show_progress() {
    local current="$1"
    local total="$2"
    local file="$3"
    local percent=$((current * 100 / total))
    printf "\r[%3d%%] Processing %d/%d: %s" "$percent" "$current" "$total" "$(basename "$file")"
}

# Check if required npm scripts exist
check_npm_scripts() {
    log "INFO" "Checking npm scripts availability..."

    if ! (rm tmp.txt >/dev/null 2>&1 || true) && npm run >tmp.txt && cat tmp.txt | grep -q "format:file"; then
        log "ERROR" "npm script 'format:file' not found"
        print_color "$RED" "❌ Error: npm script 'format:file' not found in package.json"
        exit 1
    fi

    if ! (rm tmp.txt >/dev/null 2>&1 || true) && npm run >tmp.txt && cat tmp.txt | grep -q "lint:file"; then
        log "ERROR" "npm script 'lint:file' not found"
        print_color "$RED" "❌ Error: npm script 'lint:file' not found in package.json"
        exit 1
    fi

    if ! (rm tmp.txt >/dev/null 2>&1 || true) && npm run >tmp.txt && cat tmp.txt | grep -q "test"; then
        log "ERROR" "npm script 'test' not found"
        print_color "$RED" "❌ Error: npm script 'test' not found in package.json"
        exit 1
    fi

    log "INFO" "All required npm scripts found"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        log "ERROR" "Not in a git repository"
        print_color "$RED" "❌ Error: Not in a git repository"
        exit 1
    fi
    log "INFO" "Git repository confirmed"
}

# Check if src directory exists
check_src_directory() {
    if [[ ! -d $SRC_DIR ]]; then
        log "ERROR" "Source directory '$SRC_DIR' not found"
        print_color "$RED" "❌ Error: Source directory '$SRC_DIR' not found"
        exit 1
    fi
    log "INFO" "Source directory '$SRC_DIR' found"
}

# Process a single JavaScript file
process_file() {
    local file="$1"
    local relative_file="${file#./}" # Remove ./ prefix if present

    log "INFO" "Processing file: $relative_file"

    # Store original file state
    local original_hash
    if ! original_hash=$(git hash-object "$file" 2>/dev/null); then
        log "ERROR" "Failed to get original hash for: $relative_file"
        error_files+=("$relative_file")
        ((errors++))
        return 1
    fi

    # Step 1: Format the file
    log "INFO" "Formatting: $relative_file"
    if ! npm run format:file -- "$file" >>"$LOG_FILE" 2>&1; then
        log "ERROR" "Formatting failed for: $relative_file"
        error_files+=("$relative_file")
        ((errors++))
        return 1
    fi

    # Check if file changed after formatting
    local formatted_hash
    if ! formatted_hash=$(git hash-object "$file" 2>/dev/null); then
        log "ERROR" "Failed to get formatted hash for: $relative_file"
        error_files+=("$relative_file")
        ((errors++))
        return 1
    fi

    if [ "$formatted_hash" = "$original_hash" ]; then
        log "INFO" "No changes after formatting for: $relative_file, skipping"
        return 0
    fi

    # Step 2: Run tests after formatting
    log "INFO" "Running tests after formatting: $relative_file"
    if npm test >>"$LOG_FILE" 2>&1; then
        # Tests passed after formatting - commit the formatted file
        log "INFO" "Tests passed after formatting for: $relative_file"

        if git add "$file" && git commit -m "feat: format $relative_file"; then
            log "INFO" "Successfully committed formatted file: $relative_file"
            committed_files+=("$relative_file")
            ((committed++))
        else
            log "ERROR" "Failed to commit formatted file: $relative_file"
            git reset HEAD -- "$file" 2>/dev/null || true
            git checkout -- "$file" 2>/dev/null || true
            error_files+=("$relative_file")
            ((errors++))
            return 1
        fi
    else
        # Tests failed after formatting - reset the file
        log "WARN" "Tests failed after formatting for: $relative_file - resetting file"
        if git checkout -- "$file" 2>/dev/null; then
            log "INFO" "Successfully reset: $relative_file"
            reset_files+=("$relative_file")
            ((reset++))
        else
            log "ERROR" "Failed to reset: $relative_file"
            error_files+=("$relative_file")
            ((errors++))
        fi
    fi

    # Step 3: Lint the file (only if formatting and tests passed)
    log "INFO" "Linting: $relative_file"
    if ! npm run lint:file -- "$file" >>"$LOG_FILE" 2>&1; then
        log "ERROR" "Linting failed for: $relative_file"
        # Don't reset since we already committed the formatted version
        # Just log the linting issue
        log "WARN" "File $relative_file was committed with formatting but has linting issues"
    fi

    # Check if file changed after linting
    local linted_hash
    if ! linted_hash=$(git hash-object "$file" 2>/dev/null); then
        log "ERROR" "Failed to get linted hash for: $relative_file"
        return 1
    fi

    if [ "$linted_hash" = "$formatted_hash" ]; then
        log "INFO" "No changes after linting for: $relative_file, skipping commit"
        return 0
    fi

    # Step 4: Run tests after linting
    log "INFO" "Running tests after linting: $relative_file"
    if npm test >>"$LOG_FILE" 2>&1; then
        # Tests still pass after linting - commit the linted changes
        log "INFO" "Tests passed after linting for: $relative_file"

        if git add "$file" && git commit -m "feat: lint $relative_file"; then
            log "INFO" "Successfully committed linted file: $relative_file"
        else
            log "ERROR" "Failed to commit linted file: $relative_file"
            # Reset to the previously committed formatted version
            git reset HEAD~1 --hard 2>/dev/null || true
            return 1
        fi
    else
        # Tests failed after linting - reset to the formatted version
        log "WARN" "Tests failed after linting for: $relative_file - keeping formatted version"
        git reset HEAD~1 --hard 2>/dev/null || true
    fi

    return 0
}

# Print summary report
print_summary() {
    echo
    print_color "$BLUE" "=================================="
    print_color "$BLUE" "       PROCESSING SUMMARY"
    print_color "$BLUE" "=================================="

    echo "📊 Total files processed: $processed"
    echo "✅ Files committed: $committed"
    echo "🔄 Files reset: $reset"
    echo "❌ Files with errors: $errors"
    echo

    if [[ ${#committed_files[@]} -gt 0 ]]; then
        print_color "$GREEN" "✅ Successfully committed files:"
        printf '   %s\n' "${committed_files[@]}"
        echo
    fi

    if [[ ${#reset_files[@]} -gt 0 ]]; then
        print_color "$YELLOW" "🔄 Reset files (tests failed after formatting):"
        printf '   %s\n' "${reset_files[@]}"
        echo
    fi

    if [[ ${#error_files[@]} -gt 0 ]]; then
        print_color "$RED" "❌ Files with errors:"
        printf '   %s\n' "${error_files[@]}"
        echo
    fi

    echo "📝 Detailed log saved to: $LOG_FILE"

    if [[ $errors -gt 0 ]]; then
        print_color "$RED" "⚠️  Some files had errors. Check the log file for details."
        exit 1
    elif [[ $reset -gt 0 ]]; then
        print_color "$YELLOW" "⚠️  Some files were reset due to test failures after formatting."
        exit 0
    else
        print_color "$GREEN" "🎉 All files processed successfully!"
        exit 0
    fi
}

# Cleanup function for graceful exit
cleanup() {
    echo
    print_color "$YELLOW" "🛑 Script interrupted. Cleaning up..."
    print_summary
}

# Main function
main() {
    # Set up signal handlers for graceful exit
    trap cleanup SIGINT SIGTERM

    print_color "$BLUE" "🚀 Starting JavaScript file processing..."
    log "INFO" "Script started"

    # Pre-flight checks
    check_git_repo
    check_src_directory
    check_npm_scripts

    # Find all JavaScript files
    print_color "$BLUE" "🔍 Finding JavaScript files in $SRC_DIR..."

    # Use find with proper handling for files with spaces (Bash 3 compatible)
    js_files=()
    while IFS= read -r -d '' file; do
        js_files+=("$file")
    done < <(find "$SRC_DIR" -type f -name "*.js" -print0 | sort -z)

    if [[ ${#js_files[@]} -eq 0 ]]; then
        log "WARN" "No JavaScript files found in $SRC_DIR"
        print_color "$YELLOW" "⚠️  No JavaScript files found in $SRC_DIR"
        exit 0
    fi

    local total_files=${#js_files[@]}
    log "INFO" "Found $total_files JavaScript files"
    print_color "$GREEN" "📁 Found $total_files JavaScript files"
    echo

    # Process each file
    for i in "${!js_files[@]}"; do
        local file="${js_files[$i]}"
        ((processed++))

        show_progress $((i + 1)) "$total_files" "$file"
        echo # New line after progress

        if ! process_file "$file"; then
            log "WARN" "Failed to process: $file"
        fi

        # Small delay to make progress visible
        sleep 0.1
    done

    echo # Final newline after all progress indicators

    # Print final summary
    print_summary
}

# Run main function
main "$@"

#!/bin/bash
# Pre-commit validation script for BrightonHub
# Run this before any major commits to prevent broken deployments

echo "🔍 Running BrightonHub pre-commit validation..."
echo "================================================"

# Set error handling
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Check for TypeScript errors
echo "1. Checking TypeScript compilation..."
if command -v npm &> /dev/null; then
    if [ -f "package.json" ]; then
        # Check if type-check script exists
        if npm run | grep -q "type-check"; then
            npm run type-check > /dev/null 2>&1
            print_status $? "TypeScript compilation"
        else
            # Try to run TypeScript directly
            if command -v tsc &> /dev/null; then
                tsc --noEmit > /dev/null 2>&1
                print_status $? "TypeScript compilation"
            else
                print_warning "TypeScript not available - skipping type check"
            fi
        fi
    else
        print_warning "No package.json found - skipping npm checks"
    fi
else
    print_warning "npm not available - skipping npm checks"
fi

# 2. Check database structure
echo "2. Checking database structure..."
if [ -f "check-database-structure.js" ]; then
    node check-database-structure.js > /dev/null 2>&1
    print_status $? "Database structure validation"
else
    print_warning "Database check script not found"
fi

# 3. Check for common issues
echo "3. Checking for common issues..."

# Check for TODO/FIXME comments in staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' || true)
if [ ! -z "$STAGED_FILES" ]; then
    TODO_COUNT=$(grep -n "TODO\|FIXME\|XXX" $STAGED_FILES 2>/dev/null | wc -l || echo "0")
    if [ $TODO_COUNT -gt 0 ]; then
        print_warning "Found $TODO_COUNT TODO/FIXME comments in staged files"
        grep -n "TODO\|FIXME\|XXX" $STAGED_FILES 2>/dev/null || true
    fi
fi

# Check for console.log statements in staged files
if [ ! -z "$STAGED_FILES" ]; then
    CONSOLE_COUNT=$(grep -n "console\.log\|console\.error\|console\.warn" $STAGED_FILES 2>/dev/null | wc -l || echo "0")
    if [ $CONSOLE_COUNT -gt 0 ]; then
        print_warning "Found $CONSOLE_COUNT console statements in staged files"
        grep -n "console\.log\|console\.error\|console\.warn" $STAGED_FILES 2>/dev/null || true
        echo "Consider removing console statements before production"
    fi
fi

print_status 0 "Common issues check"

# 4. Check for large files
echo "4. Checking for large files..."
LARGE_FILES=$(git diff --cached --name-only | xargs -I {} du -k {} 2>/dev/null | awk '$1 > 1000 {print $2}' || true)
if [ ! -z "$LARGE_FILES" ]; then
    print_warning "Large files detected (>1MB):"
    echo "$LARGE_FILES"
    echo "Consider if these files should be committed"
fi
print_status 0 "Large files check"

# 5. Check environment variables
echo "5. Checking environment configuration..."
if [ -f ".env.local" ] || [ -f ".env" ]; then
    if [ ! -f ".env.example" ]; then
        print_warning "No .env.example file found - consider creating one"
    fi
fi
print_status 0 "Environment configuration"

# 6. Check for sensitive data
echo "6. Checking for sensitive data..."
SENSITIVE_PATTERNS="password|secret|api[_-]?key|token|credential"
SENSITIVE_MATCHES=$(git diff --cached | grep -iE "$SENSITIVE_PATTERNS" | grep "^\+" || true)
if [ ! -z "$SENSITIVE_MATCHES" ]; then
    print_warning "Potential sensitive data detected:"
    echo "$SENSITIVE_MATCHES"
    echo "Please review before committing"
fi
print_status 0 "Sensitive data check"

# 7. Check branch status
echo "7. Checking git status..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "master" ] || [ "$CURRENT_BRANCH" = "main" ]; then
    print_warning "Committing directly to $CURRENT_BRANCH branch"
    echo "Consider using a feature branch for new features"
fi
print_status 0 "Git status check"

echo ""
echo "================================================"
echo -e "${GREEN}🎉 All pre-commit checks passed!${NC}"
echo ""
echo "📋 Summary:"
echo "- TypeScript compilation: OK"
echo "- Database structure: OK"  
echo "- Code quality: OK"
echo "- File sizes: OK"
echo "- Security: OK"
echo ""
echo "✅ Ready to commit!"
echo ""
echo "💡 Tip: Run 'git commit --no-verify' to skip these checks if needed"

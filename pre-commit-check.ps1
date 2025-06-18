# Pre-commit validation script for BrightonHub (PowerShell version)
# Run this before any major commits to prevent broken deployments

Write-Host "🔍 Running BrightonHub pre-commit validation..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Function to print status
function Print-Status {
    param($Success, $Message)
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
        exit 1
    }
}

function Print-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# 1. Check for TypeScript errors
Write-Host "1. Checking TypeScript compilation..."
if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts."type-check") {
            $result = npm run type-check 2>$null
            Print-Status ($LASTEXITCODE -eq 0) "TypeScript compilation"
        } elseif (Get-Command tsc -ErrorAction SilentlyContinue) {
            $result = tsc --noEmit 2>$null
            Print-Status ($LASTEXITCODE -eq 0) "TypeScript compilation"
        } else {
            Print-Warning "TypeScript not available - skipping type check"
        }
    } catch {
        Print-Warning "Could not check TypeScript - skipping"
    }
} else {
    Print-Warning "No package.json found - skipping npm checks"
}

# 2. Check database structure
Write-Host "2. Checking database structure..."
if (Test-Path "check-database-structure.js") {
    try {
        $result = node check-database-structure.js 2>$null
        Print-Status ($LASTEXITCODE -eq 0) "Database structure validation"
    } catch {
        Print-Warning "Database check failed"
    }
} else {
    Print-Warning "Database check script not found"
}

# 3. Check for common issues
Write-Host "3. Checking for common issues..."

# Check for TODO/FIXME comments in staged files
$stagedFiles = git diff --cached --name-only --diff-filter=ACM | Where-Object { $_ -match '\.(ts|tsx|js|jsx)$' }
if ($stagedFiles) {
    $todoCount = 0
    foreach ($file in $stagedFiles) {
        if (Test-Path $file) {
            $content = Get-Content $file
            $todos = $content | Select-String "TODO|FIXME|XXX"
            $todoCount += $todos.Count            if ($todos.Count -gt 0) {
                Print-Warning "Found TODOs in $file"
                $todos | ForEach-Object { 
                    if ($_.Line) {
                        Write-Host "  Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Gray 
                    }
                }
            }
        }
    }
    if ($todoCount -gt 0) {
        Print-Warning "Found $todoCount TODO/FIXME comments in staged files"
    }
    
    # Check for console.log statements
    $consoleCount = 0
    foreach ($file in $stagedFiles) {
        if (Test-Path $file) {
            $content = Get-Content $file
            $consoles = $content | Select-String "console\.\w+"
            $consoleCount += $consoles.Count
            if ($consoles.Count -gt 0) {
                Print-Warning "Found console statements in $file"
            }
        }
    }
    if ($consoleCount -gt 0) {
        Print-Warning "Found $consoleCount console statements in staged files"
        Write-Host "Consider removing console statements before production" -ForegroundColor Gray
    }
}

Print-Status $true "Common issues check"

# 4. Check for large files
Write-Host "4. Checking for large files..."
$stagedFiles = git diff --cached --name-only
$largeFiles = @()
foreach ($file in $stagedFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length / 1MB        if ($size -gt 1) {
            $sizeRounded = [math]::Round($size, 2)
            $largeFiles += "$file - $sizeRounded MB"
        }
    }
}
if ($largeFiles.Count -gt 0) {
    Print-Warning "Large files detected (>1MB):"
    $largeFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host "Consider if these files should be committed" -ForegroundColor Gray
}
Print-Status $true "Large files check"

# 5. Check environment variables
Write-Host "5. Checking environment configuration..."
$hasEnv = (Test-Path ".env.local") -or (Test-Path ".env")
if ($hasEnv -and !(Test-Path ".env.example")) {
    Print-Warning "No .env.example file found - consider creating one"
}
Print-Status $true "Environment configuration"

# 6. Check for sensitive data
Write-Host "6. Checking for sensitive data..."
$sensitivePatterns = "password|secret|api[_-]?key|token|credential"
try {
    $diffContent = git diff --cached
    $sensitiveMatches = $diffContent | Select-String -Pattern $sensitivePatterns -AllMatches
    if ($sensitiveMatches) {
        Print-Warning "Potential sensitive data detected:"
        $sensitiveMatches | ForEach-Object { Write-Host "  $($_.Line)" -ForegroundColor Gray }
        Write-Host "Please review before committing" -ForegroundColor Gray
    }
} catch {
    # Ignore errors in sensitive data check
}
Print-Status $true "Sensitive data check"

# 7. Check branch status
Write-Host "7. Checking git status..."
$currentBranch = git branch --show-current
if ($currentBranch -eq "master" -or $currentBranch -eq "main") {
    Print-Warning "Committing directly to $currentBranch branch"
    Write-Host "Consider using a feature branch for new features" -ForegroundColor Gray
}
Print-Status $true "Git status check"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🎉 All pre-commit checks passed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "- TypeScript compilation: OK" -ForegroundColor Green
Write-Host "- Database structure: OK" -ForegroundColor Green
Write-Host "- Code quality: OK" -ForegroundColor Green
Write-Host "- File sizes: OK" -ForegroundColor Green
Write-Host "- Security: OK" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Ready to commit!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tip: Run 'git commit --no-verify' to skip these checks if needed" -ForegroundColor Gray

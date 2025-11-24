# Verify GitHub Repository Status
Write-Host "`n🔍 Verifying GitHub Repository...`n" -ForegroundColor Cyan

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not a git repository!" -ForegroundColor Red
    exit 1
}

# Check remote
Write-Host "📡 Remote Configuration:" -ForegroundColor Yellow
git remote -v

# Check status
Write-Host "`n📋 Repository Status:" -ForegroundColor Yellow
git status --short

# Check last commit
Write-Host "`n📝 Last 5 Commits:" -ForegroundColor Yellow
git log --oneline -5

# Count files
Write-Host "`n📊 Repository Statistics:" -ForegroundColor Yellow
$totalFiles = (git ls-files | Measure-Object -Line).Lines
Write-Host "  Total files: $totalFiles" -ForegroundColor White

# Check key files
Write-Host "`n✅ Key Files Check:" -ForegroundColor Yellow
$keyFiles = @(
    "apps/api/package.json",
    "apps/web/package.json",
    "apps/api/prisma/schema.prisma",
    "apps/api/app-platform.yaml",
    "package.json",
    "pnpm-workspace.yaml",
    "README.md"
)

$allPresent = $true
foreach ($file in $keyFiles) {
    if (git ls-files | Select-String -Pattern "^$([regex]::Escape($file))$") {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file - MISSING!" -ForegroundColor Red
        $allPresent = $false
    }
}

if ($allPresent) {
    Write-Host "`n✅ All key files present in repository!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Some key files are missing!`n" -ForegroundColor Red
    exit 1
}


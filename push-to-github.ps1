# PowerShell script to push code to GitHub
# Repository: https://github.com/agajabhavin/cloudpa.git

Write-Host "`n🚀 Pushing CloudPA to GitHub...`n" -ForegroundColor Cyan

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win`n" -ForegroundColor Yellow
    exit 1
}

# Initialize git repository
Write-Host "Step 1: Initializing git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "  ℹ️  Git repository already initialized" -ForegroundColor Gray
} else {
    git init
    Write-Host "  ✅ Git repository initialized" -ForegroundColor Green
}

# Add all files
Write-Host "`nStep 2: Adding files..." -ForegroundColor Yellow
git add .
$fileCount = (git status --short | Measure-Object -Line).Lines
Write-Host "  ✅ Added $fileCount files" -ForegroundColor Green

# Create initial commit
Write-Host "`nStep 3: Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit - CloudPA with Twilio WhatsApp integration

- pg-boss + BullMQ dual queue system
- Twilio WhatsApp integration
- Complete messaging system
- Production-ready deployment configs"

Write-Host "  ✅ Commit created" -ForegroundColor Green

# Add remote repository
Write-Host "`nStep 4: Adding remote repository..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/agajabhavin/cloudpa.git"

# Check if remote already exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    if ($existingRemote -eq $remoteUrl) {
        Write-Host "  ℹ️  Remote already set to: $remoteUrl" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠️  Remote exists with different URL: $existingRemote" -ForegroundColor Yellow
        $update = Read-Host "  Update to $remoteUrl? (y/N)"
        if ($update -eq "y") {
            git remote set-url origin $remoteUrl
            Write-Host "  ✅ Remote updated" -ForegroundColor Green
        }
    }
} else {
    git remote add origin $remoteUrl
    Write-Host "  ✅ Remote added: $remoteUrl" -ForegroundColor Green
}

# Rename branch to main
Write-Host "`nStep 5: Setting branch to main..." -ForegroundColor Yellow
git branch -M main
Write-Host "  ✅ Branch set to main" -ForegroundColor Green

# Push to GitHub
Write-Host "`nStep 6: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "  ⚠️  You will be prompted for credentials:" -ForegroundColor Yellow
Write-Host "     Username: agajabhavin" -ForegroundColor White
Write-Host "     Password: [Use your Personal Access Token, NOT your GitHub password]`n" -ForegroundColor White

Write-Host "  💡 Don't have a token? Generate one at:" -ForegroundColor Cyan
Write-Host "     https://github.com/settings/tokens`n" -ForegroundColor White

$proceed = Read-Host "Ready to push? (y/N)"
if ($proceed -eq "y") {
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Successfully pushed to GitHub!`n" -ForegroundColor Green
        Write-Host "📦 Repository: https://github.com/agajabhavin/cloudpa" -ForegroundColor Cyan
        Write-Host "`n🎉 Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Verify files on GitHub" -ForegroundColor White
        Write-Host "  2. Connect to DigitalOcean App Platform" -ForegroundColor White
        Write-Host "  3. Deploy!`n" -ForegroundColor White
    } else {
        Write-Host "`n❌ Push failed. Check the error above.`n" -ForegroundColor Red
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "  • Wrong credentials (use Personal Access Token, not password)" -ForegroundColor White
        Write-Host "  • Token doesn't have 'repo' scope" -ForegroundColor White
        Write-Host "  • Network connectivity issues`n" -ForegroundColor White
    }
} else {
    Write-Host "`n⏭️  Push cancelled. Run this script again when ready.`n" -ForegroundColor Yellow
}


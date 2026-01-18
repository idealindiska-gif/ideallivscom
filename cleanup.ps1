# Cleanup Script for Hostinger Migration
Write-Host "========================================"
Write-Host "Hostinger Migration - Cleanup Script"
Write-Host "========================================"
Write-Host ""

# Files to keep
$keepFiles = @(
    "README.md",
    "CHANGELOG.md",
    "HOSTINGER-MIGRATION-READY.md",
    "MIGRATION-SUMMARY.md",
    "CLEANUP-GUIDE.md",
    "QUICK-START-CHECKLIST.md"
)

Write-Host "Step 1: Deleting unnecessary .md files..."
$mdFiles = Get-ChildItem -Path . -Filter "*.md" -File | Where-Object { $keepFiles -notcontains $_.Name }
$mdCount = $mdFiles.Count

if ($mdCount -gt 0) {
    Write-Host "Found $mdCount .md files to delete"
    $mdFiles | ForEach-Object { Write-Host "  - $($_.Name)" }
    
    $confirm = Read-Host "Delete these files? (y/n)"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        $mdFiles | Remove-Item -Force
        Write-Host "Deleted $mdCount .md files"
    } else {
        Write-Host "Skipped .md file deletion"
    }
} else {
    Write-Host "No unnecessary .md files found"
}
Write-Host ""

Write-Host "Step 2: Deleting temporary Claude files..."
$tmpFiles = Get-ChildItem -Path . -Filter "tmpclaude-*" -File
$tmpCount = $tmpFiles.Count

if ($tmpCount -gt 0) {
    Write-Host "Found $tmpCount temporary Claude files"
    $tmpFiles | Remove-Item -Force
    Write-Host "Deleted $tmpCount temporary files"
} else {
    Write-Host "No temporary Claude files found"
}
Write-Host ""

Write-Host "Step 3: Deleting data snapshot files..."
$dataFiles = @("brands-data.json", "categories-data.json", "wordpress-pages.json")
$deletedData = 0

foreach ($file in $dataFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  Deleted $file"
        $deletedData++
    }
}

if ($deletedData -gt 0) {
    Write-Host "Deleted $deletedData data snapshot files"
} else {
    Write-Host "No data snapshot files found"
}
Write-Host ""

Write-Host "Step 4: Deleting debug/test scripts..."
$debugFiles = Get-ChildItem -Path . -File | Where-Object { 
    $_.Name -like "debug-*" -or 
    $_.Name -like "test-*.js" -or 
    $_.Name -like "check-*.js"
}
$debugCount = $debugFiles.Count

if ($debugCount -gt 0) {
    Write-Host "Found $debugCount debug/test files"
    $debugFiles | ForEach-Object { Write-Host "  - $($_.Name)" }
    $debugFiles | Remove-Item -Force
    Write-Host "Deleted $debugCount debug/test files"
} else {
    Write-Host "No debug/test files found"
}
Write-Host ""

Write-Host "Step 5: Deleting unnecessary folders..."
$foldersToDelete = @(
    "hostinger-migration",
    "ideal-indiska-commerce-rules",
    "woocommerce-gateway-stripe",
    "wordpress-integration",
    "wordpress-snippets",
    "docs",
    "search data",
    ".agent",
    ".claude"
)

$deletedFolders = 0
foreach ($folder in $foldersToDelete) {
    if (Test-Path $folder) {
        Write-Host "  Deleting folder: $folder"
        Remove-Item $folder -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  Deleted $folder"
        $deletedFolders++
    }
}

if ($deletedFolders -gt 0) {
    Write-Host "Deleted $deletedFolders folders"
} else {
    Write-Host "No unnecessary folders found"
}
Write-Host ""

Write-Host "Step 6: Deleting miscellaneous files..."
$miscFiles = @(
    ".env.example.exit-survey",
    "pnpm-lock.yaml",
    "tsconfig.tsbuildinfo",
    "vercel.json"
)

$deletedMisc = 0
foreach ($file in $miscFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force -ErrorAction SilentlyContinue
        Write-Host "  Deleted $file"
        $deletedMisc++
    }
}

if ($deletedMisc -gt 0) {
    Write-Host "Deleted $deletedMisc miscellaneous files"
} else {
    Write-Host "No miscellaneous files found"
}
Write-Host ""

Write-Host "========================================"
Write-Host "Cleanup Complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "Summary:"
Write-Host "  - .md files: $mdCount deleted"
Write-Host "  - Temp files: $tmpCount deleted"
Write-Host "  - Data files: $deletedData deleted"
Write-Host "  - Debug files: $debugCount deleted"
Write-Host "  - Folders: $deletedFolders deleted"
Write-Host "  - Misc files: $deletedMisc deleted"
Write-Host ""
Write-Host "Next Steps:"
Write-Host "  1. Run: npm run build (to verify everything still works)"
Write-Host "  2. Create new GitHub repository"
Write-Host "  3. Push to new repository"
Write-Host "  4. Deploy to Hostinger"
Write-Host ""

# PowerShell script to fix API route params for Next.js 16

$files = @(
    "app/api/chats/[id]/route.ts",
    "app/api/notifications/[id]/read/route.ts",
    "app/api/workspaces/[id]/route.ts",
    "app/api/notes/[id]/route.ts",
    "app/api/members/[id]/route.ts",
    "app/api/documents/[id]/route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing $file..."
        $content = Get-Content $file -Raw
        
        # Replace params pattern
        $content = $content -replace '{ params }: { params: { id: string } }', '{ params }: { params: Promise<{ id: string }> }'
        
        # Add await params after function start
        $content = $content -replace '(\) \{\s+try \{\s+)', "`$1`n    const { id } = await params;`n"
        
        # Replace params.id with id
        $content = $content -replace 'params\.id', 'id'
        
        Set-Content $file $content -NoNewline
        Write-Host "Fixed $file" -ForegroundColor Green
    }
}

Write-Host "`nAll files fixed!" -ForegroundColor Cyan

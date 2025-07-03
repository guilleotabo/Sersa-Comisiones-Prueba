# Script de PowerShell para copiar app.js a todas las carpetas de asesores

# Lista de carpetas de asesores
$asesores = @('Alejandra', 'Aletzia', 'Erika', 'Maximiliano', 'Micaela', 'Rodrigo')

# Ruta del archivo app.js modificado (Base)
$sourceFile = Join-Path $PSScriptRoot "..\..\Base\app.js"

# Verificar que el archivo fuente existe
if (-not (Test-Path $sourceFile)) {
    Write-Host "Error: No se encontro el archivo Base/app.js" -ForegroundColor Red
    exit 1
}

Write-Host "Iniciando copia de app.js a todas las carpetas de asesores..." -ForegroundColor Green
Write-Host ""

$successCount = 0
$errorCount = 0

foreach ($asesor in $asesores) {
    $targetFile = Join-Path $PSScriptRoot "..\..\$asesor\app.js"
    $targetDir = Split-Path $targetFile -Parent
    
    try {
        # Verificar que la carpeta del asesor existe
        if (-not (Test-Path $targetDir)) {
            Write-Host "Carpeta $asesor/ no encontrada, saltando..." -ForegroundColor Yellow
            continue
        }
        
        # Crear backup del archivo original si existe
        if (Test-Path $targetFile) {
            $backupFile = "$targetFile.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
            Copy-Item $targetFile $backupFile
            Write-Host "Backup creado: $asesor/app.js.backup.$(Get-Date -Format 'yyyyMMddHHmmss')" -ForegroundColor Cyan
        }
        
        # Copiar el archivo
        Copy-Item $sourceFile $targetFile -Force
        Write-Host "$asesor/app.js actualizado correctamente" -ForegroundColor Green
        $successCount++
        
    } catch {
        Write-Host "Error copiando a $asesor/: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "Resumen:" -ForegroundColor Magenta
Write-Host "Archivos actualizados: $successCount" -ForegroundColor Green
Write-Host "Errores: $errorCount" -ForegroundColor Red
Write-Host "Total de asesores procesados: $($asesores.Count)" -ForegroundColor Cyan

if ($errorCount -eq 0) {
    Write-Host ""
    Write-Host "Todos los archivos app.js han sido actualizados exitosamente!" -ForegroundColor Green
    Write-Host "Los archivos originales se han respaldado con extension .backup" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Algunos archivos no pudieron ser actualizados. Revisa los errores arriba." -ForegroundColor Yellow
} 
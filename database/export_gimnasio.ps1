<#
.SYNOPSIS
    Script para migrar/exportar la base de datos 'gimnasio' con todos sus objetos y registros.
.DESCRIPTION
    Exporta tablas, vistas, procedimientos almacenados, funciones, eventos, disparadores y datos.
    Limpia cláusulas DEFINER para compatibilidad universal (cPanel, phpMyAdmin, etc.).
#>

param(
    [string]$DbName = "gimnasio",
    [string]$DbUser = "root",
    [string]$DbPass = "",
    [string]$DbHost = "127.0.0.1",
    [int]$DbPort = 3306,
    [string]$OutputDir = $PSScriptRoot
)

# 1. Detectar mysqldump
$mysqldumpCandidates = @(
    "C:\wamp64\bin\mysql\mysql8.3.0\bin\mysqldump.exe",
    "C:\wamp64\bin\mysql\mysql5.7.44\bin\mysqldump.exe",
    "mysqldump.exe"
)

$mysqldumpPath = $null
foreach ($path in $mysqldumpCandidates) {
    if (Test-Path $path) {
        $mysqldumpPath = $path
        break
    }
    $cmd = Get-Command $path -ErrorAction SilentlyContinue
    if ($cmd) {
        $mysqldumpPath = $cmd.Source
        break
    }
}

if (-not $mysqldumpPath) {
    Write-Error "No se encontró mysqldump.exe en las rutas de Wamp64."
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Exportando base de datos '$DbName' con todos sus objetos" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Usando mysqldump: $mysqldumpPath"

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$rawFile = Join-Path $OutputDir "${DbName}_dump_raw.sql"
$cleanFile = Join-Path $OutputDir "${DbName}_backup_${timestamp}.sql"
$latestFile = Join-Path $OutputDir "${DbName}_backup_latest.sql"

$passArg = if ($DbPass -ne "") { "-p$DbPass" } else { "" }

# Parámetros para volcado completo de todos los objetos y registros
$dumpArgs = @(
    "-h", $DbHost,
    "-P", $DbPort,
    "-u", $DbUser,
    "--routines",              # Incluye procedimientos y funciones
    "--triggers",              # Incluye triggers
    "--events",                # Incluye eventos programados
    "--single-transaction",    # Consistencia transaccional sin bloquear tablas
    "--add-drop-table",        # Agrega DROP TABLE IF EXISTS
    "--add-drop-trigger",      # Agrega DROP TRIGGER IF EXISTS
    "--default-character-set=utf8mb4",
    "--hex-blob",              # Previene corrupción en datos binarios
    "--column-statistics=0",   # Evita error de mysql 8 contra mysql 5
    $DbName
)

if ($DbPass -ne "") {
    $dumpArgs = @("-p$DbPass") + $dumpArgs
}

Write-Host "1. Ejecutando volcado completo (datos + objetos)..." -ForegroundColor Yellow

$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = $mysqldumpPath
$processInfo.Arguments = ($dumpArgs -join " ")
$processInfo.RedirectStandardOutput = $true
$processInfo.RedirectStandardError = $true
$processInfo.UseShellExecute = $false
$processInfo.StandardOutputEncoding = [System.Text.Encoding]::UTF8

$process = [System.Diagnostics.Process]::Start($processInfo)
$stdout = $process.StandardOutput.ReadToEnd()
$stderr = $process.StandardError.ReadToEnd()
$process.WaitForExit()

if ($process.ExitCode -ne 0 -and [string]::IsNullOrWhiteSpace($stdout)) {
    Write-Error "Error al ejecutar mysqldump: $stderr"
    exit $process.ExitCode
}

# 2. Eliminar cláusulas DEFINER para máxima portabilidad (servidores compartidos / phpMyAdmin)
Write-Host "2. Limpiando cláusulas DEFINER para compatibilidad en hosting/cPanel..." -ForegroundColor Yellow

# Elimina DEFINER=`user`@`host` de vistas, procedures, triggers
$cleanContent = $stdout -replace 'DEFINER\s*=\s*`[^`]+`@`[^`]+`', '' `
                        -replace 'DEFINER\s*=\s*[^\s]+', ''

[System.IO.File]::WriteAllText($cleanFile, $cleanContent, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($latestFile, $cleanContent, [System.Text.Encoding]::UTF8)

$sizeKb = [math]::Round(((Get-Item $cleanFile).Length / 1KB), 2)

Write-Host ""
Write-Host " Exportación completada con éxito!" -ForegroundColor Green
Write-Host " Archivo versionado: $cleanFile ($sizeKb KB)" -ForegroundColor Green
Write-Host " Archivo principal:  $latestFile ($sizeKb KB)" -ForegroundColor Green
Write-Host ""
Write-Host "Listo para importar directamente en phpMyAdmin, consola MySQL o Workbench." -ForegroundColor Cyan


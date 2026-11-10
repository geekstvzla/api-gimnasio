@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ==========================================================
echo  Exportando base de datos 'gimnasio' (Objetos + Registros)
echo ==========================================================

set DBNAME=gimnasio
set DBUSER=root
set DBPASS=
set DBHOST=127.0.0.1
set DBPORT=3306

:: Buscar mysqldump en Wamp
set MYSQLDUMP=
if exist "C:\wamp64\bin\mysql\mysql8.3.0\bin\mysqldump.exe" (
    set "MYSQLDUMP=C:\wamp64\bin\mysql\mysql8.3.0\bin\mysqldump.exe"
) else if exist "C:\wamp64\bin\mysql\mysql5.7.44\bin\mysqldump.exe" (
    set "MYSQLDUMP=C:\wamp64\bin\mysql\mysql5.7.44\bin\mysqldump.exe"
) else (
    set "MYSQLDUMP=mysqldump.exe"
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0export_gimnasio.ps1" -DbName "%DBNAME%" -DbUser "%DBUSER%" -DbPass "%DBPASS%" -DbHost "%DBHOST%" -DbPort %DBPORT% -OutputDir "%~dp0"

echo.
pause


@echo off
title Local Share ERP

REM Project root
cd /d "D:\Arshan ERP Solutions\local-share-lan"

REM Browser open (frontend Vite default: 5173, agar tumne port change kiya ho to yahan update karo)
start "" "http://localhost:5173"

REM Backend + Frontend dono ko ek hi CMD window me start karo
call npm run dev:all

REM Agar dev:all band ho jaye (error ya Ctrl+C), window turant close na ho
echo.
echo Servers stopped. Press any key to close this window...
pause
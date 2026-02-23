@echo off
title Запуск IntelliGroup Ballot Pro
echo =========================================
echo  Запуск системы распознавания бюллетеней
echo =========================================
echo.

echo Проверка наличия Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ОШИБКА: Node.js не установлен!
    echo Пожалуйста, скачайте и установите Node.js с официального сайта: https://nodejs.org/
    echo Затем закройте это окно и попробуйте снова.
    pause
    exit /b
)

echo Проверка зависимостей...
if not exist "node_modules\" (
    echo Установка необходимых компонентов (это может занять несколько минут)...
    call npm install
)

echo.
echo Запуск сервера...
echo После запуска приложение откроется в вашем браузере по умолчанию.
echo Не закрывайте это окно, пока работаете с приложением!
echo.

start http://localhost:3000

call npm run dev

pause

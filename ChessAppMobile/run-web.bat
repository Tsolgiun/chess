@echo off
cd %~dp0
echo Starting Chess App Mobile in web mode...
echo.
echo Running from directory: %CD%
echo.
echo This script will run the app with Expo's web support
echo that properly handles cross-platform compatibility.
echo.

REM Run the Expo web development server
echo Starting Expo web development server...
call npm run web

echo.
echo If you want to build the web version for production, run:
echo npm run build:web
echo.

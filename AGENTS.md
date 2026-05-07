# AGENTS.md - FISFIBER

## Project Overview
- **Framework**: .NET Framework 4.8.1, ASP.NET MVC 5.3.0
- **Architecture**: Single-project Web Application
- **DB**: SQL Server (PARADOX) via Entity Framework 6.5.1
- **Real-time**: SignalR hubs in `Fisfiber/Hubs/`
- **Logging**: log4net (logs to `Logs/logfile.txt`)

## Build & Run
- Build: Open `Fisfiber.sln` in Visual Studio 2022+ and build (Ctrl+Shift+B)
- Run: IIS Express on `https://localhost:44351/` (configured in csproj)
- No CLI build available (legacy .NET Framework)

## Configuration
- `Fisfiber/Web.config` - Connection strings, app settings, SAP config
- Connection: `Data Source=DAENERYS;Initial Catalog=PARADOX`
- Version: 1.43 (key `Version` in appSettings)

## Key Directories
- `Fisfiber/Controllers/` - MVC controllers (13 controllers)
- `Fisfiber/Models/` - Data models and database access
- `Fisfiber/Views/` - Razor views
- `Fisfiber/Hubs/` - SignalR hubs (6 hubs)

## Important Notes
- No unit tests in this repo
- Uses legacy packages (NuGet in `packages/` folder)
- SAP integration via ODBC (config in Web.config)
- Email notifications via SMTP (gmail)
# FISFIBER - Design System & UI Specification

> **Version:** 1.43 | **Framework:** .NET Framework 4.8.1 / ASP.NET MVC 5.3.0
> **Documentation Generated:** 2026-04-29

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Layout Architecture](#5-layout-architecture)
6. [UI Components](#6-ui-components)
7. [Iconography](#7-iconography)
8. [Data Visualization](#8-data-visualization)
9. [Responsive Design](#9-responsive-design)
10. [Animations & Effects](#10-animations--effects)
11. [State & Status Colors](#11-state--status-colors)
12. [File Structure](#12-file-structure)

---

## 1. Project Overview

FISFIBER is a production management, planning, and logistics web application for fiberglass manufacturing. It uses a functional business interface with a red-dominated color scheme, built on Bootstrap 4.x with custom CSS overlays.

**Layout Pattern:** Fixed collapsible sidebar + fluid main content area with top navbar.

---

## 2. Technology Stack

### CSS Frameworks
| Framework | Version | Usage |
|-----------|---------|-------|
| **Bootstrap** | 4.3.1 (main), 5.3.3 (login) | Core layout, grid, components |
| **Bootstrap Icons** | 1.11.3 | Primary icon system |
| **Font Awesome** | 6.x | Secondary icons |
| **Line Icons** | 4.0 | Sidebar navigation icons |

### JavaScript Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| jQuery | 3.7.1 | DOM manipulation, AJAX |
| jQuery UI | Latest | Draggable elements, interactions |
| SignalR | 2.4.3 | Real-time hub communication |
| DataTables | Latest | Advanced table rendering |
| Highcharts | Latest | Charts, gauges, heatmaps |
| ExcelJS | 4.3.0 | Excel export |
| Tabulator | Latest | Editable tables |

---

## 3. Color System

### CSS Custom Properties (Defined in `Styles/Bootstrap/custom-colors.css`)

```css
:root {
    --bs-redfn: #8C1B24;        /* Primary brand red - dark */
    --bs-redfm: #BF0F3E;        /* Medium red */
    --bs-redfl: #F20505;        /* Light red / alert red */
    --bs-grayf: #F0F1F2;       /* Light gray background */
    --bs-darkf: #0D0D0D;       /* Near-black for sidebar */
    --whitef: #ffffff;          /* White */
    --bs-darkfl: #343a40;      /* Dark gray (Bootstrap dark) */
    --bs-bgwhitef: #f2f2f2;   /* Light background */
}
```

### Primary Brand Palette
| Role | Color | Hex | RGB | Usage |
|------|-------|-----|-----|-------|
| Primary Dark | ![#8C1B24](https://via.placeholder.com/15/8C1B24/000000?text=+) | `#8C1B24` | rgb(140, 27, 36) | Sidebar, primary buttons, headers |
| Primary Medium | ![#BF0F3E](https://via.placeholder.com/15/BF0F3E/000000?text=+) | `#BF0F3E` | rgb(191, 15, 62) | Hover states, gradients |
| Primary Light | ![#F20505](https://via.placeholder.com/15/F20505/000000?text=+) | `#F20505` | rgb(242, 5, 5) | Alert borders, hover effects |
| Error Red | ![#dc362e](https://via.placeholder.com/15/dc362e/000000?text=+) | `#dc362e` | rgb(220, 54, 46) | Errors, warnings, table headers |

### Neutral Palette
| Color | Hex | Usage |
|-------|-----|-------|
| ![#0D0D0D](https://via.placeholder.com/15/0D0D0D/000000?text=+) | `#0D0D0D` | Sidebar background |
| ![#343a40](https://via.placeholder.com/15/343a40/000000?text=+) | `#343a40` | Footer, modal headers |
| ![#8d8b8b](https://via.placeholder.com/15/8d8b8b/000000?text=+) | `#8d8b8b` | Borders, secondary text |
| ![#F0F1F2](https://via.placeholder.com/15/F0F1F2/000000?text=+) | `#F0F1F2` | Backgrounds, striped rows |
| ![#f2f2f2](https://via.placeholder.com/15/f2f2f2/000000?text=+) | `#f2f2f2` | Page backgrounds |
| ![#ffffff](https://via.placeholder.com/15/ffffff/000000?text=+) | `#ffffff` | Cards, text on dark |

### Accent Palette
| Color | Hex | Usage |
|-------|-----|-------|
| ![#1e76bd](https://via.placeholder.com/15/1e76bd/000000?text=+) | `#1e76bd` | Table headers, active tabs, highlights |
| ![#007bff](https://via.placeholder.com/15/007bff/000000?text=+) | `#007bff` | Links (Bootstrap primary) |
| ![#28a745](https://via.placeholder.com/15/28a745/000000?text=+) | `#28a745` | Success states, delivered status |
| ![#FF9326](https://via.placeholder.com/15/FF9326/000000?text=+) | `#FF9326` | Medium priority, warnings |
| ![#cc0000](https://via.placeholder.com/15/cc0000/000000?text=+) | `#cc0000` | High priority |
| ![#ffc107](https://via.placeholder.com/15/ffc107/000000?text=+) | `#ffc107` | Units, warning badges |
| ![#17a2b8](https://via.placeholder.com/15/17a2b8/000000?text=+) | `#17a2b8` | Info states |

### Gradients
```css
/* Dashboard export button */
background: linear-gradient(135deg, rgb(140, 27, 36) 0%, rgb(160, 47, 56) 100%);

/* Notification reaction */
background-image: linear-gradient(45deg, #dc362e, #bf6525);
```

---

## 4. Typography

### Font Families
| Context | Font Stack | Defined In |
|---------|------------|------------|
| **Main Application** | `'Poppins', sans-serif` | `Styles/Layout/Layout.css` |
| **Bootstrap Default** | `'Roboto', system-ui, -apple-system, "Segoe UI", sans-serif` | `assets/css/main.css` |
| **Headings** | `'Nunito', sans-serif` | `assets/css/main.css` |
| **Navigation** | `'Inter', sans-serif` | `assets/css/main.css` |
| **Dashboard/Monitor** | `"Segoe UI", Tahoma, Geneva, Verdana, sans-serif` | `dashboard.css`, `monitorLog.css` |

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
```

### Font Weights
| Weight | Name | Usage |
|--------|------|-------|
| 300 | Light | Bootstrap display headings |
| 400 | Regular | Body text, default |
| 500 | Medium | Bootstrap components |
| 600 | Semi-bold | Headings, metric labels |
| 700 | Bold | Strong elements, important text |

### Font Sizes
| Element | Size | Context |
|---------|------|---------|
| **h1** | 2.5rem (40px) | Bootstrap default |
| **h2** | 2rem (32px) | Bootstrap default |
| **h3** | 1.75rem (28px) | Bootstrap default |
| **h4** | 1.5rem (24px) | Bootstrap default |
| **h5** | 1.25rem (20px) | Bootstrap default |
| **h6** | 1rem (16px) | Bootstrap default |
| **Body** | 1rem (16px) | Default |
| **Sidebar links** | 0.9rem (14.4px) | `Layout.css` |
| **Metric values** | 2em (32px) | Dashboard cards |
| **Metric labels** | 0.9em (14.4px) | Dashboard cards |
| **Table headers** | 20px | Production tables |
| **Table body** | 17px | Production tables (tablet: 17px) |
| **Status badges** | 0.8em (12.8px) | Badges |
| **Notification title** | 16px | Notifications |

---

## 5. Layout Architecture

### Main Layout Structure (`Views/Shared/_Layout.cshtml`)

```
+----------------------------------------------------------+
|  [Sidebar #0D0D0D]          |  [Main Content #fafbfe]    |
|  width: 70px / 210px        |                             |
|                             |  [Top Navbar]               |
|  [Logo 80% width]           |  Fecha/Hora | User | Logout |
|                             |                             |
|  > Dashboard                |                             |
|  > Compras                  |  [RenderBody()]             |
|  > CyC                      |                             |
|  > Planeación               |                             |
|  > Logistica                |                             |
|  > Ventas                   |                             |
|  > Almacén                  |                             |
|  > Producción               |                             |
|  > Mantenimiento            |                             |
|                             |                             |
|  [User Avatar]              |                             |
|  Version 1.43               |                             |
+----------------------------------------------------------+
```

### Sidebar Specifications
| State | Width | Behavior |
|-------|-------|----------|
| **Collapsed** | 70px | Only icons visible, text hidden |
| **Expanded** | 210px | Full menu with text labels |
| **Hover (collapsed)** | - | Dropdown submenus appear to the right |

### Sidebar CSS
```css
#sidebar {
    width: 70px;
    min-width: 70px;
    background-color: #0D0D0D;
    transition: all 0.25s ease-in-out;
    min-height: 100vh;
}

#sidebar.expand {
    width: 210px;
    min-width: 210px;
}

/* Hover effect on links */
a.sidebar-link:hover {
    background-color: rgba(255, 255, 255, 0.075);
    border-left: 8px solid #F20505;
}
```

### Main Content Area
```css
.wrapper {
    display: flex;
    width: 100%;
}

.main {
    min-height: 100vh;
    width: 100%;
    overflow: hidden;
    background-color: #fafbfe;
    transition: all 0.35s ease-in-out;
}

.main-body {
    max-height: 88vh;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
}
```

### Top Navbar
```css
.navbar {
    background-color: bg-body-tertiary;
}

#UserPerfil {
    color: #1e76bd;
    font-size: 0.8rem;
    font-weight: bold;
}

#ImageAvatar {
    height: 3rem;  /* Desktop */
    /* Tablet (750px-1300px): height: 2.3rem */
}
```

---

## 6. UI Components

### 6.1 Buttons

| Class | Background | Text | Border | Usage |
|-------|-------------|------|--------|-------|
| `.btn-pr` | `#8C1B24` | White | None | Primary actions |
| `.btn-prsuccess` | `#8C1B24` | White | None | Success actions |
| `.btn-prcancel` | `#343a40` | White | None | Cancel actions |
| `.btn-export` | Gradient red | White | None | Export to PDF/Excel |
| `.btn-login` | `#8c1b24` | White | None | Login form submit |
| `.btn-getstarted` | `#0d83fd` | White | None | Assets template CTA |

**Button Hover Effect:**
```css
.btn-pr:hover {
    opacity: 0.9;
    transform: scale(0.98);  /* Press effect */
}
```

### 6.2 Cards

```css
.card {
    border: none;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.card-header {
    background-color: rgb(74, 74, 74);
    color: white;
    font-weight: bold;
}

/* Dashboard metric cards */
.metric-card {
    background: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.metric-value {
    font-size: 2em;
    font-weight: bold;
    color: rgb(140, 27, 36);  /* --bs-redfn */
}

.metric-label {
    font-size: 0.9em;
    color: #666;
}
```

### 6.3 Tables

**DataTables Configuration:**
- Sticky headers with `position: sticky; top: 0; z-index: 10;`
- Striped rows with `--bs-grayf` (`#F0F1F2`)
- Hover highlight effect
- Custom scrollbar on `.table-scroll` (max-height: 70vh)

```css
/* Table header */
.table th {
    background-color: rgb(181, 181, 181);
    color: rgb(74, 74, 74);
    position: sticky;
    top: 0;
    z-index: 10;
}

/* Selected row */
.selectedrow > td {
    background-color: var(--bs-redfn) !important;
    color: white !important;
}

/* Scrollable table wrapper */
.table-scroll {
    max-height: 70vh;
    overflow-y: auto;
    position: relative;
}

.table-scroll thead th {
    position: sticky;
    top: 0;
    z-index: 5;
    background-color: #fff;
    box-shadow: 0 2px 6px rgba(0, 88, 161, 0.25);
}
```

### 6.4 Forms

**Login Form:**
```css
.form-login {
    background-color: #8080804f;  /* Semi-transparent gray */
    padding: 10px;
    border-radius: 10px;
}

.form-control {
    /* Bootstrap defaults with custom validation states */
}

.form-control:focus {
    border-color: #8C1B24;
    box-shadow: 0 0 0 0.2rem rgba(140, 27, 36, 0.25);
}
```

### 6.5 Modals

```css
.modalH {
    background-color: #343a40;  /* --bs-darkfl */
    color: #ffffff;
    border-bottom: none;
}

.modal-content {
    border-radius: 10px;
    border: none;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}
```

### 6.6 Notifications

```css
.notification {
    width: 380px;
    padding: 15px;
    background-color: white;
    border-radius: 16px;
    position: fixed;
    top: 100px;
    right: 15px;
    border: 2px solid #8d8b8b;
    z-index: 1055;
    animation: noti 3s forwards ease-in;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification-title {
    font-size: 16px;
    font-weight: bold;
    color: #1876F2;
}

.notification-status {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    display: inline-block;
}

.isOK { background-color: #198754; }
.isWarning { background-color: #ff7f07; }
.isError { background-color: #dc362e; }

/* Notification enter animation */
@keyframes noti {
    0% { opacity: 0; transform: translateX(100px); }
    20% { opacity: 1; transform: translateX(0); }
    80% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(100px); }
}
```

### 6.7 Progress Bars (Shipping Module)

```css
.progress-container {
    width: 100%;
    background-color: #e9ecef;
    border-radius: 4px;
    height: 24px;
    overflow: hidden;
}

.progress-bar-custom {
    height: 100%;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    font-size: 12px;
    text-align: center;
    transition: width 0.5s ease-in-out;
    background-color: #8C1B24;  /* Default: brand red */
}
```

### 6.8 Arrow Steps (Wizard)

```css
.arrow-steps {
    overflow: hidden;
    margin-bottom: 20px;
}

.arrow-steps .step {
    background-color: #F0F1F2;
    color: #666;
    padding: 10px 10px 10px 30px;
    float: left;
    position: relative;
    cursor: pointer;
}

.arrow-steps .step.done {
    color: #fff;
    background-color: #8C1B24;
}

.arrow-steps .step.current {
    color: #ffffff;
    font-weight: bold;
    background-color: #8d8b8b;
}
```

### 6.9 Context Menus (Right-Click)

```css
#MenuPrioridadComentarios,
#MenuContextBitacora,
#MenuContextDeleteRow,
#MenuNuevoRegistro {
    display: none;
    position: absolute;
    z-index: 1000;
    background-color: #fff;
    border: 1px solid #ccc;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    padding: 10px;
    border-radius: 5px;
    min-width: 150px;
}
```

---

## 7. Iconography

### Icon Libraries

| Library | Prefix | Location | Usage |
|---------|--------|----------|-------|
| **Bootstrap Icons** | `bi-` | `Styles/BootstrapIcons/` | Primary icon set |
| **Font Awesome** | `fa-`, `fas-`, `far-` | `fontawesome/Icons/css/` | Secondary icons |
| **Line Icons** | `lni-` | CDN: lineicons.com | Sidebar navigation |

### Common Sidebar Icons
| Menu Item | Icon Class |
|-----------|------------|
| Dashboard | `bi-bar-chart-line-fill` |
| Compras | `bi-clipboard2-data-fill` |
| CyC | `bi-filter-square-fill` |
| Planeación | `bi-signpost-2-fill` |
| Logistica | `bi-ui-checks` |
| Ventas | `bi-clipboard2-pulse` |
| Almacén | `bi-journal-bookmark-fill` |
| Producción | `bi-bar-chart-steps` |
| Mantenimiento | `bi-tools` |
| Logout | `lni-exit` |
| Toggle Sidebar | `lni-grid-alt` |

### Image Assets
| File | Location | Usage |
|------|----------|-------|
| `logoFisfiber.png` | `Images/` | Main logo (80% width in sidebar) |
| `FFISA.png` | `Images/` | Notification avatar |
| `Avatar.webp` | `Images/` | User avatar (mobile sidebar) |
| `iconUser.jpg` | `Images/` | User avatar (navbar) |
| `dashboard.svg` | `Images/` | Login page illustration |
| `ConEdi.svg` | `Images/` | Consulta/Edicion icon |
| `loader.gif` | `Images/` | Loading animation |
| `ckpicon.png` | `assets/img/` | Favicon (login page) |

---

## 8. Data Visualization

### Highcharts Theme
- Primary color: `#8C1B24`
- Background: transparent or `#fafbfe`
- Grid lines: `#dee2e6`

### Gauge Charts (Dashboard)
```css
.solid-gauge-container {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
}
```

### Heatmaps
- Used for production planning visualization
- Color axis: Custom range with brand colors

---

## 9. Responsive Design

### Bootstrap Breakpoints
| Breakpoint | Min Width | Target |
|------------|-----------|--------|
| xs | < 576px | Phones |
| sm | ≥ 576px | Large phones |
| md | ≥ 768px | Tablets |
| lg | ≥ 992px | Desktops |
| xl | ≥ 1200px | Large desktops |

### Tablet Optimizations (750px - 1300px)
```css
@media only screen and (min-width: 750px) and (max-width: 1300px) {
    .dropdown-item { font-size: 21px !important; }
    #ImageAvatar { height: 2.3rem !important; }
    .sidebar-nav .sidebar-item > .sidebar-link > span { font-size: 25px; }
    .sidebar-nav .sidebar-item > .sidebar-link > i { font-size: 25px; }
    #tablaOVSelected thead, #tablaOVSelected thead * { font-size: 22px; }
    #tablaOVSelected tbody, #tablaOVSelected tbody * { font-size: 17px; }
}
```

### Mobile Adaptations (< 768px)
```css
@media (max-width: 768px) {
    .form-login { width: 75% !important; }
    #imgdash { display: none; }
    .sidebar { transform: translateX(-100%); }
}

@media (max-width: 697px) {
    .showMovil { display: block !important; }
    .hideMovil { display: none !important; }
    #cfh { margin: 0 auto !important; }
    .sidebar-user-avatar {
        transform: rotate(90deg);
    }
}
```

### Print Styles
```css
@media print {
    .no-print { display: none !important; }
    body { background: white !important; }
    .card { box-shadow: none; border: 1px solid #ddd; }
    .main-body { max-height: none; overflow: visible; }
}
```

---

## 10. Animations & Effects

### Text Hover Effects (`Styles/Layout/TextHooverEfects.css`)

10 distinct hover animation effects available:

| Effect | Class | Description |
|--------|-------|-------------|
| 1 | `.effect-1` | Left-to-right underline expand |
| 2 | `.effect-2` | Right-to-left underline expand |
| 3 | `.effect-3` | Center-expand underline |
| 4 | `.effect-4` | Text replacement on hover |
| 5 | `.effect-5` | Background slide with text reveal |
| 6 | `.effect-6` | Vertical text reveal |
| 7 | `.effect-7` | Dual underline (left + right) |
| 8 | `.effect-8` | Box border animation |
| 9 | `.effect-9` | Delayed border animation |
| 10 | `.effect-10` | Dual center underline |

**Hover Colors:** `#434343`, `#343434`, `#4caf50` (green)

### Blinking Animation (Drag & Drop)
```css
@keyframes blink-background {
    0% { background-color: transparent; }
    50% { background-color: #1e76bd; }
    100% { background-color: transparent; }
}

.draggingv2 {
    color: #FFFFFF !important;
    font-weight: bold;
    animation: blink-background 2s infinite;
}
```

### Dragging State Classes
| Class | Width | Purpose |
|-------|--------|---------|
| `.draggingv2` | 300px | Dragging rows v2 |
| `.draggingv2FC` | 250px | Dragging FC variant |
| `.draggingv2Column10` | 500px | Dragging column 10 |
| `.draggingv3` | 250px | Dragging rows v3 |
| `.draggingCPP` | revert-layer | CPP dragging state |

---

## 11. State & Status Colors

### Priority System
| Priority | Background | Text | Class |
|----------|-------------|------|-------|
| **Alta (High)** | `#cc0000` | White | `.PrioridadAlta` |
| **Media (Medium)** | `#FF9326` | White | `.PrioridadMedia` |
| **Baja (Low)** | `#00ff00` | White | `.PrioridadBaja` |

### Status Badges (Monitor Log)
| Status | Background | Text | Usage |
|--------|-------------|------|-------|
| **Terminado (Done)** | `#e8f5e9` | `#2e7d32` | Completed items |
| **Proceso (In Process)** | `#fff3e0` | `#ef6c00` | In-progress items |
| **Carga (Loading)** | `#e3f2fd` | `#1565c0` | Loading state |
| **Cola (Queue)** | `#ffe0e0` | `#ef0000` | Queued items |

### Row State Classes
| Class | Purpose | Styling |
|-------|---------|---------|
| `.RowAttend` | Attention required | 3px solid `#d32018` border |
| `.bg-alert` | Alert state | `rgba(250, 122, 48, 0.63)` background |
| `.row-highlight` | Highlighted row | `#ffe08a` background |
| `.OVfinisihed` | Finished OV | Aqua background |
| `.unidadP` | Unit priority | `#ffc10775` background (yellow) |
| `.tabla-bloqueada` | Disabled table | `opacity: 0.6` |

### Notification Types
| Type | Status Color | Icon |
|------|-------------|------|
| Success | `#198754` (green) | `fa-check-circle` |
| Warning | `#ff7f07` (orange) | `fa-triangle-exclamation` |
| Error | `#dc362e` (red) | `fa-times-circle` |

---

## 12. File Structure

### Stylesheets Directory Map
```
Fisfiber/
├── Styles/
│   ├── Layout/
│   │   ├── Layout.css              # Main layout styles
│   │   ├── TextHooverEfects.css    # Hover animations (10 effects)
│   │   └── custom.css              # Additional layout overrides
│   ├── Bootstrap/
│   │   ├── custom-colors.css       # CSS variables (--bs-redfn, etc.)
│   │   ├── bootstrap.min.css       # Bootstrap 4.3.1
│   │   ├── bootstrap.css           # Bootstrap source
│   │   ├── ionicons.min.css        # Ion icons
│   │   └── style.css              # Bootstrap overrides
│   ├── BootstrapIcons/
│   │   └── bootstrap-icons.min.css # Bootstrap Icons 1.11.3
│   ├── Dashboard/
│   │   └── dashboard.css           # Dashboard cards, metrics
│   ├── Login/
│   │   └── Login.css               # Login page styles
│   ├── Datatables/
│   │   └── datatables.min.css      # DataTables styling
│   ├── TableScrollH.css            # Horizontal scroll tables
│   ├── MonitorLog/
│   │   └── monitorLog.css          # System monitoring UI
│   ├── Produccion/                 # Production module styles
│   │   ├── Paros.css
│   │   ├── Reportes.css
│   │   └── ...
│   ├── PlanProduccion/             # Planning module styles
│   │   ├── PlanPro.css
│   │   └── ConsultaEdicion.css
│   ├── PlanVentas/
│   │   └── Autorizacion.css
│   └── PlanEmb/
│       └── *.css                   # Shipping module styles
├── Content/                        # Additional Bootstrap variants
│   ├── bootstrap.css
│   ├── grid.css
│   ├── utilities.css
│   └── reboot.css
├── fontawesome/Icons/css/
│   ├── fontawesome.css
│   ├── brands.css
│   ├── solid.css
│   └── regular.css
└── assets/                         # Login template assets
    ├── vendor/
    │   └── bootstrap/css/          # Bootstrap 5.3.3
    └── css/
        └── main.css                # Login page styles
```

### JavaScript Directory Map
```
Fisfiber/Scripts/
├── Layout/
│   ├── Layout.js                   # Main layout logic
│   └── service-worker.js           # PWA service worker
├── Jquery/
│   ├── jquery-3.7.1.min.js
│   └── jquery-ui.min.js
├── Bootstrap/
│   └── bootstrap.bundle.min.js
├── Datatables/
│   └── datatables.min.js
├── Highcharts/
│   ├── highcharts.js
│   ├── highcharts-more.js
│   ├── solid-gauge.js
│   └── heatmap.js
├── Loading/
│   ├── jquery.preloaders.js
│   └── Loading.js
└── SignalR/
    └── jquery.signalR-2.4.3.min.js
```

---

## 13. SignalR Hubs

| Hub Class | File | Purpose |
|-----------|------|---------|
| `ProductionHub` | `Hubs/ProductionHub.cs` | Notify production updates |
| `DashTendPesosHub` | `Hubs/DashTendPesosHub.cs` | Dashboard peso updates |
| `EstatusEnvioHub` | `Hubs/EstatusEnvioHub.cs` | Shipping status |
| `ProgresoCargaHub` | `Hubs/ProgresoCargaHub.cs` | Load progress |
| `ParosHub` | `Hubs/ParosHub.cs` | Production stoppages |
| `EntregasMercanciaHub` | `Hubs/EntregasMercanciaHub.cs` | Merchandise delivery |

**Hub Connection (from Layout):**
```html
<script src="~/Scripts/jquery.signalR-2.4.3.min.js?v=1.0.0"></script>
<script src="~/signalr/hubs"></script>
```

**Body Attributes for Hub Methods:**
```html
<body 
    estatusproduccion="@Url.Action("GetEstatusProduccion","Global")"
    estatuscarga="@Url.Action("GetEstatusCarga","Global")"
    leernotificacion="@Url.Action("NotifiLeidas","Global")"
    consultarnotificacion="@Url.Action("NotifiPend","Global")"
    data-toggle="tooltip"
    data-placement="top">
```

---

## 14. CSS Load Order (Critical)

The order of CSS loading in `_Layout.cshtml` matters:

```html
<!-- 1. Icon libraries first -->
<link href="https://cdn.lineicons.com/4.0/lineicons.css" />
<link href="~/Styles/BootstrapIcons/bootstrap-icons.min.css">

<!-- 2. Layout base styles -->
<link href="~/Styles/Layout/Layout.css">
<link href="~/Styles/Bootstrap/custom-colors.css">
<link href="~/Styles/Layout/TextHooverEfects.css">

<!-- 3. Additional icon sets -->
<link href="~/Styles/Bootstrap/ionicons.min.css">
<link href="~/Styles/Bootstrap/style.css">
<link href="~/fontawesome/Icons/css/fontawesome.css">
<link href="~/fontawesome/Icons/css/brands.css">
<link href="~/fontawesome/Icons/css/solid.css">

<!-- 4. Bootstrap framework -->
<link href="~/Styles/Bootstrap/bootstrap.min.css">

<!-- 5. DataTables and plugins -->
<link href="~/Styles/Datatables/datatables.min.css">
<link href="~/Content/TopScrollTable.css">
```

---

## 15. Summary Design Tokens

### Quick Reference
```css
/* Colors */
--primary: #8C1B24;
--primary-medium: #BF0F3E;
--primary-light: #F20505;
--sidebar-bg: #0D0D0D;
--body-bg: #fafbfe;
--card-bg: #ffffff;

/* Typography */
--font-main: 'Poppins', sans-serif;
--font-heading: 'Nunito', sans-serif;
--font-size-base: 16px;

/* Spacing */
--sidebar-width-collapsed: 70px;
--sidebar-width-expanded: 210px;
--navbar-height: auto;
--content-max-height: 88vh;

/* Borders */
--border-radius-sm: 5px;
--border-radius-md: 10px;
--border-radius-lg: 15px;
--border-radius-pill: 15px;  /* For badges */

/* Shadows */
--shadow-card: 0 4px 15px rgba(0, 0, 0, 0.1);
--shadow-modal: 0 5px 20px rgba(0, 0, 0, 0.2);
--shadow-table-header: 0 2px 6px rgba(0, 88, 161, 0.25);
```

---

**End of Design System Documentation**

> This document serves as the complete UI/UX specification for the FISFIBER web application. Use it as a reference when building new components, maintaining existing ones, or recreating the design system.

# Property Management & Executive Analytics Dashboard (Nuxt 4)

A complete, production-grade Property Management & Analytics Web Application built exclusively with **Nuxt 4**, **Vue 3**, **SQLite**, and **Drizzle ORM**.

The application imports, stores, analyzes, visualizes, and manages all data from the provided Excel workbook:
`Property Units Exp-Property Units Target.xlsx` (Worksheet: `Property_Units`, **1,034 data records**, **92 columns**).

---

## 🚀 Key Features & Highlights

- **Nuxt 4 Full-Stack Architecture**: Monolithic, high-performance architecture with complete client `app/` and server `server/` separation with Nuxt Nitro backend routes.
- **Real Persistent Database**: SQLite database stored persistently at `data/app.db` with WAL mode enabled. Auto-migrates tables and auto-imports the workbook on initial boot.
- **Preservation of All 92 Source Columns**: Employs a hybrid relational schema with indexed query columns (`PROPERTYID`, `UNITID`, `BLOCKID`, `FLOORID`, `SALESUNITSTATUS`, etc.) and a complete `rawData` JSON column retaining every single original Excel field.
- **14 Audited Executive KPIs**: Server-side SQL aggregations separating sold (931) vs available (103), occupied vs vacant, and distinct unit IDs (529) vs total records (1,034).
- **Interactive Apache ECharts**: Doughnut, bar, histogram, and comparison charts responding in real-time to global multi-filters. Clicking chart bars navigates directly to filtered units.
- **Property Management & Comparison**: Grid & table views, property cards with sales absorption rates, in-depth property profile pages (`/properties/[id]`), and a side-by-side comparison modal.
- **Enterprise Units Inventory**: Server-side paginated & sorted table (`/units`), 92-column visibility selector, full-text search, CSV export, and unit details drawer/page (`/units/[id]`) organized into 8 business categories.
- **Dedicated Analytics Modules**:
  - **Sales Analytics** (`/analytics/sales`): Revenue by property/block/floor, highest and lowest value assets, tax analysis.
  - **Financial Analytics** (`/analytics/financial`): Property revenue ranking, currency breakdown, and financial anomaly detector.
  - **Inventory Analytics** (`/analytics/inventory`): Availability vs physical occupancy and conflicting status flags audit.
- **Source Data Explorer** (`/data-explorer`): Interactive inspector allowing users to explore all 92 source columns, field-level completeness %, null counts, and raw JSON.
- **Excel Import & Rollback Engine** (`/imports`): Drag-and-drop `.xlsx` upload, column header matcher, 20-row preview, validation issues audit, strategy picker (`replace`, `update`, `append`), batch tracking, and one-click rollback.
- **Executive Reports & Exports** (`/reports`): On-demand server generation of audited Excel (`.xlsx`) workbooks and PDF (`.pdf`) documents.
- **Bilingual & Responsive Design**: Arabic (RTL) and English (LTR) with dark navy sidebar, emerald green accents, and subtle borders.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **Nuxt 4** (`v4.6.3`) | Full-stack Vue 3 framework |
| **Vue 3** (`v3.5.44`) | Reactive UI components |
| **TypeScript** | End-to-end type safety |
| **Nuxt Nitro** | Server API and backend endpoints |
| **SQLite** (`better-sqlite3`) | Persistent embedded database |
| **Drizzle ORM** | Schema, queries, and type safety |
| **Pinia** | Client-side state management |
| **PrimeVue & Tailwind CSS** | SaaS enterprise styling |
| **Apache ECharts** | Interactive data visualizations |
| **ExcelJS & xlsx** | Excel parsing and report generation |
| **jsPDF & jspdf-autotable** | PDF document generation |
| **Day.js & Zod** | Validation and date parsing |

---

## 📦 Getting Started

### 1. Installation

```bash
# Clone the repository and navigate to the directory
cd "d:/Finance App"

# Install dependencies
npm install
```

### 2. Development Server

```bash
# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser. The default administrator account is pre-authenticated:
- **Email**: `admin@property.com`
- **Password**: `admin123`

### 3. Production Build & Execution

The application is built for Node.js production deployment:

```bash
# Compile client and Nitro server bundle
npm run build

# Run production server
node .output/server/index.mjs
```

---

## 🗄️ Database Architecture & Storage

- **Database Path**: `data/app.db`
- **Backup & Persistence**: The SQLite file resides in the `data/` folder on persistent disk storage. To backup the database, copy `data/app.db` or use SQLite `.backup`.
- **Auto-Seed**: On server boot, if the `units` table is empty, `ImportService.ensureDatasetImported()` automatically parses `data/Property Units Exp-Property Units Target.xlsx` and seeds all 1,034 records and 9 normalized properties.

---

## 📋 Implementation Checklist

- [x] Initial inspection of Excel workbook (`1,034` rows, `92` columns).
- [x] Nuxt 4 architecture with `app/` and root `server/` separation.
- [x] Drizzle ORM schema for properties, units, import batches, issues, users, and settings.
- [x] Auto-seeding initial workbook into persistent SQLite (`data/app.db`).
- [x] Preserved all 92 source columns in `rawData` JSON with indexed columns.
- [x] Executive Dashboard (`/dashboard`) with 14 KPIs and 6 interactive ECharts.
- [x] Global multi-filters (property, block, floor, unit type, status, currency).
- [x] Chart segment click navigation directly to filtered units.
- [x] Properties Management (`/properties`) with Grid/Table toggle and comparison modal.
- [x] Property Details (`/properties/[id]`) with 8 analytical sections.
- [x] Units Inventory (`/units`) with server-side pagination, sorting, search, and 92-column selector.
- [x] Unit Details (`/units/[id]`) organizing all 92 fields into 8 business categories.
- [x] Sales Analytics (`/analytics/sales`) with top/lowest value assets and revenue breakdown.
- [x] Financial Analytics (`/analytics/financial`) with property rankings and anomaly detection.
- [x] Inventory Analytics (`/analytics/inventory`) with occupancy and conflict flags audit.
- [x] Data Explorer (`/data-explorer`) inspecting all 92 fields with completeness stats.
- [x] Excel Import Manager (`/imports`) with validation, preview, strategy selector, and rollback.
- [x] Reports Page (`/reports`) with Excel (.xlsx) and PDF (.pdf) generation.
- [x] Full Arabic (RTL) and English (LTR) language support.
- [x] Successful production build and verified live server execution.

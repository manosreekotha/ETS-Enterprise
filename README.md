# ETS Employee Dashboard & Workforce Intelligence System

An enterprise-grade, high-performance Full-Stack Workforce Analytics Dashboard and AI Copilot designed to analyze, visualize, and query human resource, skill inventory, multi-year compensation, and attendance data across **590 employees**.

This application replicates and enhances all 7 modules from the original Power BI report (`Emp_7.21.pbix`) and Excel dataset (`ETS_Dasboard_DS.xlsx`), featuring a **strict zero-page-scrollbar layout**, **dense executive card spacing**, and an **integrated natural-language AI Workforce Copilot**.

---

## 🌟 Key Highlights & Design Innovations

- **Zero Global Window Scrollbars**: The UI is strictly fitted to `100vh` (`h-screen overflow-hidden`) with zero outer page scrollbars. All tables and list containers utilize smooth, internal micro-scrollbars with pagination.
- **High-Density Compact Spacing**: Zero wasted screen real estate with tightened grid gaps (`gap-2`), compact padding (`p-2.5`), and maximum information density.
- **7 Specialized Analytics Modules**: 100% feature coverage spanning executive headcount, state delivery hierarchy, employee 360 profiles, skill matrix, salary analytics, promotion hike impact, and interactive leave calendars.
- **Built-in AI Copilot Agent**: An interactive conversational intelligence drawer capable of answering ad-hoc analytical queries with automated text summaries and in-chat dynamic charts.
- **Interactive Drill-Through**: Seamless navigation from any high-level table (Statewise, Salary, or Skills) directly into an employee's 360-degree profile.

---

## 📑 Dashboard Modules & Features

| # | Module Name | Description & Visual Features |
| :-: | :--- | :--- |
| **1** | **ETS EMPLOYEE DASHBOARD** | **Executive Overview**: 6 Core KPI cards (Headcount, Gender Split, Avg Tenure, Prior Exp, Total Exp), Recent Hirings Donut Chart, Historical Attrition Rate by Year Bar Chart, Geographic Hub Spread, and Quick-Jump module navigators. |
| **2** | **Statewise dashboard** | **Regional Analytics**: Dynamic State Delivery Manager (SDM) lead badge (NH, ND, AK), Experience Analysis by Grade (Prior vs ETS Tenure), Grade × Project distribution, Geography × Grade breakdown, and a searchable, paginated employee roster with **CSV Export**. |
| **3** | **ETS employee details** | **Employee 360 Profile**: Searchable 590-employee autocomplete selector, 360 avatar header, contact info, competency skill pills, fresh edge capabilities, dual-axis financial progression chart (Base, Bonus, Perks, Hike %), and multi-year compensation pivot table. |
| **4** | **Tech wise dashboard** | **Competency Matrix**: Unique Skills count, Most Common Skill KPI, Missing Skills inventory gap, Skill distribution by proficiency level (Advanced vs Intermediate), Reporting Manager × Grade heatmap pivot matrix, and full skill inventory roster. |
| **5** | **salary wise dashboard** | **Payroll & Compensation Overview**: Min/Max/Avg/Total Salary and CTC metrics, Total Bonus & Perks expenditure, Reporting Manager × Grade CTC expenditure matrix, and Top N Earners table with **Top 5 / 10 / 25** quick-switch toggles. |
| **6** | **salary2 wise dasboard** | **Advanced Financial Progression**: Department Average Base vs CTC Comparison, 5-Year Compensation Progression Line Chart (2020–2024), Pre vs Post Promotion Hike Combo Chart, Component-wise Stacked Area by Salary Band, and Monthly Salary (`M_Salary`) distribution. |
| **7** | **employee calendar** | **Attendance & Time-Off**: Interactive monthly calendar grid (January 2024) with color-coded event badges, clickable date inspector roster, Project Working spread donut chart, and Workforce Geography × Grade cross-tabulation matrix. |
| **8** | **AI Copilot Assistant** | **Conversational NLP Drawer**: Slide-over drawer providing instant answers to workforce questions, smart metric lookups, and auto-generated Recharts mini visualizers. |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS (Tailored dark mode, glowing accents, compact micro-elements)
- **Charts & Data Viz**: Recharts (ComposedChart, BarChart, LineChart, PieChart, AreaChart)
- **Icons**: Lucide React
- **Build Tool**: Vite (Configured for port `3036` and proxying `/api` to port `8000`)
- **HTTP Client**: Axios

### Backend
- **Framework**: Python 3.10+ / FastAPI (Asynchronous high-performance REST API)
- **Data Engine**: Pandas & NumPy (In-memory analytics, vector operations, and DAX equivalents)
- **Excel Ingestion**: OpenPyXL
- **Data Validation**: Pydantic v2
- **ASGI Server**: Uvicorn

---

## 📁 Project Structure

```text
ETS EMPLOYEE DASHBOARD/
│
├── ARCHITECTURE.md                 # Standalone master architecture documentation
├── README.md                       # Main project documentation & setup guide
├── run_dashboard.bat               # 1-click script to start both Backend & Frontend
├── start_backend.bat               # Batch script to start FastAPI backend
├── start_frontend.bat              # Batch script to start Vite frontend
├── ETS_Dasboard_DS.xlsx            # Source Excel dataset (590 emps, 21 skills, 65 finance, 799 leaves)
├── Emp_7.21.pbix                   # Original Power BI report blueprint
│
├── backend/                        # FastAPI Backend Application
│   ├── requirements.txt            # Python dependencies
│   └── app/
│       ├── main.py                 # FastAPI application root & CORS setup
│       ├── data_loader.py          # In-memory ETL & schema transformation engine
│       ├── analytics.py            # Multidimensional DAX aggregation engine
│       ├── ai_agent.py             # NLP query parser & workforce intelligence agent
│       ├── models.py               # Pydantic data schemas & response contracts
│       └── routers/                # Domain routers
│           ├── home.py             # Tab 1: Executive Overview routes
│           ├── statewise.py        # Tab 2: Statewise routes
│           ├── employee_details.py # Tab 3: Employee 360 profile routes
│           ├── techwise.py         # Tab 4: Techwise skill routes
│           ├── salarywise.py       # Tab 5: Salarywise routes
│           ├── salarywise2.py      # Tab 6: Salarywise2 advanced financial routes
│           ├── calendar_leave.py   # Tab 7: Calendar & leave routes
│           └── copilot.py          # Tab 8: AI Copilot endpoint
│
├── frontend/                       # React 18 + TypeScript Frontend Application
│   ├── package.json                # NPM package definitions & scripts
│   ├── vite.config.ts              # Vite config (Port 3036, API proxy)
│   ├── tailwind.config.js          # Tailwind CSS theme & plugin configs
│   ├── tsconfig.json               # TypeScript project configuration
│   └── src/
│       ├── main.tsx                # React DOM root entrypoint
│       ├── App.tsx                 # Master shell container (Zero-scroll manager)
│       ├── index.css               # Zero-scroll rules, glassmorphism, micro-scrollbars
│       ├── api/
│       │   └── client.ts           # Axios REST API client methods
│       ├── types/
│       │   └── dashboard.ts        # TypeScript interfaces for all 8 domains
│       ├── components/
│       │   ├── layout/             # Header, FilterBar, Navigation
│       │   ├── common/             # KPICard, ExportButton, MicroTable
│       │   ├── tabs/               # All 7 Dashboard Tab Views
│       │   │   ├── HomeDashboard.tsx
│       │   │   ├── StatewiseDashboard.tsx
│       │   │   ├── EmployeeDetailsDashboard.tsx
│       │   │   ├── TechwiseDashboard.tsx
│       │   │   ├── SalarywiseDashboard.tsx
│       │   │   ├── Salarywise2Dashboard.tsx
│       │   │   └── EmployeeCalendarDashboard.tsx
│       │   └── copilot/
│       │       └── AICopilotDrawer.tsx
│
└── .vscode/                        # Visual Studio Code configuration
    └── tasks.json                  # VS Code multi-task build runner
```

---

## 🚀 Getting Started & Execution Guide

### Prerequisites
- **Python**: Version 3.10 or higher
- **Node.js**: Version 18 or higher (with `npm`)

---

### Step 1: Install Dependencies

#### Python Backend:
```powershell
pip install -r backend/requirements.txt
```

#### React Frontend:
```powershell
cd frontend
npm install
cd ..
```

---

### Step 2: Running the Project in VS Code

You can run both servers simultaneously using either of the methods below:

#### Method A: VS Code Split Terminals (Recommended)

1. **Open Terminal 1 (Backend - FastAPI)**:
   ```powershell
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   > 🟢 Backend API will be live at: **`http://127.0.0.1:8000`**  
   > 🩺 Health Check: **`http://127.0.0.1:8000/api/health`**

2. **Open Terminal 2 (Frontend - React Vite)**:
   ```powershell
   cd frontend
   npm run dev
   ```
   > 🌐 Frontend Dashboard will be live at: **`http://localhost:3036`**

---

#### Method B: 1-Click Batch Launcher
Double-click `run_dashboard.bat` in File Explorer, or run in PowerShell:
```powershell
.un_dashboard.bat
```
*This command automatically spawns both servers in dedicated windows.*

---

## 📡 REST API Endpoint Documentation

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/health` | System health check and backend version |
| `GET` | `/api/home/kpis` | Executive summary metrics, diversity, hiring & attrition |
| `GET` | `/api/home/filters` | Global slicer dropdown options (States, Grades, Locations, etc.) |
| `GET` | `/api/statewise/kpis` | Regional metrics, SDM lead, grade experience, roster |
| `GET` | `/api/employee/list` | Lightweight listing of all 590 employees for autocomplete |
| `GET` | `/api/employee/{emp_number}` | 360-degree employee profile, skill inventory, finance history |
| `GET` | `/api/techwise/kpis` | Unique skills, proficiency breakdown, Manager × Grade matrix |
| `GET` | `/api/salarywise/kpis` | Base & CTC metrics, Manager × Grade CTC matrix, Top earners |
| `GET` | `/api/salarywise2/kpis` | Department averages, 5-year trends, promotion hikes, salary bins |
| `GET` | `/api/calendar/data` | Annual leave days, daily schedule events, project distribution |
| `POST`| `/api/copilot/query` | Natural language NLP query processing & chart generation |

---

## 📖 Deep Architecture & Technical Specs

For the complete technical blueprint, entity-relationship diagrams, DAX translation models, and performance benchmarks, refer to:
👉 **[`ARCHITECTURE.md`](ARCHITECTURE.md)**

---

## 📄 License
Internal ETS Employee Workforce Intelligence System — Confidential & Proprietary.

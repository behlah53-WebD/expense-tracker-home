# 🌌 Expense Tracker LEDGER
> **A dark, glowing northern-lights personal finance tracker.** Money feels alive: income flows in as emerald and mint light, expenses flow out as coral and magenta light, resting on frosted-glass cards over a deep midnight canvas.

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5_Beta-purple?style=flat)](https://authjs.dev/)

---

## ✨ Signature Expense Tracker Elements

1. **Expense Tracker Canvas Background**: Three massive blurred gradient blobs (electric violet `#7C5CFF`, aqua cyan `#38D5FF`, and coral magenta `#FF5C8A`) floating in a continuous, smooth 25s loop behind all views with a subtle 2.5% fractal noise grain overlay.
2. **Dynamic Balance Orb**: A central glowing animated 3D sphere on the dashboard whose color changes dynamically based on your savings rate:
   - 🟢 **Mint/Emerald (`#2EF2B0`)**: Healthy savings rate ($\ge 20\%$)
   - 🟡 **Amber/Gold (`#FFC857`)**: Cautionary savings rate ($5\% - 19.9\%$)
   - 🔴 **Coral/Magenta (`#FF5C8A`)**: Attention / Overspending ($< 5\%$)
   Features subtle orbital rotation, multi-stage radial glows, and specular reflections.
3. **Asymmetric Bento-Grid Dashboard**: Precision layout grouping the 2x2 Balance Orb, Income/Expense sparkline tiles, gold circular savings ring, glowing cash flow stream, category donut, recent activity, and monthly budget progress.
4. **Glowing Cash Flow Chart**: SVG drop-shadow filter line graphs (`filter: drop-shadow`) with animated draw-in and timeframe toggle (`7D` / `30D` / `12M`).
5. **Fluid Count-Up Numbers**: Monospace numbers with `font-variant-numeric: tabular-nums` count-up animated over 800ms with cubic ease-out.
6. **Dual-Mode Glass Navigation**:
   - **Desktop**: 80px slim glass icon sidebar expanding to 240px on hover with active glowing violet pills.
   - **Mobile**: macOS-style floating bottom dock with 5 icons and a raised, pulsing gradient "+" action button.
7. **Cursor Spotlight Glow**: Frosted glass cards track the mouse position to cast a subtle, interactive radial light aura.
8. **Motion Accessibility**: Fully honors `prefers-reduced-motion` across background blobs, orb breathing, and number counting.

---

## 🎨 Color System

### Dark Theme: "Midnight Expense Tracker" (Default)
| Variable | Hex / Value | Description |
|---|---|---|
| `--bg-base` | `#070A1A` | Deep midnight space canvas |
| `--bg-elevated` | `#0E1230` | Elevated glass card background |
| `--surface` | `rgba(255,255,255,0.05)` | Frosted glass surface |
| `--border` | `rgba(255,255,255,0.10)` | Translucent boundary border |
| `--primary` | `#7C5CFF` | Electric violet accent |
| `--primary-glow`| `#A78BFF` | Violet neon aura |
| `--income` | `#2EF2B0` | Northern lights emerald mint |
| `--expense` | `#FF5C8A` | Solar flare coral |
| `--accent-cyan` | `#38D5FF` | Arctic aqua cyan |
| `--accent-gold` | `#FFC857` | Radiant gold |

### Light Theme: "Pearl Expense Tracker"
| Variable | Hex / Value | Description |
|---|---|---|
| `--bg-base` | `#F6F5FF` | Soft pearlescent lavender |
| `--bg-elevated` | `#FFFFFF` | Crisp elevated surface |
| `--surface` | `rgba(255,255,255,0.75)` | High-contrast frosted glass |
| `--border` | `rgba(124,92,255,0.15)`| Violet-tinted boundary |
| `--income` | `#059669` | Emerald green |
| `--expense` | `#E11D5A` | Vivid crimson rose |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router, Server & Client Components)
- **Language**: TypeScript (Strict mode enabled)
- **Styling**: Tailwind CSS, Tailwind Animate, Custom CSS Variables
- **Animations**: Framer Motion, CSS Keyframe Animations
- **Visuals & Charts**: Recharts, Lucide Icons, SVG Drop-Shadow Filters
- **Theming**: `next-themes` (Midnight Dark / Pearl Light / System)
- **Database & ORM**: Prisma ORM with SQLite for zero-config local development (or PostgreSQL for cloud production)
- **Authentication**: Auth.js (NextAuth v5 beta) with Credentials + Google OAuth, bcrypt password hashing, JWT sessions, and route-protecting middleware
- **Validation**: Zod + React Hook Form + `@hookform/resolvers`
- **State & Data Fetching**: TanStack React Query v5
- **Toasts**: Sonner
- **Typography**: Next/font with Google Fonts:
  - Headings: **Sora**
  - Body & UI: **Inter**
  - Amounts & Currency: **JetBrains Mono** with tabular numerals

---

## 🚀 Quick Start & Setup

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` settings:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="Expense Tracker_ledger_super_secret_session_jwt_key_2025_998877"
NEXTAUTH_SECRET="Expense Tracker_ledger_super_secret_session_jwt_key_2025_998877"
NEXTAUTH_URL="http://localhost:3000"

# Optional Google OAuth
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

### 3. Initialize Database & Seed Demo Data
```bash
# Push database schema to SQLite
npm run db:push

# Seed with Alex Vance, 14 default categories, 6 budgets, and 84 realistic transactions
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Demo Account Credentials

Use the pre-configured demo user to test all features immediately:
- **Email**: `demo@Expense Trackerledger.com`
- **Password**: `Password123!`
*(The Login page includes an **"Auto Fill"** button that populates these credentials with one click).*

---

## 📡 REST API Reference

All endpoints check user session, scope queries to the authenticated user ID, and validate inputs with Zod:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create user account with bcrypt hash and default categories |
| `GET` | `/api/transactions` | Filterable transaction query (`type`, `categoryId`, `from`, `to`, `q`, `page`, `limit`, `sort`) |
| `POST` | `/api/transactions` | Record a new transaction with category verification |
| `GET` | `/api/transactions/:id` | Fetch a single transaction |
| `PUT` | `/api/transactions/:id` | Update an existing transaction |
| `DELETE` | `/api/transactions/:id`| Delete transaction |
| `GET` | `/api/categories` | Retrieve user expense/income categories |
| `POST` | `/api/categories` | Create custom category (name, color, icon, type) |
| `DELETE` | `/api/categories/:id` | Delete category (checks transaction constraints) |
| `GET` | `/api/budgets` | Fetch monthly category budgets with actual spending vs limit |
| `POST` | `/api/budgets` | Upsert monthly category budget limit |
| `DELETE` | `/api/budgets?id=:id`| Delete budget threshold |
| `GET` | `/api/reports/summary` | All-time balance, monthly totals, deltas vs last month, recent 6 txs |
| `GET` | `/api/reports/monthly` | 12-month income/expense, plus 30-day and 7-day trajectories |
| `GET` | `/api/reports/categories`| Category breakdown by range, top 5 expenses, rule-based AI insights |
| `GET` | `/api/reports/export?format=csv` | RFC-4180 compliant CSV stream of transactions |
| `PUT` | `/api/user/profile` | Update display name and preferred currency |
| `PUT` | `/api/user/password` | Secure password update with current password validation |
| `DELETE` | `/api/user/delete` | Danger zone: cascade wipe account and all records |

---

## 📁 File Structure

```
├── prisma/
│   ├── schema.prisma          # Database models (User, Category, Transaction, Budget, Auth)
│   └── seed.ts                # Realistic 6-month demo dataset seed
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx # Split 3D parallax layout login screen
│   │   │   └── register/page.tsx # Register screen with password strength meter
│   │   ├── (app)/
│   │   │   ├── layout.tsx     # AppLayout wrapper
│   │   │   ├── dashboard/page.tsx # Asymmetric Bento-grid dashboard
│   │   │   ├── transactions/page.tsx # Table, search, filters, pagination, drawer
│   │   │   ├── income/page.tsx   # Mint-themed income channels and source charts
│   │   │   ├── reports/page.tsx  # Grouped bars, trend lines, ranked top 5, CSV export
│   │   │   └── settings/page.tsx # Themes, currency, categories, budgets, danger zone
│   │   ├── api/               # All Zod-validated REST endpoints
│   │   ├── layout.tsx         # Root layout with fonts and providers
│   │   └── page.tsx           # Redirect landing page
│   ├── components/
│   │   ├── auth/              # AuthVisualHero 3D tilted card
│   │   ├── charts/            # GlowingCashFlow, CategoryDonut
│   │   ├── dashboard/         # BalanceOrb, StatCard, SavingsRing, BudgetProgress, Recent
│   │   ├── forms/             # TransactionDrawer slide-over form
│   │   ├── layout/            # Sidebar (desktop), BottomDock (mobile), Topbar
│   │   ├── ui/                # Expense TrackerBackground, GlassCard, CountUpAmount, CategoryIcon
│   │   └── providers.tsx      # NextThemes, QueryClient, NextAuth, Sonner
│   ├── hooks/
│   │   ├── useCountUp.ts      # 800ms cubic ease-out money counter
│   │   ├── useTransactions.ts # TanStack Query transaction mutations
│   │   ├── useReports.ts      # Analytical summary and trend hooks
│   │   ├── useCategories.ts   # Category CRUD queries
│   │   └── useBudgets.ts      # Budget limits and progress queries
│   ├── lib/
│   │   ├── auth.ts            # Auth.js NextAuth v5 configuration
│   │   ├── prisma.ts          # Singleton Prisma client instance
│   │   ├── utils.ts           # Currency formatting (INR en-IN default), dates
│   │   └── validators.ts      # Strict Zod schemas
│   ├── middleware.ts          # NextAuth session route protection
│   └── styles/
│       └── globals.css        # Midnight & Pearl Expense Tracker color tokens, noise overlay
├── tailwind.config.ts         # Custom animations, glow shadows, font mappings
└── package.json
```

---

## 🔒 Security & Best Practices

- All database queries are scoped by `userId` to ensure zero cross-tenant leakage.
- Passwords hashed using `bcryptjs` with salt rounds = 10.
- All requests validated at runtime with strict Zod schemas before touching Prisma ORM.
- Input fields sanitised and escaped; CSV exports follow RFC-4180 with standard quote encapsulation.


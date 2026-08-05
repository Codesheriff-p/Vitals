# VITALS HMS — Hospital Management System

A full-stack Hospital Management System built as a final-year Computer Science project.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** MongoDB
- **ODM:** Mongoose
- **Auth:** JWT stored in an httpOnly cookie, verified in `proxy.ts` (Next's middleware) and re-checked in every Server Action/page via `src/lib/auth.ts`
- **Icons:** lucide-react
- **Charts:** Chart.js via react-chartjs-2 (dashboard only)

Mutations are implemented as React Server Actions (`src/actions/*.ts`) called directly from forms — there is no separate REST API layer for internal use.

## Data Model

The schema is intentionally *not* a 1:1 port of a relational design. Line-item collections that are always accessed through their parent and never queried independently are embedded as subdocuments instead of kept as separate collections:

- `Prescription.items[]` (drug, dosage, quantity, instructions) — was a separate `prescription_items` table
- `LabRequest.items[]` (test, result, status) — was a separate `lab_request_items` table
- `Bill.items[]` (description, category, quantity, unit price) — was a separate `bill_items` table

Everything else that's referenced across multiple contexts (users, patients, doctors, appointments, payments, etc.) stays a top-level collection with `ObjectId` references, populated on read via Mongoose's `.populate()`.

MongoDB has no foreign-key constraints, so referential integrity that used to be DB-enforced is now checked explicitly in the Server Actions before a delete goes through — e.g. `deletePatient` blocks the delete if the patient still has appointments, medical records, prescriptions, lab requests, or bills. Deleting a `User` that is also a `Doctor`/`Staff` profile cascades that profile's own document inside a transaction; a few dispense/payment/results flows (`dispensePrescription`, `recordPayment`) use a Mongoose session + multi-document transaction for atomicity — see the note on replica sets below.

## Project Structure

```
src/
  actions/       Server Actions (mutations) per module
  app/
    (app)/       Authenticated shell (navbar + sidebar) — dashboard, patients, doctors, ...
    invoices/    Standalone printable invoice route (no dashboard chrome)
    login/       Public login page
  components/    Shared UI (Card, Badge, StatCard, PageHeader, ...) and layout (Navbar, Sidebar)
  lib/           DB connection, auth helpers, report queries, formatting helpers
  models/        Mongoose schemas (one per collection), re-exported from models/index.ts
  proxy.ts       Route protection (Next 16's replacement for middleware.ts)
  types/         Shared TypeScript types
scripts/
  seed.ts        Drops the database and inserts demo data
```

`_legacy-express-ejs/` is an earlier EJS/Express/MySQL prototype of this same app, kept for reference. It is not part of the running application.

## Setup

### 1. Install MongoDB

Multi-document transactions (used for dispensing prescriptions and recording payments) require MongoDB to run as a replica set — a single-node one is enough locally and only takes one extra step.

**Option A — MongoDB Atlas (easiest, no local setup):** create a free cluster at https://www.mongodb.com/atlas — Atlas clusters are already replica sets, so transactions work with no extra config. Copy the connection string it gives you into `MONGODB_URI`.

**Option B — Local MongoDB:**

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Initialize a single-node replica set (one-time):
mongosh --eval "rs.initiate()"
```

**Option C — Docker (already a replica-set-ready single node):**

```bash
docker run --name hms-mongo -p 27017:27017 -d mongo:7 --replSet rs0
docker exec hms-mongo mongosh --eval "rs.initiate()"
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and adjust if needed:

```bash
cp .env.example .env.local
```

```
MONGODB_URI=mongodb://127.0.0.1:27017/hms_db
JWT_SECRET=change_this_to_a_long_random_string
```

### 3. Install dependencies

```bash
npm install
```

### 4. Seed the database

This drops the database and inserts demo data (departments, doctors, staff, 20 patients, appointments, drugs, lab tests, bills, etc.):

```bash
npm run db:seed
```

### 5. Run the dev server

```bash
npm run dev
```

Visit http://localhost:3000 — you'll be redirected to `/login`.

## Demo Logins

All seeded accounts use these passwords:

| Role | Email | Password |
|---|---|---|
| Admin | admin@hms.com | Admin@123 |
| Doctor | james.okafor@hms.com | Doctor@123 |
| Doctor | amina.bello@hms.com | Doctor@123 |
| Doctor | samuel.adeyemi@hms.com | Doctor@123 |
| Pharmacist | grace.nwosu@hms.com | Pharma@123 |
| Pharmacist | peter.eze@hms.com | Pharma@123 |
| Lab Technician | ifeoma.chukwu@hms.com | LabTech@123 |
| Lab Technician | tunde.bakare@hms.com | LabTech@123 |
| Receptionist | blessing.udo@hms.com | Reception@123 |
| Receptionist | chidi.obi@hms.com | Reception@123 |

## Other Commands

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint
npx tsc --noEmit  # type-check only
```

# Sarangi Consulting - Project Brain 🧠

> **Purpose:** This document serves as the central source of truth for the project. It tracks the current folder structure, what has been completed, the current state of the project, and the upcoming phases. It should be updated whenever a major milestone is reached.

---

## 📂 Project Folder Structure

```text
sarangi-project/
├── .vscode/            # Editor settings
├── assets/             # Raw assets (images, logos, vectors)
├── backend/            # Node.js REST API Server
│   ├── node_modules/   # Backend dependencies
│   ├── prisma/         # Prisma schema and migrations
│   ├── .env            # Environment variables (DB URLs, Secrets)
│   ├── .env.example    # Example environment variables
│   ├── package.json    # Backend scripts and dependencies
│   └── (controllers, routes, services) # Backend modules (e.g., Auth)
├── database/           # Database setup scripts or SQL dumps (MySQL)
├── docs/               # Project Documentation (You are here)
│   ├── PRD.md, TRD.md, Architecture.md, brain.md, etc.
├── frontend/           # Static Frontend App (HTML/CSS/JS)
│   ├── index.html, about.html, services.html, etc.
│   ├── admin-dashboard.html # UI for admin portal
│   ├── user-dashboard.html  # UI for client portal
│   ├── style.css       # Global stylesheet
│   ├── script.js       # Global scripts
│   └── images/         # Optimized web images
├── infrastructure/     # Deployment configurations
├── scripts/            # Helper/Utility scripts
├── docker-compose.yml  # Docker composition for local dev/deployment
├── .gitignore          # Root Git ignore rules
└── README.md           # Project entrypoint
```

---

## 🚦 Project State: Phase 4 (Integration & Dashboards)

**Current Status:** 🟢 **Active Development**
We have successfully completed the static frontend pages, established the database connection, and set up the base Node.js backend. We are currently focusing on the UI for the Client/Admin portals and preparing to wire them to the backend APIs.

---

## ✅ What Is Done (Completed Milestones)

### Phase 1: Core Website Frontend (Completed)
- [x] All core static pages created (`index`, `about`, `services`, `insights`, `industries`, `startup-advisory`, `contact`).
- [x] Implemented global CSS (`style.css`) with consistent branding (Exec Black, Primary Green).
- [x] Responsive layout fixes (fixed navbar overlapping on medium screens by updating breakpoint to `1100px`).
- [x] Consistent CTA button text formatting across all pages.
- [x] Floating WhatsApp integration for lead capture.

### Phase 2: Database & Backend Foundation (Completed)
- [x] MySQL database created locally (`sarangi_db`).
- [x] `schema.prisma` successfully connected to the database.
- [x] Prisma Client generated successfully.
- [x] `auth` module created in backend (`controller`, `routes`, `service`).
- [x] Created `create-admin.js` seed script and successfully generated the first Admin user with a hashed password.
- [x] `.gitignore` and `.env.example` set up to protect sensitive credentials.

### Phase 3: Dashboard UI Layouts (Completed)
- [x] `admin-dashboard.html` created with a clean split-pane layout, sidebar navigation, and tables for leads/bookings.
- [x] `user-dashboard.html` completely restructured to match the admin aesthetic.
- [x] Added tab-switching logic for the User Dashboard (Overview, Profile & Plan, Meetings, Reports & Insights).

---

## 🚧 What Needs To Be Done (Next Steps)

### Phase 4: API Integration (In Progress)
- [ ] **Frontend Authentication:** Update `login.html` and `register.html` to securely call the Node.js backend, receive JWT tokens, and store them securely (e.g., localStorage or httpOnly cookies).
- [ ] **Protected Routes:** Add JavaScript logic to `admin-dashboard.html` and `user-dashboard.html` to redirect users back to `login.html` if they don't have a valid token.
- [ ] **Form Submissions:** Connect the "Startup Advisory" registration form and the "Contact Us" form to the backend to save leads to the MySQL database.

### Phase 5: Dynamic Dashboard Data
- [ ] **Dynamic User Dashboard:** Fetch user profile, current plan, upcoming meetings, and recommendations from the backend and populate the DOM dynamically.
- [ ] **Dynamic Admin Dashboard:** Create backend routes to fetch all leads, bookings, and users, and display them in the Admin Dashboard tables.
- [ ] **Password Reset:** Implement the logic in the User Dashboard to securely update passwords via the backend.

### Phase 6: Deployment & Polish
- [ ] Set up production environment variables.
- [ ] Configure CORS properly for production domains.
- [ ] Deploy Node.js backend (e.g., Render, Railway, AWS).
- [ ] Deploy Frontend (e.g., Vercel, Netlify, GitHub Pages).
- [ ] Final end-to-end testing of user flows.

---

> **Note to Developers:** Before making structural changes or adding new features, refer to the other docs (e.g., `Architecture.md`, `TRD.md`) to ensure alignment with the system's design patterns. Update this `brain.md` file whenever a phase is completed.

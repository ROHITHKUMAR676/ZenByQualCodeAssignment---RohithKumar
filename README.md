# Modules Management System

A full-stack Modules Management System built with React (Vite) + Carbon Design System on the frontend and Node.js + Express + MongoDB on the backend.

---

## Project Architecture

```
modules-app/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js         # MongoDB connection
│   │   ├── controllers/
│   │   │   └── moduleController.js
│   │   ├── middleware/
│   │   │   └── validation.js # express-validator rules
│   │   ├── models/
│   │   │   └── Module.js     # Mongoose schema
│   │   ├── routes/
│   │   │   └── moduleRoutes.js
│   │   └── server.js         # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # React + Vite + Carbon DS
    ├── src/
    │   ├── components/
    │   │   ├── modules/
    │   │   │   ├── ModulesPage.jsx        # Main list page
    │   │   │   ├── CreateModuleDrawer.jsx # Create & Edit drawer
    │   │   │   ├── ViewModuleDrawer.jsx   # View details drawer
    │   │   │   └── FilterPanel.jsx        # Left filter panel
    │   │   ├── review/
    │   │   │   └── ReviewQueuePage.jsx    # Review queue screen
    │   │   └── shared/
    │   │       ├── AppLayout.jsx          # Header + layout shell
    │   │       └── StatusBadge.jsx        # Reusable status badge
    │   ├── services/
    │   │   └── api.js         # Axios service layer
    │   ├── styles/
    │   │   └── main.scss      # Global Carbon overrides
    │   ├── utils/
    │   │   └── constants.js   # Dropdown options, enums
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## MongoDB Schema

```js
{
  moduleName:       String (required)
  author:           String (required)
  program:          String
  category:         String
  targetGroup:      String
  serviceComponent: String
  summary:          String (max 100 chars)
  tags:             [String]
  status:           enum['Draft','Active','Pending Review','Needs Changes','Approved','Rejected']
  reviewStatus:     enum['Pending','Approved','Rejected', null]
  notes:            [{ text, author, createdAt }]
  collaborators:    [String]
  publishDate:      Date
  createdAt:        Date (auto)
  updatedAt:        Date (auto)
}
```

---

## API Contract

| Method | Endpoint                    | Description                   |
|--------|-----------------------------|-------------------------------|
| GET    | `/api/modules`              | List modules (filterable)     |
| GET    | `/api/modules/:id`          | Get single module             |
| POST   | `/api/modules`              | Create module                 |
| PUT    | `/api/modules/:id`          | Update module                 |
| GET    | `/api/modules/review-queue` | Review queue with status tabs |

### GET /api/modules — Query Parameters
| Param         | Type   | Description                      |
|---------------|--------|----------------------------------|
| search        | string | Search by name, author, category |
| program       | string | Filter by program                |
| category      | string | Filter by category               |
| tags          | string | Comma-separated tags             |
| collaborators | string | Comma-separated author names     |
| createdFrom   | ISO8601| Date range start                 |
| createdTo     | ISO8601| Date range end                   |
| status        | string | Filter by status                 |
| page          | number | Page number (default: 1)         |
| limit         | number | Items per page (default: 50)     |

### POST /api/modules — Body
```json
{
  "moduleName": "Child Wellbeing",
  "author": "Saranya Loganathan",
  "program": "Mind Matters",
  "category": "Child Wellbeing",
  "targetGroup": "5th Grade",
  "serviceComponent": "CEU",
  "summary": "Supports emotional and social development.",
  "tags": ["Mental Health"],
  "action": "draft" | "create"
}
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (or local MongoDB)

---

### 1. Clone / Extract the project

```bash
cd modules-app
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` from the example:
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/modules_db?retryWrites=true&w=majority
NODE_ENV=development
```

**MongoDB Atlas Setup:**
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user (Database Access)
4. Whitelist your IP (Network Access → Add IP → `0.0.0.0/0` for dev)
5. Get the connection string: Clusters → Connect → Connect your application
6. Paste it into `MONGODB_URI` in `.env`

Start the backend:
```bash
npm run dev
# Server running on port 5000
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
# App running at http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no CORS issues.

---

### 4. Verify Everything Works

1. Open [http://localhost:5173/modules](http://localhost:5173/modules)
2. Click **Create Modules** → fill in name → **Save Draft**
3. Module appears in the table
4. Click the module name → View drawer opens
5. Use the overflow menu (⋮) → **Submit for Review**
6. Click **Review Queue** → see the module there
7. Toggle filters with the **Filters** button

---

## Features Implemented

### Modules List Page
- Carbon DataTable with expand/collapse rows
- Module name is a clickable link opening the View drawer
- Status badges with icons (Active = green ✓, Draft = gray, Pending = gray, Needs Changes = yellow ⚠, Approved = green ✓)
- Live/Draft module counter
- Program filter dropdown
- Full-text search by name, author, category
- Overflow menu: View | Edit | Submit for Review
- Expanded row shows summary, tags, category, target group, service component

### Create Module Drawer
- Right-side slide panel
- Fields: Module Name, Program, Category, Target Group, Service Component, Quick Summary (with char counter), Tags
- Tag input supports typing + Enter or clicking predefined tag suggestions
- Save Draft → status = Draft
- Create and Open → status = Active + publishDate set

### View Module Drawer
- Shows: summary, tags, facilitator notes, publish date, author, category, target group, program, status, service component
- "Open Module Editor" button opens Edit drawer

### Edit Module
- Reuses CreateModuleDrawer with pre-filled data
- Calls PUT /modules/:id

### Filter Panel
- Toggled by the Filters button
- Filters: Collaborators (checkboxes), Created On (date range), Category (checkboxes), Tags (checkboxes)
- Active filter count badge
- Reset button

### Review Queue
- Tabs: Submitted | Needs Changes | Approved
- Review Summary with ⚠ needs-changes count and ✓ approved count
- Overflow menu: Approve | Needs Changes | Reject (updates status via PUT)
- Program filter + search bar

---

## Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | React 18, Vite, Carbon DS   |
| Routing   | React Router v6             |
| HTTP      | Axios                       |
| Backend   | Node.js, Express.js         |
| Validation| express-validator           |
| Database  | MongoDB Atlas, Mongoose     |
| Styling   | Carbon + SCSS overrides     |
| Dates     | Day.js                      |

---

## Production Build

```bash
# Frontend
cd frontend && npm run build
# Output in frontend/dist/

# Backend — set NODE_ENV=production in .env
cd backend && npm start
```

For production, serve the `frontend/dist` folder via Express static middleware or a CDN (Vercel, Netlify, etc.) and deploy the backend to Railway, Render, or AWS.

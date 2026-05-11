# PharmaLink

Pharmacy Inventory & Expiry Prediction System built with **Express.js**, **EJS**, **MySQL**, and **Tailwind CSS**.

## Tech Stack

- **Backend:** Node.js, Express.js (ES Modules)
- **Frontend:** EJS, Tailwind CSS (CDN), Chart.js
- **Database:** MySQL (cloud-hosted)

## Setup

```bash
# 1. Clone & install
git clone https://github.com/imsayon/pharmalink.git
cd pharmalink
npm install

# 2. Configure database
cp .env.example .env
# Edit .env → paste your MySQL connection URL
# Free cloud MySQL: Railway, Aiven, or TiDB Cloud

# 3. Seed the database (creates tables + sample data)
npm run seed

# 4. Run
npm run dev
# → http://localhost:5000
```

## Login

- **Username:** `admin`
- **Password:** `admin`

## Environment Variables

| Variable | Description |
|---|---|
| `MYSQL_URL` | MySQL connection string (`mysql://user:pass@host:port/db`) |
| `SECRET_KEY` | Session secret |
| `PORT` | Server port (default: 5000) |

## Folder Structure

```
├── src/
│   ├── app.js              # Express server
│   ├── db.js               # MySQL connection pool
│   ├── seed.js             # DB schema + sample data
│   └── routes/             # Route handlers
├── views/                  # EJS templates
│   └── partials/           # Reusable partials (head, sidebar, etc.)
├── static/                 # CSS & JS assets
├── database.sql            # Raw SQL schema (reference)
├── .env.example            # Environment template
└── package.json
```

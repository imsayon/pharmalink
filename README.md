# PharmaLink

Pharmacy Inventory & Expiry Prediction System built with **Express.js**, **Vanilla JS**, **MySQL**, and **CSS**.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** HTML, CSS, JavaScript
- **Database:** MySQL (local)

## Setup

```bash
# 1. Clone & install
git clone https://github.com/your-username/pharmalink.git
cd pharmalink
pnpm install

# 2. Configure database
cp .env.example .env
# Edit .env → MySQL URL is mysql://admin:password@localhost:3306/pharmacy_db

# 3. Install MySQL locally (on Linux)
sudo dnf install mysql-server -y
sudo systemctl start mysqld
sudo systemctl enable mysqld
mysql -u root
CREATE DATABASE pharmacy_db;
exit

# 4. Seed the database (creates tables + sample data)
pnpm run seed

# 5. Run
pnpm run dev
# → http://localhost:5000
```

## Environment Variables

| Variable     | Description                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `MYSQL_URL`  | MySQL connection string (`mysql://user:pass@host:port/db`) — for local setup use `mysql://admin:password@localhost:3306/pharmacy_db` |
| `SECRET_KEY` | Session secret                                                                                                                  |
| `PORT`       | Server port (default: 5000)                                                                                                     |

## Folder Structure

```
├── src/
│   ├── app.js              # Express server
│   ├── db.js               # MySQL connection pool
│   ├── seed.js             # DB schema + sample data
│   └── routes/             # API routes
├── public/                 # HTML, CSS, & JS assets
│   ├── index.html
│   ├── style.css
│   └── main.js
├── database.sql            # Raw SQL schema (reference)
├── .env.example            # Environment template
└── package.json
```
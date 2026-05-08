# Pharmacy Inventory & Expiry Prediction System

A complete full-stack web application built for pharmacy management, point of sale (POS), and expiry prediction. It uses a modern, responsive UI with Tailwind CSS and a Python/Flask backend connected to a MySQL database.

## Features
1. **Admin Login Authentication:** Secure access to the admin dashboard.
2. **Dashboard Analytics:** High-level overview with Chart.js visualizations for sales and stock.
3. **Medicine Inventory:** Manage medicine stock, categories, batches, and pricing.
4. **Supplier Management:** Track medicine suppliers and their contact details.
5. **Point of Sale (POS) Billing:** Add items to cart, select customer, and checkout.
6. **Customer Directory:** Track customer details and purchase history.
7. **Printable Invoices:** Generate detailed printable bills for customers.
8. **Expiry & Stock Alerts:** Automatically identifies expired, soon-to-expire (30 days), and low-stock items.
9. **Reports & Analytics:** View historical revenue and top-selling medicines.

## Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript, Tailwind CSS (via CDN), Chart.js
- **Backend:** Python 3.10+, Flask
- **Database:** MySQL

## Step-by-Step Setup Instructions

### 1. Database Setup
1. Ensure you have MySQL installed and running on your machine.
2. Open your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or CLI).
3. Run the complete SQL script provided in `database.sql`:
   ```bash
   mysql -u root -p < database.sql
   ```
   This will create the `pharmacy_db` database, required tables, and insert sample data.

### 2. Backend Environment Setup
1. Ensure Python 3 is installed.
2. Open a terminal in the project directory.
3. (Optional but recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

### 3. Configuration
1. Open the `.env` file in the root directory.
2. Update the database credentials to match your local MySQL setup:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=pharmacy_db
   SECRET_KEY=supersecretkey123
   ```

### 4. Running the Application
1. Start the Flask server:
   ```bash
   python app.py
   ```
2. Open your web browser and navigate to: `http://localhost:5000`
3. Login using the default credentials:
   - **Username:** `admin`
   - **Password:** `admin`

## Folder Structure
- `app.py`: Main Flask application with routing and logic.
- `database.sql`: MySQL schema and mock data.
- `.env`: Environment variables configuration.
- `requirements.txt`: Python package dependencies.
- `static/`: Contains custom CSS and JS files.
- `templates/`: Contains all HTML template files for the frontend views.

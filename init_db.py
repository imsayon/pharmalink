import sqlite3
from datetime import datetime, timedelta

def init_db():
    conn = sqlite3.connect('pharmacy.db')
    cursor = conn.cursor()

    # Drop existing tables if re-running
    cursor.executescript('''
        DROP TABLE IF EXISTS Expiry_Alert;
        DROP TABLE IF EXISTS Payment;
        DROP TABLE IF EXISTS Bill_Details;
        DROP TABLE IF EXISTS Bill;
        DROP TABLE IF EXISTS Customer;
        DROP TABLE IF EXISTS Medicine;
        DROP TABLE IF EXISTS Supplier;
    ''')

    # Create tables
    cursor.executescript('''
        CREATE TABLE Supplier (
            supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier_name TEXT NOT NULL,
            phone TEXT,
            address TEXT
        );

        CREATE TABLE Medicine (
            medicine_id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier_id INTEGER,
            medicine_name TEXT NOT NULL,
            category TEXT,
            batch_no TEXT,
            manufacture_date DATE,
            expiry_date DATE,
            stock_quantity INTEGER DEFAULT 0,
            price REAL NOT NULL,
            FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id) ON DELETE SET NULL
        );

        CREATE TABLE Customer (
            customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT,
            age INTEGER
        );

        CREATE TABLE Bill (
            bill_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            bill_date DATETIME DEFAULT (datetime('now', 'localtime')),
            total_amount REAL DEFAULT 0.00,
            FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE SET NULL
        );

        CREATE TABLE Bill_Details (
            bill_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER,
            medicine_id INTEGER,
            quantity INTEGER NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (bill_id) REFERENCES Bill(bill_id) ON DELETE CASCADE,
            FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id) ON DELETE RESTRICT
        );

        CREATE TABLE Payment (
            payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER,
            payment_method TEXT,
            payment_date DATETIME DEFAULT (datetime('now', 'localtime')),
            amount REAL NOT NULL,
            FOREIGN KEY (bill_id) REFERENCES Bill(bill_id) ON DELETE CASCADE
        );

        CREATE TABLE Expiry_Alert (
            alert_id INTEGER PRIMARY KEY AUTOINCREMENT,
            medicine_id INTEGER,
            alert_date DATETIME DEFAULT (datetime('now', 'localtime')),
            expiry_status TEXT,
            FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id) ON DELETE CASCADE
        );
    ''')

    # Insert Sample Data
    cursor.executescript('''
        INSERT INTO Supplier (supplier_name, phone, address) VALUES
        ('PharmaCorp Inc.', '123-456-7890', '123 Health Way, NY'),
        ('MedSupply Ltd.', '987-654-3210', '456 Wellness Blvd, CA'),
        ('Global Generics', '555-123-4567', '789 Cure Ave, TX');
        
        INSERT INTO Customer (customer_name, phone, age) VALUES
        ('John Doe', '111-222-3333', 45),
        ('Jane Smith', '444-555-6666', 30);
    ''')

    now = datetime.now()
    exp_soon = (now + timedelta(days=15)).strftime('%Y-%m-%d')
    expired = (now - timedelta(days=5)).strftime('%Y-%m-%d')

    cursor.execute('''
        INSERT INTO Medicine (supplier_id, medicine_name, category, batch_no, manufacture_date, expiry_date, stock_quantity, price) VALUES
        (1, 'Paracetamol 500mg', 'Painkiller', 'B001', '2025-01-10', '2026-01-10', 500, 5.00),
        (2, 'Amoxicillin 250mg', 'Antibiotic', 'B002', '2025-02-15', '2027-02-15', 300, 15.50),
        (3, 'Vitamin C Supplement', 'Vitamins', 'B003', '2024-05-20', ?, 50, 12.00),
        (1, 'Ibuprofen 400mg', 'Painkiller', 'B004', '2023-01-01', ?, 200, 8.00),
        (2, 'Cetirizine 10mg', 'Antiallergic', 'B005', '2025-03-01', '2028-03-01', 5, 4.50)
    ''', (exp_soon, expired))

    # Add a sample bill to show analytics
    past_date = (now - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute("INSERT INTO Bill (customer_id, bill_date, total_amount) VALUES (1, ?, 25.50)", (past_date,))
    cursor.execute("INSERT INTO Bill_Details (bill_id, medicine_id, quantity, subtotal) VALUES (1, 1, 2, 10.00)")
    cursor.execute("INSERT INTO Bill_Details (bill_id, medicine_id, quantity, subtotal) VALUES (1, 2, 1, 15.50)")
    cursor.execute("INSERT INTO Payment (bill_id, payment_method, payment_date, amount) VALUES (1, 'Card', ?, 25.50)", (past_date,))

    conn.commit()
    conn.close()
    print("SQLite database created and populated successfully.")

if __name__ == '__main__':
    init_db()

/**
 * seed.js — Creates tables and inserts sample data.
 * Run once:  npm run seed
 */
import 'dotenv/config';
import db from './db.js';

async function seed() {
  const conn = await db.getConnection();

  try {
    console.log('⏳ Dropping existing tables...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of ['Expiry_Alert', 'Payment', 'Bill_Details', 'Bill', 'Customer', 'Medicine', 'Supplier']) {
      await conn.query(`DROP TABLE IF EXISTS ${t}`);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('⏳ Creating tables...');

    await conn.query(`CREATE TABLE Supplier (
      supplier_id INT AUTO_INCREMENT PRIMARY KEY,
      supplier_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      address TEXT
    )`);

    await conn.query(`CREATE TABLE Medicine (
      medicine_id INT AUTO_INCREMENT PRIMARY KEY,
      supplier_id INT,
      medicine_name VARCHAR(100) NOT NULL,
      category VARCHAR(50),
      batch_no VARCHAR(50),
      manufacture_date DATE,
      expiry_date DATE,
      stock_quantity INT DEFAULT 0,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id) ON DELETE SET NULL
    )`);

    await conn.query(`CREATE TABLE Customer (
      customer_id INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      age INT
    )`);

    await conn.query(`CREATE TABLE Bill (
      bill_id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT,
      bill_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_amount DECIMAL(10,2) DEFAULT 0.00,
      FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE SET NULL
    )`);

    await conn.query(`CREATE TABLE Bill_Details (
      bill_detail_id INT AUTO_INCREMENT PRIMARY KEY,
      bill_id INT,
      medicine_id INT,
      quantity INT NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (bill_id) REFERENCES Bill(bill_id) ON DELETE CASCADE,
      FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id) ON DELETE RESTRICT
    )`);

    await conn.query(`CREATE TABLE Payment (
      payment_id INT AUTO_INCREMENT PRIMARY KEY,
      bill_id INT,
      payment_method VARCHAR(50),
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      amount DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (bill_id) REFERENCES Bill(bill_id) ON DELETE CASCADE
    )`);

    await conn.query(`CREATE TABLE Expiry_Alert (
      alert_id INT AUTO_INCREMENT PRIMARY KEY,
      medicine_id INT,
      alert_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiry_status VARCHAR(50),
      FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id) ON DELETE CASCADE
    )`);

    console.log('⏳ Inserting sample data...');

    await conn.query(`INSERT INTO Supplier (supplier_name, phone, address) VALUES
      ('PharmaCorp Inc.', '123-456-7890', '123 Health Way, NY'),
      ('MedSupply Ltd.',  '987-654-3210', '456 Wellness Blvd, CA'),
      ('Global Generics', '555-123-4567', '789 Cure Ave, TX')`);

    await conn.query(`INSERT INTO Customer (customer_name, phone, age) VALUES
      ('John Doe',  '111-222-3333', 45),
      ('Jane Smith', '444-555-6666', 30)`);

    const now = new Date();
    const expSoon = new Date(now.getTime() + 15 * 86400000).toISOString().split('T')[0];
    const expired = new Date(now.getTime() - 5 * 86400000).toISOString().split('T')[0];

    await conn.query(
      `INSERT INTO Medicine (supplier_id, medicine_name, category, batch_no, manufacture_date, expiry_date, stock_quantity, price) VALUES
      (1, 'Paracetamol 500mg',    'Painkiller',    'B001', '2025-01-10', '2026-01-10', 500, 5.00),
      (2, 'Amoxicillin 250mg',    'Antibiotic',    'B002', '2025-02-15', '2027-02-15', 300, 15.50),
      (3, 'Vitamin C Supplement', 'Vitamins',      'B003', '2024-05-20', ?,            50,  12.00),
      (1, 'Ibuprofen 400mg',      'Painkiller',    'B004', '2023-01-01', ?,            200, 8.00),
      (2, 'Cetirizine 10mg',      'Antiallergic',  'B005', '2025-03-01', '2028-03-01', 5,   4.50)`,
      [expSoon, expired],
    );

    const pastDate = new Date(now.getTime() - 2 * 86400000).toISOString().replace('T', ' ').substring(0, 19);
    await conn.query('INSERT INTO Bill (customer_id, bill_date, total_amount) VALUES (1, ?, 25.50)', [pastDate]);
    await conn.query('INSERT INTO Bill_Details (bill_id, medicine_id, quantity, subtotal) VALUES (1, 1, 2, 10.00)');
    await conn.query('INSERT INTO Bill_Details (bill_id, medicine_id, quantity, subtotal) VALUES (1, 2, 1, 15.50)');
    await conn.query("INSERT INTO Payment (bill_id, payment_method, payment_date, amount) VALUES (1, 'Card', ?, 25.50)", [pastDate]);

    console.log('✅ Database seeded successfully!');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();

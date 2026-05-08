CREATE DATABASE IF NOT EXISTS pharmacy_db;
USE pharmacy_db;

-- 1. Supplier Table
CREATE TABLE IF NOT EXISTS Supplier (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT
);

-- 2. Medicine Table
CREATE TABLE IF NOT EXISTS Medicine (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    medicine_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    batch_no VARCHAR(50),
    manufacture_date DATE,
    expiry_date DATE,
    stock_quantity INT DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id) ON DELETE SET NULL
);

-- 3. Customer Table
CREATE TABLE IF NOT EXISTS Customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    age INT
);

-- 4. Bill Table
CREATE TABLE IF NOT EXISTS Bill (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    bill_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE SET NULL
);

-- 5. Bill_Details Table
CREATE TABLE IF NOT EXISTS Bill_Details (
    bill_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT,
    medicine_id INT,
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES Bill(bill_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id) ON DELETE RESTRICT
);

-- 6. Payment Table
CREATE TABLE IF NOT EXISTS Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT,
    payment_method VARCHAR(50),
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES Bill(bill_id) ON DELETE CASCADE
);

-- 7. Expiry_Alert Table
CREATE TABLE IF NOT EXISTS Expiry_Alert (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT,
    alert_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiry_status VARCHAR(50),
    FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id) ON DELETE CASCADE
);

-- Sample Data Insertion
INSERT INTO Supplier (supplier_name, phone, address) VALUES
('PharmaCorp Inc.', '123-456-7890', '123 Health Way, NY'),
('MedSupply Ltd.', '987-654-3210', '456 Wellness Blvd, CA'),
('Global Generics', '555-123-4567', '789 Cure Ave, TX');

INSERT INTO Medicine (supplier_id, medicine_name, category, batch_no, manufacture_date, expiry_date, stock_quantity, price) VALUES
(1, 'Paracetamol 500mg', 'Painkiller', 'B001', '2025-01-10', '2026-01-10', 500, 5.00),
(2, 'Amoxicillin 250mg', 'Antibiotic', 'B002', '2025-02-15', '2027-02-15', 300, 15.50),
(3, 'Vitamin C Supplement', 'Vitamins', 'B003', '2024-05-20', DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), 50, 12.00), -- Expiring soon
(1, 'Ibuprofen 400mg', 'Painkiller', 'B004', '2023-01-01', DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), 200, 8.00), -- Expired
(2, 'Cetirizine 10mg', 'Antiallergic', 'B005', '2025-03-01', '2028-03-01', 5, 4.50); -- Low stock

INSERT INTO Customer (customer_name, phone, age) VALUES
('John Doe', '111-222-3333', 45),
('Jane Smith', '444-555-6666', 30);

-- Note: Bills, Bill_Details, Payments, and Alerts will be populated dynamically through the app.

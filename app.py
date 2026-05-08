import os
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)
app.secret_key = "supersecretkey123"
DATABASE = 'pharmacy.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# --- CONTEXT PROCESSORS ---
@app.context_processor
def inject_now():
    return {'now': datetime.utcnow()}

# --- ROUTES ---

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def do_login():
    username = request.form.get('username')
    password = request.form.get('password')
    if username == 'admin' and password == 'admin':
        return redirect(url_for('dashboard'))
    flash('Invalid credentials', 'error')
    return redirect(url_for('login'))

@app.route('/logout')
def logout():
    return redirect(url_for('login'))

@app.route('/dashboard')
def dashboard():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Stats
    cursor.execute("SELECT COUNT(*) as total FROM Medicine")
    total_medicines = cursor.fetchone()['total']
    
    cursor.execute("SELECT SUM(total_amount) as sales FROM Bill")
    row = cursor.fetchone()
    total_sales = row['sales'] if row['sales'] is not None else 0
    
    cursor.execute("SELECT COUNT(*) as low_stock FROM Medicine WHERE stock_quantity <= 10")
    low_stock_count = cursor.fetchone()['low_stock']
    
    cursor.execute("SELECT COUNT(*) as expiring FROM Medicine WHERE expiry_date BETWEEN date('now') AND date('now', '+30 days')")
    expiring_count = cursor.fetchone()['expiring']
    
    # Recent Bills
    cursor.execute("""
        SELECT b.bill_id, c.customer_name, b.bill_date, b.total_amount 
        FROM Bill b 
        JOIN Customer c ON b.customer_id = c.customer_id 
        ORDER BY b.bill_date DESC LIMIT 5
    """)
    recent_bills_data = cursor.fetchall()
    
    recent_bills = []
    for rb in recent_bills_data:
        rb_dict = dict(rb)
        if isinstance(rb_dict['bill_date'], str):
            rb_dict['bill_date'] = datetime.strptime(rb_dict['bill_date'], '%Y-%m-%d %H:%M:%S')
        recent_bills.append(rb_dict)
    
    conn.close()
    
    return render_template('dashboard.html', 
                           total_medicines=total_medicines, 
                           total_sales=total_sales,
                           low_stock_count=low_stock_count,
                           expiring_count=expiring_count,
                           recent_bills=recent_bills)

# --- MEDICINE MANAGEMENT ---

@app.route('/medicines')
def medicines():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT m.*, s.supplier_name 
        FROM Medicine m 
        LEFT JOIN Supplier s ON m.supplier_id = s.supplier_id
    """)
    medicines = cursor.fetchall()
    
    cursor.execute("SELECT * FROM Supplier")
    suppliers = cursor.fetchall()
    conn.close()
    
    return render_template('medicine.html', medicines=medicines, suppliers=suppliers)

@app.route('/medicines/add', methods=['POST'])
def add_medicine():
    try:
        data = request.form
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Medicine (supplier_id, medicine_name, category, batch_no, manufacture_date, expiry_date, stock_quantity, price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (data['supplier_id'], data['medicine_name'], data['category'], data['batch_no'], data['manufacture_date'], data['expiry_date'], data['stock_quantity'], data['price']))
        conn.commit()
        conn.close()
        flash('Medicine added successfully', 'success')
    except Exception as e:
        flash(f'Error adding medicine: {str(e)}', 'error')
    return redirect(url_for('medicines'))

@app.route('/medicines/delete/<int:id>', methods=['POST'])
def delete_medicine(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Medicine WHERE medicine_id = ?", (id,))
        conn.commit()
        conn.close()
        flash('Medicine deleted successfully', 'success')
    except Exception as e:
        flash(f'Error deleting medicine: {str(e)}', 'error')
    return redirect(url_for('medicines'))

# --- SUPPLIER MANAGEMENT ---

@app.route('/suppliers')
def suppliers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Supplier")
    suppliers = cursor.fetchall()
    conn.close()
    return render_template('supplier.html', suppliers=suppliers)

@app.route('/suppliers/add', methods=['POST'])
def add_supplier():
    try:
        data = request.form
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Supplier (supplier_name, phone, address)
            VALUES (?, ?, ?)
        """, (data['supplier_name'], data['phone'], data['address']))
        conn.commit()
        conn.close()
        flash('Supplier added successfully', 'success')
    except Exception as e:
        flash(f'Error adding supplier: {str(e)}', 'error')
    return redirect(url_for('suppliers'))

# --- CUSTOMER MANAGEMENT ---

@app.route('/customers')
def customers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Customer")
    customers_data = cursor.fetchall()
    conn.close()
    return render_template('customer.html', customers=customers_data)

@app.route('/customers/add', methods=['POST'])
def add_customer():
    try:
        data = request.form
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Customer (customer_name, phone, age)
            VALUES (?, ?, ?)
        """, (data['customer_name'], data['phone'], data['age']))
        conn.commit()
        conn.close()
        flash('Customer added successfully', 'success')
    except Exception as e:
        flash(f'Error adding customer: {str(e)}', 'error')
    return redirect(url_for('customers'))

# --- BILLING SYSTEM ---

@app.route('/billing')
def billing():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Customer")
    customers_data = cursor.fetchall()
    cursor.execute("SELECT * FROM Medicine WHERE stock_quantity > 0")
    medicines_data = cursor.fetchall()
    conn.close()
    return render_template('billing.html', customers=customers_data, medicines=medicines_data)

@app.route('/billing/create', methods=['POST'])
def create_bill():
    try:
        data = request.json
        customer_id = data['customer_id']
        items = data['items'] 
        total_amount = data['total_amount']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create Bill
        cursor.execute("INSERT INTO Bill (customer_id, total_amount) VALUES (?, ?)", (customer_id, total_amount))
        bill_id = cursor.lastrowid
        
        # Add details and update stock
        for item in items:
            cursor.execute("INSERT INTO Bill_Details (bill_id, medicine_id, quantity, subtotal) VALUES (?, ?, ?, ?)",
                           (bill_id, item['medicine_id'], item['quantity'], item['subtotal']))
            cursor.execute("UPDATE Medicine SET stock_quantity = stock_quantity - ? WHERE medicine_id = ?",
                           (item['quantity'], item['medicine_id']))
        
        # Add payment record
        cursor.execute("INSERT INTO Payment (bill_id, payment_method, amount) VALUES (?, ?, ?)",
                       (bill_id, data.get('payment_method', 'Cash'), total_amount))
        
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'bill_id': bill_id})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/billing/invoice/<int:bill_id>')
def invoice(bill_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT b.*, c.customer_name, c.phone 
        FROM Bill b 
        JOIN Customer c ON b.customer_id = c.customer_id 
        WHERE b.bill_id = ?
    """, (bill_id,))
    bill = cursor.fetchone()
    
    # Bill date might be string in sqlite, let's parse it for formatting if needed, but jinja can handle string sometimes. 
    # To be safe, we'll convert string to datetime object if it's a string.
    bill_dict = dict(bill)
    if isinstance(bill_dict['bill_date'], str):
        bill_dict['bill_date'] = datetime.strptime(bill_dict['bill_date'], '%Y-%m-%d %H:%M:%S')

    cursor.execute("""
        SELECT bd.*, m.medicine_name, m.price 
        FROM Bill_Details bd 
        JOIN Medicine m ON bd.medicine_id = m.medicine_id 
        WHERE bd.bill_id = ?
    """, (bill_id,))
    details = cursor.fetchall()
    conn.close()
    
    return render_template('invoice.html', bill=bill_dict, details=details)

# --- EXPIRY ALERTS ---

@app.route('/expiry-alerts')
def expiry_alerts():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Expired
    cursor.execute("SELECT * FROM Medicine WHERE expiry_date < date('now')")
    expired = cursor.fetchall()
    
    # Expiring within 30 days
    cursor.execute("SELECT * FROM Medicine WHERE expiry_date BETWEEN date('now') AND date('now', '+30 days')")
    expiring_soon = cursor.fetchall()
    
    # Low stock
    cursor.execute("SELECT * FROM Medicine WHERE stock_quantity <= 10")
    low_stock = cursor.fetchall()
    
    conn.close()
    return render_template('expiry.html', expired=expired, expiring_soon=expiring_soon, low_stock=low_stock)

# --- REPORTS & ANALYTICS ---

@app.route('/reports')
def reports():
    return render_template('reports.html')

@app.route('/api/sales-data')
def sales_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get sales for the last 7 days
    cursor.execute("""
        SELECT date(bill_date) as date, SUM(total_amount) as total
        FROM Bill
        WHERE date(bill_date) >= date('now', '-7 days')
        GROUP BY date(bill_date)
        ORDER BY date
    """)
    sales = cursor.fetchall()
    
    # Get top selling medicines
    cursor.execute("""
        SELECT m.medicine_name, SUM(bd.quantity) as total_sold
        FROM Bill_Details bd
        JOIN Medicine m ON bd.medicine_id = m.medicine_id
        GROUP BY m.medicine_id
        ORDER BY total_sold DESC
        LIMIT 5
    """)
    top_medicines = cursor.fetchall()
    
    conn.close()
    
    return jsonify({
        'sales_dates': [str(s['date']) for s in sales],
        'sales_totals': [float(s['total']) for s in sales],
        'med_names': [m['medicine_name'] for m in top_medicines],
        'med_sold': [int(m['total_sold']) for m in top_medicines]
    })

# --- PAYMENT HISTORY ---

@app.route('/payments')
def payments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.*, b.total_amount, c.customer_name
        FROM Payment p
        JOIN Bill b ON p.bill_id = b.bill_id
        JOIN Customer c ON b.customer_id = c.customer_id
        ORDER BY p.payment_date DESC
    """)
    payments_data = cursor.fetchall()
    
    # Convert dates
    payments_list = []
    for p in payments_data:
        p_dict = dict(p)
        if isinstance(p_dict['payment_date'], str):
            p_dict['payment_date'] = datetime.strptime(p_dict['payment_date'], '%Y-%m-%d %H:%M:%S')
        payments_list.append(p_dict)
        
    conn.close()
    return render_template('payment.html', payments=payments_list)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)

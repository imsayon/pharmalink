import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/billing', async (req, res) => {
  try {
    const [customers] = await db.query('SELECT * FROM Customer');
    const [medicines] = await db.query('SELECT * FROM Medicine WHERE stock_quantity > 0');
    res.render('billing', { pageTitle: 'Billing - PharmaLink', customers, medicines });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/billing/create', async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { customer_id, items, total_amount, payment_method } = req.body;
    await conn.beginTransaction();

    const [billResult] = await conn.query('INSERT INTO Bill (customer_id, total_amount) VALUES (?, ?)', [
      customer_id,
      total_amount,
    ]);
    const bill_id = billResult.insertId;

    for (const item of items) {
      await conn.query('INSERT INTO Bill_Details (bill_id, medicine_id, quantity, subtotal) VALUES (?, ?, ?, ?)', [
        bill_id,
        item.medicine_id,
        item.quantity,
        item.subtotal,
      ]);
      await conn.query('UPDATE Medicine SET stock_quantity = stock_quantity - ? WHERE medicine_id = ?', [
        item.quantity,
        item.medicine_id,
      ]);
    }

    await conn.query('INSERT INTO Payment (bill_id, payment_method, amount) VALUES (?, ?, ?)', [
      bill_id,
      payment_method || 'Cash',
      total_amount,
    ]);

    await conn.commit();
    res.json({ success: true, bill_id });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, error: err.message });
  } finally {
    conn.release();
  }
});

router.get('/billing/invoice/:bill_id', async (req, res) => {
  try {
    const [bills] = await db.query(
      `SELECT b.*, c.customer_name, c.phone
       FROM Bill b JOIN Customer c ON b.customer_id = c.customer_id
       WHERE b.bill_id = ?`,
      [req.params.bill_id],
    );

    const [details] = await db.query(
      `SELECT bd.*, m.medicine_name, m.price
       FROM Bill_Details bd JOIN Medicine m ON bd.medicine_id = m.medicine_id
       WHERE bd.bill_id = ?`,
      [req.params.bill_id],
    );

    res.render('invoice', { pageTitle: `Invoice #${req.params.bill_id}`, bill: bills[0], details });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;

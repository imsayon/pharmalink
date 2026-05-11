import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [customers] = await db.query('SELECT * FROM Customer');
    res.json({ customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { customer_name, phone, age } = req.body;
    await db.query('INSERT INTO Customer (customer_name, phone, age) VALUES (?, ?, ?)', [
      customer_name,
      phone,
      age,
    ]);
    res.json({ success: true, message: 'Customer added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding customer: ' + err.message });
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const [history] = await db.query(
      'SELECT bill_id, bill_date, total_amount FROM Bill WHERE customer_id = ? ORDER BY bill_date DESC',
      [req.params.id]
    );
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Customer WHERE customer_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) {
    // If it's a foreign key constraint error, they have purchases
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ success: false, error: 'Cannot delete customer with purchase history' });
    }
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error: ' + err.message });
  }
});

export default router;

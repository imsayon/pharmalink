import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/customers', async (req, res) => {
  try {
    const [customers] = await db.query('SELECT * FROM Customer');
    res.render('customer', { pageTitle: 'Customers - PharmaLink', customers });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/customers/add', async (req, res) => {
  try {
    const { customer_name, phone, age } = req.body;
    await db.query('INSERT INTO Customer (customer_name, phone, age) VALUES (?, ?, ?)', [
      customer_name,
      phone,
      age,
    ]);
    req.flash('success', 'Customer added successfully');
  } catch (err) {
    req.flash('error', 'Error adding customer: ' + err.message);
  }
  res.redirect('/customers');
});

export default router;

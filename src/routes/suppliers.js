import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/suppliers', async (req, res) => {
  try {
    const [suppliers] = await db.query('SELECT * FROM Supplier');
    res.render('supplier', { pageTitle: 'Suppliers - PharmaLink', suppliers });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/suppliers/add', async (req, res) => {
  try {
    const { supplier_name, phone, address } = req.body;
    await db.query('INSERT INTO Supplier (supplier_name, phone, address) VALUES (?, ?, ?)', [
      supplier_name,
      phone,
      address,
    ]);
    req.flash('success', 'Supplier added successfully');
  } catch (err) {
    req.flash('error', 'Error adding supplier: ' + err.message);
  }
  res.redirect('/suppliers');
});

export default router;

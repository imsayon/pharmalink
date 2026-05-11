import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/medicines', async (req, res) => {
  try {
    const [medicines] = await db.query(`
      SELECT m.*, s.supplier_name
      FROM Medicine m LEFT JOIN Supplier s ON m.supplier_id = s.supplier_id
    `);
    const [suppliers] = await db.query('SELECT * FROM Supplier');
    res.render('medicine', { pageTitle: 'Medicines - PharmaLink', medicines, suppliers });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/medicines/add', async (req, res) => {
  try {
    const { supplier_id, medicine_name, category, batch_no, manufacture_date, expiry_date, stock_quantity, price } =
      req.body;
    await db.query(
      `INSERT INTO Medicine (supplier_id, medicine_name, category, batch_no, manufacture_date, expiry_date, stock_quantity, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [supplier_id, medicine_name, category, batch_no, manufacture_date, expiry_date, stock_quantity, price],
    );
    req.flash('success', 'Medicine added successfully');
  } catch (err) {
    req.flash('error', 'Error adding medicine: ' + err.message);
  }
  res.redirect('/medicines');
});

router.post('/medicines/delete/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Medicine WHERE medicine_id = ?', [req.params.id]);
    req.flash('success', 'Medicine deleted successfully');
  } catch (err) {
    req.flash('error', 'Error deleting medicine: ' + err.message);
  }
  res.redirect('/medicines');
});

export default router;

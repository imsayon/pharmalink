import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/payments', async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT p.*, b.total_amount, c.customer_name
      FROM Payment p
      JOIN Bill b ON p.bill_id = b.bill_id
      JOIN Customer c ON b.customer_id = c.customer_id
      ORDER BY p.payment_date DESC
    `);
    res.render('payment', { pageTitle: 'Payment History - PharmaLink', payments });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;

import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/dashboard', async (req, res) => {
  try {
    const [[{ total: total_medicines }]] = await db.query('SELECT COUNT(*) AS total FROM Medicine');
    const [[{ sales }]] = await db.query('SELECT SUM(total_amount) AS sales FROM Bill');
    const total_sales = sales || 0;

    const [[{ low_stock: low_stock_count }]] = await db.query(
      'SELECT COUNT(*) AS low_stock FROM Medicine WHERE stock_quantity <= 10',
    );
    const [[{ expiring: expiring_count }]] = await db.query(
      "SELECT COUNT(*) AS expiring FROM Medicine WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)",
    );

    const [recent_bills] = await db.query(`
      SELECT b.bill_id, c.customer_name, b.bill_date, b.total_amount
      FROM Bill b JOIN Customer c ON b.customer_id = c.customer_id
      ORDER BY b.bill_date DESC LIMIT 5
    `);

    res.render('dashboard', {
      pageTitle: 'Dashboard - PharmaLink',
      total_medicines,
      total_sales,
      low_stock_count,
      expiring_count,
      recent_bills,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Server error');
  }
});

export default router;

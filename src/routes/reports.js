import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const simDate = req.query.simDate;
    const today = simDate ? `DATE('${simDate}')` : 'CURDATE()';

    const [sales] = await db.query(`
      SELECT DATE(bill_date) AS date, SUM(total_amount) AS total
      FROM Bill WHERE DATE(bill_date) >= DATE_SUB(${today}, INTERVAL 7 DAY)
      GROUP BY DATE(bill_date) ORDER BY date
    `);

    const [topMeds] = await db.query(`
      SELECT m.medicine_name, SUM(bd.quantity) AS total_sold
      FROM Bill_Details bd JOIN Medicine m ON bd.medicine_id = m.medicine_id
      GROUP BY m.medicine_id ORDER BY total_sold DESC LIMIT 5
    `);

    const [expired] = await db.query(`SELECT * FROM Medicine WHERE DATE(expiry_date) < ${today}`);
    const [expiring_soon] = await db.query(
      `SELECT * FROM Medicine WHERE DATE(expiry_date) BETWEEN ${today} AND DATE_ADD(${today}, INTERVAL 30 DAY)`
    );
    const [low_stock] = await db.query('SELECT * FROM Medicine WHERE stock_quantity <= 10');

    res.json({
      sales_dates: sales.map((s) => s.date),
      sales_totals: sales.map((s) => parseFloat(s.total)),
      med_names: topMeds.map((m) => m.medicine_name),
      med_sold: topMeds.map((m) => parseInt(m.total_sold)),
      expired,
      expiring_soon,
      low_stock
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

export default router;

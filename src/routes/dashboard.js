import { Router } from "express"
import db from "../db.js"

const router = Router()

router.get("/", async (req, res) => {
	try {
		const [[{ total: totalMedicines }]] = await db.query(
			"SELECT COUNT(*) AS total FROM Medicine",
		)
		const [[{ sales }]] = await db.query(
			"SELECT SUM(total_amount) AS sales FROM Bill",
		)
		const totalSales = sales || 0

		const [[{ low_stock: lowStockCount }]] = await db.query(
			"SELECT COUNT(*) AS low_stock FROM Medicine WHERE stock_quantity <= 10",
		)
		const [[{ expiring: expiringCount }]] = await db.query(
			"SELECT COUNT(*) AS expiring FROM Medicine WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)",
		)

		const [recentBills] = await db.query(`
      SELECT b.bill_id, c.customer_name, b.bill_date, b.total_amount
      FROM Bill b JOIN Customer c ON b.customer_id = c.customer_id
      ORDER BY b.bill_date DESC LIMIT 5
    `)

		res.json({
			totalMedicines,
			totalSales,
			lowStockCount,
			expiringCount,
			recentBills,
		})
	} catch (err) {
		console.error("Dashboard error:", err)
		res.status(500).json({ error: "Server error" })
	}
})

export default router

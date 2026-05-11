import { Router } from "express"
import db from "../db.js"

const router = Router()

router.get("/", async (req, res) => {
	try {
		const [medicines] = await db.query(`
      SELECT m.*, s.supplier_name
      FROM Medicine m LEFT JOIN Supplier s ON m.supplier_id = s.supplier_id
    `)
		const [suppliers] = await db.query("SELECT * FROM Supplier")
		res.json({ medicines, suppliers })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: "Server error" })
	}
})

router.post("/add", async (req, res) => {
	try {
		const {
			supplier_id,
			medicine_name,
			category,
			batch_no,
			manufacture_date,
			expiry_date,
			stock_quantity,
			price,
		} = req.body
		await db.query(
			`INSERT INTO Medicine (supplier_id, medicine_name, category, batch_no, manufacture_date, expiry_date, stock_quantity, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				supplier_id,
				medicine_name,
				category,
				batch_no,
				manufacture_date,
				expiry_date,
				stock_quantity,
				price,
			],
		)
		res.json({ success: true, message: "Medicine added successfully" })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: "Error adding medicine: " + err.message })
	}
})

router.delete("/:id", async (req, res) => {
	try {
		await db.query("DELETE FROM Medicine WHERE medicine_id = ?", [
			req.params.id,
		])
		res.json({ success: true, message: "Medicine deleted successfully" })
	} catch (err) {
		console.error(err)
		res.status(500).json({
			error: "Error deleting medicine: " + err.message,
		})
	}
})

export default router

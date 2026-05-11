import { Router } from "express"
import db from "../db.js"

const router = Router()

router.get("/", async (req, res) => {
	try {
		const [suppliers] = await db.query("SELECT * FROM Supplier")
		res.json({ suppliers })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: "Server error" })
	}
})

router.post("/add", async (req, res) => {
	try {
		const { supplier_name, phone, address } = req.body
		await db.query(
			"INSERT INTO Supplier (supplier_name, phone, address) VALUES (?, ?, ?)",
			[supplier_name, phone, address],
		)
		res.json({ success: true, message: "Supplier added successfully" })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: "Error adding supplier: " + err.message })
	}
})

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Supplier WHERE supplier_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Supplier not found' });
    }
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ success: false, error: 'Cannot delete supplier with registered medicines' });
    }
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error: ' + err.message });
  }
});

export default router

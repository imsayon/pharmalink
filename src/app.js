import "dotenv/config"
import express from "express"
import session from "express-session"
import flash from "connect-flash"
import path from "path"
import { fileURLToPath } from "url"

import authRoutes from "./routes/auth.js"
import dashboardRoutes from "./routes/dashboard.js"
import medicineRoutes from "./routes/medicines.js"
import supplierRoutes from "./routes/suppliers.js"
import customerRoutes from "./routes/customers.js"
import billingRoutes from "./routes/billing.js"
import reportRoutes from "./routes/reports.js"
import paymentRoutes from "./routes/payments.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, "..")
const app = express()
const PORT = process.env.PORT || 5000

// --- Static files ---
app.use(express.static(path.join(ROOT, "public")))

// --- Body parsers ---
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// --- Session & Flash ---
app.use(
	session({
		secret: process.env.SECRET_KEY || "supersecretkey123",
		resave: false,
		saveUninitialized: false,
	}),
)
app.use(flash())

// --- middlewares ---
app.use((req, res, next) => {
	res.locals.messages = req.flash()
	res.locals.currentPath = req.path
	next()
})

// --- Routes ---
app.use("/", authRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/medicines", medicineRoutes)
app.use("/api/suppliers", supplierRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/billing", billingRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/payments", paymentRoutes)

// --- Serve index.html for root ---
app.get("/", (req, res) => {
	res.sendFile(path.join(ROOT, "public", "index.html"))
})

// --- Start App ---
app.listen(PORT, () => {
	console.log(`PharmaLink running → http://localhost:${PORT}`)
})

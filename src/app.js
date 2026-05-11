import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import medicineRoutes from './routes/medicines.js';
import supplierRoutes from './routes/suppliers.js';
import customerRoutes from './routes/customers.js';
import billingRoutes from './routes/billing.js';
import reportRoutes from './routes/reports.js';
import paymentRoutes from './routes/payments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 5000;

// --- View engine ---
app.set('view engine', 'ejs');
app.set('views', path.join(ROOT, 'views'));

// --- Static files ---
app.use(express.static(path.join(ROOT, 'static')));

// --- Body parsers ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Session & Flash ---
app.use(
  session({
    secret: process.env.SECRET_KEY || 'supersecretkey123',
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(flash());

// --- Locals middleware (available in every template) ---
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.currentPath = req.path;
  next();
});

// --- Routes ---
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', medicineRoutes);
app.use('/', supplierRoutes);
app.use('/', customerRoutes);
app.use('/', billingRoutes);
app.use('/', reportRoutes);
app.use('/', paymentRoutes);

// --- Start ---
app.listen(PORT, () => {
  console.log(`PharmaLink running → http://localhost:${PORT}`);
});

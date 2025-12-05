import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes_product.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/product', productRoutes);

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`API listening on ${PORT}`);
});

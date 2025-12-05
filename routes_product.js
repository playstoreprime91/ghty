import express from 'express';
import pool from './db.js';

const router = express.Router();

// GET /product
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM product ORDER BY id');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// GET /product/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Niepoprawne id' });
  try {
    const { rows } = await pool.query('SELECT * FROM product WHERE id=$1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// POST /product
router.post('/', async (req, res) => {
  const { nazwa, sku, cena, kategoria, stan_magazynu } = req.body;
  if (!nazwa || !sku || cena === undefined) {
    return res.status(400).json({ error: 'Brak wymaganych pól: nazwa, sku, cena' });
  }
  if (isNaN(Number(cena)) || Number(cena) < 0) {
    return res.status(400).json({ error: 'Cena musi być liczbą >= 0' });
  }

  try {
    const q = `INSERT INTO product (nazwa, sku, cena, kategoria, stan_magazynu)
               VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const values = [nazwa, sku, cena, kategoria || null, stan_magazynu || 0];
    const { rows } = await pool.query(q, values);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    if (e.code === '23505') return res.status(409).json({ error: 'SKU już istnieje' });
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// PUT /product/:id
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Niepoprawne id' });
  const { nazwa, sku, cena, kategoria, stan_magazynu } = req.body;
  if (!nazwa && !sku && cena === undefined && kategoria === undefined && stan_magazynu === undefined) {
    return res.status(400).json({ error: 'Brak pól do aktualizacji' });
  }

  const parts = [];
  const values = [];
  let idx = 1;
  if (nazwa !== undefined) { parts.push(`nazwa=$${idx++}`); values.push(nazwa); }
  if (sku !== undefined) { parts.push(`sku=$${idx++}`); values.push(sku); }
  if (cena !== undefined) {
    if (isNaN(Number(cena)) || Number(cena) < 0) return res.status(400).json({ error: 'Cena musi być >=0' });
    parts.push(`cena=$${idx++}`); values.push(cena);
  }
  if (kategoria !== undefined) { parts.push(`kategoria=$${idx++}`); values.push(kategoria); }
  if (stan_magazynu !== undefined) { parts.push(`stan_magazynu=$${idx++}`); values.push(stan_magazynu); }

  const query = `UPDATE product SET ${parts.join(', ')} WHERE id=$${idx} RETURNING *`;
  values.push(id);

  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    if (e.code === '23505') return res.status(409).json({ error: 'SKU już istnieje' });
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE /product/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Niepoprawne id' });
  try {
    const { rowCount } = await pool.query('DELETE FROM product WHERE id=$1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Nie znaleziono' });
    res.json({ message: 'Usunięto' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;

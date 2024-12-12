const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const functions = require("firebase-functions")

const app = express();
const PORT = 3001;

// Konfigurasi koneksi PostgreSQL
const pool = new Pool({
  user: 'postgres', // ganti dengan username PostgreSQL Anda
  host: '34.50.94.81', // ganti dengan IP publik instance Cloud SQL Anda
  database: 'bencana', // ganti dengan nama database Anda
  password: '12345678', // ganti dengan password PostgreSQL Anda
  port: 5432,
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Dummy data untuk artikel (diubah menjadi array kosong)
// let articles = [];

// Fungsi untuk membuat tabel articles
const createArticlesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(100),
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Tabel 'articles' berhasil dibuat.");
  } catch (err) {
    console.error("Kesalahan saat membuat tabel:", err);
  }
};

// Panggil fungsi createArticlesTable saat server mulai
createArticlesTable();

app.get("/",(req,res)=>{
    console.log("welcome app")
    return res.json("welcome app")
})

// Endpoint untuk mendapatkan semua artikel
app.get('/articles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint untuk mendapatkan artikel berdasarkan ID
app.get('/articles/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
    const article = result.rows[0];
    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint untuk menambahkan artikel baru
app.post('/articles', async (req, res) => {
  const { title, content,category} = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO articles (title, content,category) VALUES ($1, $2, $3) RETURNING *',
      [title, content,category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint untuk menghapus artikel berdasarkan ID
app.delete('/articles/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount > 0) {
      res.json({ message: 'Artikel berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

exports.api = app
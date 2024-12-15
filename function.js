const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const functions = require("firebase-functions");
const upload = require("./multer")

//tes
const app = express();
const PORT = 3002;


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

// // Fungsi untuk membuat tabel articles dan education
// const createTables = async () => {
//   const createArticlesQuery = `
//     CREATE TABLE IF NOT EXISTS articles (
//       id SERIAL PRIMARY KEY,
//       title VARCHAR(255) NOT NULL,
//       content TEXT NOT NULL,
//       category VARCHAR(100),
//       date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `;
  
//   const createEducationQuery = `
//     CREATE TABLE IF NOT EXISTS education (
//       id SERIAL PRIMARY KEY,
//       disaster VARCHAR(255) NOT NULL,
//       mitigation TEXT NOT NULL,
//       tips TEXT NOT NULL
//     );
//   `;

//   try {
//     await pool.query(createArticlesQuery);
//     await pool.query(createEducationQuery);
//     console.log("Tabel 'articles' dan 'education' berhasil dibuat.");
//   } catch (err) {
//     console.error("Kesalahan saat membuat tabel:", err);
//   }
// };

// // Panggil fungsi createTables saat server mulai
// createTables();

app.get("/", (req, res) => {
  console.log("welcome app");
  return res.json("welcome app");
});

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
app.post('/articles',upload.single("foto"), async (req, res) => {
  const { title, content, category } = req.body;
  const foto = req.file
  try {
    const fotoPath = `${req.protocol}://${req.get("host")}/${foto.path}`;
    const fotos = fotoPath.replace(/\\/g, "/");
    const result = await pool.query(
      'INSERT INTO articles (title, content, category,foto) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, category,fotos]
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

// Endpoint untuk mendapatkan semua informasi edukasi
app.get('/education', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM education');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint untuk mendapatkan informasi edukasi berdasarkan ID
app.get('/education/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('SELECT * FROM education WHERE id = $1', [id]);
    const disaster = result.rows[0];
    if (disaster) {
      res.json(disaster);
    } else {
      res.status(404).json({ message: 'Informasi tidak ditemukan' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint untuk menambahkan informasi edukasi baru
app.post('/education', async (req, res) => {
  const { disaster, mitigation, tips } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO education (disaster, mitigation, tips) VALUES ($1, $2, $3) RETURNING *',
      [disaster, mitigation, tips]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint untuk menghapus informasi edukasi berdasarkan ID
app.delete('/education/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('DELETE FROM education WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount > 0) {
      res.json({ message: 'Informasi berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Informasi tidak ditemukan' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use("/public/upload", express.static("public/upload"))

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// Ekspor aplikasi sebagai fungsi untuk Firebase
// exports.app = functions.https.onRequest(app);
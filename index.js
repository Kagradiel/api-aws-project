const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const port = 3000;

require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor rodando!");
});


app.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios"); // A tabela no SQL ainda se chama usuarios
    res.json(rows);
  } catch (error) {
    console.error("!!! ERRO DETALHADO DA CONEXÃO COM O BANCO !!!");
    console.error(error);
    console.log("=============================================");
    res.status(500).send("Erro ao conectar ao banco de dados");
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    const sql = "INSERT INTO usuarios (name, email) VALUES (?, ?)";
    const [result] = await pool.query(sql, [name, email]);
    const newUser = { id: result.insertId, name, email };
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao criar usuário");
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "SELECT * FROM usuarios WHERE id = ?";

    const [rows] = await pool.query(sql, [id]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send("Usuário não encontrado");
    }
  } catch (error) {
    res.status(500).send("Erro ao buscar usuário");
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const [result] = await pool.query(
      "UPDATE usuarios SET name = ?, email = ? WHERE id = ?",
      [name, email, id]
    );

    if (result.affectedRows > 0) {
      res.json({ id, name, email });
    } else {
      res.status(404).send("Usuário não encontrado");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro no servidor");
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [
      id,
    ]);

    if (rows.length > 0) {
      await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
      res.status(204).send();
    } else {
      res.status(404).send("Usuário não encontrado");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro no servidor");
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

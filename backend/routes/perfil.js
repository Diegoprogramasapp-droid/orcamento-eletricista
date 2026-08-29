import { Router } from "express";
import { nanoid } from "nanoid";
import { pool } from "../data/db.js";

const router = Router();

function linhaParaUsuario(row) {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    email: row.email,
    cidade: row.cidade,
    foto: row.foto,
    metricas: row.metricas,
    criadoEm: row.criado_em,
  };
}

// Cria o pré-cadastro do eletricista (nome, contato, métricas de cobrança)
router.post("/", async (req, res) => {
  const {
    nome,
    telefone,
    email,
    cidade,
    foto,
    valorHora,
    valorDiaria,
    valorPonto,
    margemMaterial,
    valorKm,
  } = req.body;

  if (!nome || !telefone || !cidade) {
    return res.status(400).json({ erro: "nome, telefone e cidade são obrigatórios" });
  }

  const id = nanoid();
  const metricas = {
    valorHora: Number(valorHora) || 0,
    valorDiaria: Number(valorDiaria) || 0,
    valorPonto: Number(valorPonto) || 0,
    margemMaterial: Number(margemMaterial) || 0,
    valorKm: Number(valorKm) || 0,
  };

  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (id, nome, telefone, email, cidade, foto, metricas)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, nome, telefone, email || null, cidade, foto || null, metricas]
    );
    res.status(201).json(linhaParaUsuario(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "falha ao criar perfil" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ erro: "usuário não encontrado" });
    res.json(linhaParaUsuario(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "falha ao buscar perfil" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { rows: existentes } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      req.params.id,
    ]);
    const usuario = existentes[0];
    if (!usuario) return res.status(404).json({ erro: "usuário não encontrado" });

    const dados = { ...linhaParaUsuario(usuario), ...req.body };
    const metricas = { ...usuario.metricas, ...(req.body.metricas || {}) };

    const { rows } = await pool.query(
      `UPDATE usuarios SET nome=$1, telefone=$2, email=$3, cidade=$4, foto=$5, metricas=$6
       WHERE id=$7 RETURNING *`,
      [dados.nome, dados.telefone, dados.email, dados.cidade, dados.foto, metricas, req.params.id]
    );
    res.json(linhaParaUsuario(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "falha ao atualizar perfil" });
  }
});

export default router;

import { Router } from "express";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
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

function pinValido(pin) {
  return typeof pin === "string" && /^\d{4,6}$/.test(pin);
}

// Login: telefone + PIN
router.post("/entrar", async (req, res) => {
  const { telefone, pin } = req.body;
  if (!telefone || !pin) return res.status(400).json({ erro: "informe telefone e PIN" });

  try {
    const { rows } = await pool.query("SELECT * FROM usuarios WHERE telefone = $1", [telefone]);
    const usuario = rows[0];
    if (!usuario) return res.status(404).json({ erro: "nenhum cadastro encontrado com esse telefone" });

    const confere = usuario.pin_hash && (await bcrypt.compare(pin, usuario.pin_hash));
    if (!confere) return res.status(401).json({ erro: "telefone ou PIN incorretos" });

    res.json(linhaParaUsuario(usuario));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "falha ao entrar" });
  }
});

// Cria o pré-cadastro do eletricista (nome, contato, PIN, métricas de cobrança)
router.post("/", async (req, res) => {
  const {
    nome,
    telefone,
    email,
    cidade,
    foto,
    pin,
    valorHora,
    valorDiaria,
    valorPonto,
    margemMaterial,
    valorKm,
  } = req.body;

  if (!nome || !telefone || !cidade) {
    return res.status(400).json({ erro: "nome, telefone e cidade são obrigatórios" });
  }
  if (!pinValido(pin)) {
    return res.status(400).json({ erro: "PIN deve ter de 4 a 6 números" });
  }

  const existente = await pool.query("SELECT id FROM usuarios WHERE telefone = $1", [telefone]);
  if (existente.rows[0]) {
    return res.status(409).json({ erro: "já existe um cadastro com esse telefone. Use a opção Entrar." });
  }

  const id = nanoid();
  const pinHash = await bcrypt.hash(pin, 10);
  const metricas = {
    valorHora: Number(valorHora) || 0,
    valorDiaria: Number(valorDiaria) || 0,
    valorPonto: Number(valorPonto) || 0,
    margemMaterial: Number(margemMaterial) || 0,
    valorKm: Number(valorKm) || 0,
  };

  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (id, nome, telefone, email, cidade, foto, metricas, pin_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, nome, telefone, email || null, cidade, foto || null, JSON.stringify(metricas), pinHash]
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

    let novoPinHash = null;
    if (req.body.pin) {
      if (!pinValido(req.body.pin)) {
        return res.status(400).json({ erro: "PIN deve ter de 4 a 6 números" });
      }
      novoPinHash = await bcrypt.hash(req.body.pin, 10);
    }

    const { rows } = await pool.query(
      `UPDATE usuarios SET nome=$1, telefone=$2, email=$3, cidade=$4, foto=$5, metricas=$6,
        pin_hash = COALESCE($7, pin_hash)
       WHERE id=$8 RETURNING *`,
      [
        dados.nome,
        dados.telefone,
        dados.email,
        dados.cidade,
        dados.foto,
        JSON.stringify(metricas),
        novoPinHash,
        req.params.id,
      ]
    );
    res.json(linhaParaUsuario(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "falha ao atualizar perfil" });
  }
});

export default router;

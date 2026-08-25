import { Router } from "express";
import { nanoid } from "nanoid";
import { db, persistir } from "../data/store.js";

const router = Router();

// Cria o pré-cadastro do eletricista (nome, contato, métricas de cobrança)
router.post("/", (req, res) => {
  const {
    nome,
    telefone,
    email,
    cidade,
    foto, // URL ou base64, tratado pelo frontend
    valorHora,
    valorDiaria,
    valorPonto,
    margemMaterial, // percentual, ex: 20 = 20%
    valorKm,
  } = req.body;

  if (!nome || !telefone || !cidade) {
    return res.status(400).json({ erro: "nome, telefone e cidade são obrigatórios" });
  }

  const id = nanoid();
  const usuario = {
    id,
    nome,
    telefone,
    email: email || null,
    cidade,
    foto: foto || null,
    metricas: {
      valorHora: Number(valorHora) || 0,
      valorDiaria: Number(valorDiaria) || 0,
      valorPonto: Number(valorPonto) || 0,
      margemMaterial: Number(margemMaterial) || 0,
      valorKm: Number(valorKm) || 0,
    },
    criadoEm: new Date().toISOString(),
  };

  db.usuarios[id] = usuario;
  persistir();
  res.status(201).json(usuario);
});

router.get("/:id", (req, res) => {
  const usuario = db.usuarios[req.params.id];
  if (!usuario) return res.status(404).json({ erro: "usuário não encontrado" });
  res.json(usuario);
});

router.put("/:id", (req, res) => {
  const usuario = db.usuarios[req.params.id];
  if (!usuario) return res.status(404).json({ erro: "usuário não encontrado" });

  const atualizado = {
    ...usuario,
    ...req.body,
    metricas: { ...usuario.metricas, ...(req.body.metricas || {}) },
  };
  db.usuarios[req.params.id] = atualizado;
  persistir();
  res.json(atualizado);
});

export default router;

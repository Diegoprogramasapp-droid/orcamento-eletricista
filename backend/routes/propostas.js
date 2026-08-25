import { Router } from "express";
import { nanoid } from "nanoid";
import { db, persistir } from "../data/store.js";
import { calcularProposta } from "../utils/calculo.js";
import { gerarPdfProposta } from "../utils/pdf.js";

const router = Router();

// Cria uma nova proposta e já retorna os totais calculados
router.post("/", (req, res) => {
  const { usuarioId, cliente, modeloCobranca, itensServico, itensMaterial, kmDeslocamento } = req.body;

  const usuario = db.usuarios[usuarioId];
  if (!usuario) return res.status(404).json({ erro: "eletricista não encontrado" });

  if (!["hora", "diaria", "ponto"].includes(modeloCobranca)) {
    return res.status(400).json({ erro: "modeloCobranca deve ser hora, diaria ou ponto" });
  }

  const id = nanoid();
  const propostaBase = {
    id,
    usuarioId,
    cliente, // { nome, telefone, endereco }
    modeloCobranca,
    itensServico: itensServico || [],
    itensMaterial: itensMaterial || [],
    kmDeslocamento: kmDeslocamento || 0,
    status: "pendente",
    criadoEm: new Date().toISOString(),
  };

  const calculo = calcularProposta(propostaBase, usuario.metricas);
  const proposta = { ...propostaBase, calculo };

  db.propostas[id] = proposta;
  persistir();
  res.status(201).json(proposta);
});

// Lista propostas de um eletricista
router.get("/", (req, res) => {
  const { usuarioId, status } = req.query;
  let propostas = Object.values(db.propostas);
  if (usuarioId) propostas = propostas.filter((p) => p.usuarioId === usuarioId);
  if (status) propostas = propostas.filter((p) => p.status === status);
  propostas.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
  res.json(propostas);
});

router.get("/:id", (req, res) => {
  const proposta = db.propostas[req.params.id];
  if (!proposta) return res.status(404).json({ erro: "proposta não encontrada" });
  res.json(proposta);
});

// Atualiza status (ex: enviada, aceita, recusada, concluída)
router.patch("/:id/status", (req, res) => {
  const proposta = db.propostas[req.params.id];
  if (!proposta) return res.status(404).json({ erro: "proposta não encontrada" });

  const { status } = req.body;
  const validos = ["pendente", "enviada", "aceita", "recusada", "concluida"];
  if (!validos.includes(status)) return res.status(400).json({ erro: "status inválido" });

  proposta.status = status;
  db.propostas[proposta.id] = proposta;
  persistir();
  res.json(proposta);
});

// Gera e baixa o PDF da proposta
router.get("/:id/pdf", async (req, res) => {
  const proposta = db.propostas[req.params.id];
  if (!proposta) return res.status(404).json({ erro: "proposta não encontrada" });
  const usuario = db.usuarios[proposta.usuarioId];

  try {
    const pdfBuffer = await gerarPdfProposta({ usuario, proposta, calculo: proposta.calculo });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="orcamento-${proposta.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (e) {
    res.status(500).json({ erro: "falha ao gerar PDF" });
  }
});

export default router;

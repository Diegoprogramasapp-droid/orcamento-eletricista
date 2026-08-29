import { Router } from "express";
import { nanoid } from "nanoid";
import { pool } from "../data/db.js";
import { calcularProposta } from "../utils/calculo.js";
import { gerarPdfProposta } from "../utils/pdf.js";

const router = Router();

function linhaParaProposta(row) {
  return {
    id: row.id,
    usuarioId: row.usuario_id,
    cliente: row.cliente,
    modeloCobranca: row.modelo_cobranca,
    itensServico: row.itens_servico,
    itensMaterial: row.itens_material,
    kmDeslocamento: Number(row.km_deslocamento),
    status: row.status,
    calculo: row.calculo,
    criadoEm: row.criado_em,
  };
}

function linhaParaUsuario(row) {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    email: row.email,
    cidade: row.cidade,
    foto: row.foto,
    metricas: row.metricas,
  };
}

// Cria uma nova proposta e já retorna os totais calculados
router.post("/", async (req, res) => {
  const { usuarioId, cliente, modeloCobranca, itensServico, itensMaterial, kmDeslocamento } = req.body;

  if (!["hora", "diaria", "ponto"].includes(modeloCobranca)) {
    return res.status(400).json({ erro: "modeloCobranca deve ser hora, diaria ou ponto" });
  }

  try {
    const { rows: usuarios } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [usuarioId]);
    const usuario = usuarios[0];
    if (!usuario) return res.status(404).json({ erro: "eletricista não encontrado" });

    const id = nanoid();
    const propostaBase = {
      modeloCobranca,
      itensServico: itensServico || [],
      itensMaterial: itensMaterial || [],
      kmDeslocamento: kmDeslocamento || 0,
    };
    const calculo = calcularProposta(propostaBase, usuario.metricas);

    const { rows } = await pool.query(
      `INSERT INTO propostas
        (id, usuario_id, cliente, modelo_cobranca, itens_servico, itens_material, km_deslocamento, status, calculo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendente', $8)
       RETURNING *`,
      [
        id,
        usuarioId,
        JSON.stringify(cliente || {}),
        modeloCobranca,
        JSON.stringify(propostaBase.itensServico),
        JSON.stringify(propostaBase.itensMaterial),
        propostaBase.kmDeslocamento,
        JSON.stringify(calculo),
      ]
    );
    res.status(201).json(linhaParaProposta(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "falha ao criar proposta" });
  }
});

// Lista propostas de um eletricista
router.get("/", async (req, res) => {
  const { usuarioId, status } = req.query;
  try {
    const condicoes = [];
    const valores = [];
    if (usuarioId) {
      valores.push(usuarioId);
      condicoes.push(`usuario_id = $${valores.length}`);
    }
    if (status) {
      valores.push(status);
      condicoes.push(`status = $${valores.length}`);
    }
    const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `SELECT * FROM propostas ${where} ORDER BY criado_em DESC`,
      valores
    );
    res.json(rows.map(linhaParaProposta));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "falha ao listar propostas" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM propostas WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ erro: "proposta não encontrada" });
    res.json(linhaParaProposta(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "falha ao buscar proposta" });
  }
});

// Atualiza status (ex: enviada, aceita, recusada, concluída)
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const validos = ["pendente", "enviada", "aceita", "recusada", "concluida"];
  if (!validos.includes(status)) return res.status(400).json({ erro: "status inválido" });

  try {
    const { rows } = await pool.query(
      "UPDATE propostas SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erro: "proposta não encontrada" });
    res.json(linhaParaProposta(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "falha ao atualizar status" });
  }
});

// Gera e baixa o PDF da proposta
router.get("/:id/pdf", async (req, res) => {
  try {
    const { rows: propostas } = await pool.query("SELECT * FROM propostas WHERE id = $1", [
      req.params.id,
    ]);
    const propostaRow = propostas[0];
    if (!propostaRow) return res.status(404).json({ erro: "proposta não encontrada" });

    const { rows: usuarios } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      propostaRow.usuario_id,
    ]);
    const usuario = linhaParaUsuario(usuarios[0]);
    const proposta = linhaParaProposta(propostaRow);

    const pdfBuffer = await gerarPdfProposta({ usuario, proposta, calculo: proposta.calculo });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="orcamento-${proposta.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "falha ao gerar PDF" });
  }
});

export default router;

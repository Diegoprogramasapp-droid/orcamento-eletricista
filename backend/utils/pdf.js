import PDFDocument from "pdfkit";

// Formata número no padrão brasileiro: milhar com ponto, decimal com vírgula
function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Gera o PDF do orçamento e devolve como Buffer.
// Versão voltada para o cliente final: não expõe a métrica interna de
// cobrança (horas/pontos/diárias), só os valores. Traz a logomarca do
// profissional no cabeçalho, à direita.
export function gerarPdfProposta({ usuario, proposta, calculo }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const larguraUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const topoInicial = doc.y;

    const logo = converterDataUrlParaBuffer(usuario.foto);
    if (logo) {
      try {
        doc.image(logo, doc.page.width - doc.page.margins.right - 70, topoInicial, {
          fit: [70, 70],
        });
      } catch (e) {
        // segue sem a imagem se estiver corrompida
      }
    }

    doc.fontSize(18).fillColor("#000").text(usuario.nome, { continued: false });
    doc.fontSize(10).fillColor("#555")
      .text(`${usuario.telefone}${usuario.email ? " · " + usuario.email : ""}`)
      .text(usuario.cidade);

    doc.y = Math.max(doc.y, topoInicial + 70) + 15;

    linhaDivisoria(doc, larguraUtil);
    doc.moveDown(0.8);

    doc.font("Helvetica-Bold").fontSize(20).fillColor("#000")
      .text("Orçamento De Serviço Elétrico", { align: "center" });
    doc.font("Helvetica");
    doc.moveDown(0.8);

    tituloSecao(doc, "Dados Do Cliente");
    doc.fontSize(10).fillColor("#333")
      .text(`Cliente: ${proposta.cliente?.nome || "-"}`)
      .text(`Endereço: ${proposta.cliente?.endereco || "-"}`);
    doc.moveDown(1);

    tituloSecao(doc, "Serviços");
    proposta.itensServico.forEach((item) => {
      doc.fontSize(10).fillColor("#333").text(`• ${item.descricao}`);
    });
    doc.moveDown(0.4);
    valorDestacado(doc, "Mão de obra", calculo.totalServico);
    doc.moveDown(0.8);

    const materiaisEletricista = calculo.materiaisCalculados.filter((i) => i.responsavel === "eletricista");
    if (materiaisEletricista.length) {
      tituloSecao(doc, "Materiais Fornecidos Pelo Eletricista");
      materiaisEletricista.forEach((item) => {
        doc.fontSize(10).fillColor("#333")
          .text(`• ${item.nome} — ${item.quantidade}x — R$ ${formatarMoeda(item.valorFinal)}`);
      });
      doc.moveDown(0.4);
      valorDestacado(doc, "Materiais", calculo.totalMaterial);
      doc.moveDown(0.8);
    }

    const materiaisCliente = calculo.materiaisCalculados.filter((i) => i.responsavel === "cliente");
    if (materiaisCliente.length) {
      tituloSecao(doc, "Materiais Que O Cliente Deve Providenciar");
      materiaisCliente.forEach((item) => {
        doc.fontSize(10).fillColor("#333").text(`• ${item.nome} — ${item.quantidade}x`);
      });
      doc.moveDown(1);
    }

    if (calculo.totalDeslocamento > 0) {
      valorDestacado(doc, "Deslocamento", calculo.totalDeslocamento);
      doc.moveDown(0.8);
    }

    linhaDivisoria(doc, larguraUtil);
    doc.moveDown(0.6);

    doc.fontSize(16).fillColor("#000").text(`Total: R$ ${formatarMoeda(calculo.total)}`, {
      underline: false,
    });

    doc.moveDown(2);
    doc.fontSize(8).fillColor("#888").text("Proposta válida por 15 dias a partir da data de emissão.");

    doc.end();
  });
}

function tituloSecao(doc, texto) {
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#000")
    .text(texto, { underline: true });
  doc.font("Helvetica");
  doc.moveDown(0.3);
}

function valorDestacado(doc, rotulo, valor) {
  doc.fontSize(11).fillColor("#000").text(`${rotulo}: R$ ${formatarMoeda(valor)}`);
}

function linhaDivisoria(doc, largura) {
  const y = doc.y;
  doc.moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.margins.left + largura, y)
    .strokeColor("#ddd")
    .lineWidth(1)
    .stroke();
}

function converterDataUrlParaBuffer(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) return null;
  const partes = dataUrl.split(",");
  if (partes.length < 2) return null;
  try {
    return Buffer.from(partes[1], "base64");
  } catch (e) {
    return null;
  }
}

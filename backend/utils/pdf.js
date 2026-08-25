import PDFDocument from "pdfkit";

// Gera o PDF do orçamento e devolve como Buffer.
// Separa materiais do eletricista (com valor) dos materiais do cliente (sem valor).
export function gerarPdfProposta({ usuario, proposta, calculo }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Cabeçalho
    doc.fontSize(18).text(usuario.nome, { continued: false });
    doc.fontSize(10).fillColor("#555")
      .text(`${usuario.telefone}${usuario.email ? " · " + usuario.email : ""}`)
      .text(usuario.cidade);
    doc.moveDown(1.5);

    doc.fillColor("#000").fontSize(14).text("Orçamento de serviço elétrico", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#333")
      .text(`Cliente: ${proposta.cliente?.nome || "-"}`)
      .text(`Endereço: ${proposta.cliente?.endereco || "-"}`)
      .text(`Modelo de cobrança: ${rotuloModelo(proposta.modeloCobranca)}`);
    doc.moveDown(1);

    // Serviços
    doc.fontSize(12).fillColor("#000").text("Serviços");
    doc.moveDown(0.3);
    proposta.itensServico.forEach((item) => {
      doc.fontSize(10).fillColor("#333")
        .text(`• ${item.descricao} — ${item.quantidade} ${unidadeModelo(proposta.modeloCobranca)}`);
    });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#000").text(`Subtotal mão de obra: R$ ${calculo.totalServico.toFixed(2)}`);
    doc.moveDown(1);

    // Materiais do eletricista
    const materiaisEletricista = calculo.materiaisCalculados.filter((i) => i.responsavel === "eletricista");
    if (materiaisEletricista.length) {
      doc.fontSize(12).fillColor("#000").text("Materiais fornecidos pelo eletricista");
      doc.moveDown(0.3);
      materiaisEletricista.forEach((item) => {
        doc.fontSize(10).fillColor("#333")
          .text(`• ${item.nome} — ${item.quantidade}x — R$ ${item.valorFinal.toFixed(2)}`);
      });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#000").text(`Subtotal materiais: R$ ${calculo.totalMaterial.toFixed(2)}`);
      doc.moveDown(1);
    }

    // Materiais do cliente (lista de referência, sem cobrança)
    const materiaisCliente = calculo.materiaisCalculados.filter((i) => i.responsavel === "cliente");
    if (materiaisCliente.length) {
      doc.fontSize(12).fillColor("#000").text("Materiais que o cliente deve providenciar");
      doc.moveDown(0.3);
      materiaisCliente.forEach((item) => {
        doc.fontSize(10).fillColor("#333").text(`• ${item.nome} — ${item.quantidade}x`);
      });
      doc.moveDown(1);
    }

    // Deslocamento
    if (calculo.totalDeslocamento > 0) {
      doc.fontSize(10).fillColor("#000")
        .text(`Deslocamento: R$ ${calculo.totalDeslocamento.toFixed(2)}`);
      doc.moveDown(1);
    }

    // Total
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#000").text(`Total: R$ ${calculo.total.toFixed(2)}`, { underline: true });

    doc.moveDown(2);
    doc.fontSize(8).fillColor("#888").text("Proposta válida por 15 dias a partir da data de emissão.");

    doc.end();
  });
}

function rotuloModelo(modelo) {
  return { hora: "Por hora", diaria: "Por diária", ponto: "Por ponto" }[modelo] || modelo;
}
function unidadeModelo(modelo) {
  return { hora: "hora(s)", diaria: "diária(s)", ponto: "ponto(s)" }[modelo] || "";
}

export function calcularProposta(proposta, metricas) {
  const { modeloCobranca, itensServico = [], itensMaterial = [], kmDeslocamento = 0 } = proposta;

  let totalServico = 0;
  if (modeloCobranca === "hora") {
    const horas = itensServico.reduce((soma, i) => soma + (Number(i.quantidade) || 0), 0);
    totalServico = horas * (metricas.valorHora || 0);
  } else if (modeloCobranca === "diaria") {
    const diarias = itensServico.reduce((soma, i) => soma + (Number(i.quantidade) || 0), 0);
    totalServico = diarias * (metricas.valorDiaria || 0);
  } else if (modeloCobranca === "ponto") {
    const pontos = itensServico.reduce((soma, i) => soma + (Number(i.quantidade) || 0), 0);
    totalServico = pontos * (metricas.valorPonto || 0);
  }

  const materiaisCalculados = itensMaterial.map((item) => {
    const custo = Number(item.custo) || 0;
    const quantidade = Number(item.quantidade) || 1;
    if (item.responsavel === "eletricista") {
      const margem = item.margemAplicada != null ? Number(item.margemAplicada) : metricas.margemMaterial || 0;
      const valorFinal = custo * quantidade * (1 + margem / 100);
      return { ...item, quantidade, custo, margemAplicada: margem, valorFinal: round2(valorFinal) };
    }
    return { ...item, quantidade, custo: null, margemAplicada: null, valorFinal: 0 };
  });

  const totalMaterial = materiaisCalculados
    .filter((i) => i.responsavel === "eletricista")
    .reduce((soma, i) => soma + i.valorFinal, 0);

  const totalDeslocamento = (Number(kmDeslocamento) || 0) * (metricas.valorKm || 0);

  const total = round2(totalServico + totalMaterial + totalDeslocamento);

  return {
    totalServico: round2(totalServico),
    totalMaterial: round2(totalMaterial),
    totalDeslocamento: round2(totalDeslocamento),
    materiaisCalculados,
    total,
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

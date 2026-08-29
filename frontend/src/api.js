const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const erro = await res.json().catch(() => ({}));
    throw new Error(erro.erro || "Erro na requisição");
  }
  return res.json();
}

export const api = {
  criarPerfil: (dados) => request("/perfil", { method: "POST", body: JSON.stringify(dados) }),
  buscarPerfil: (id) => request(`/perfil/${id}`),

  criarProposta: (dados) => request("/propostas", { method: "POST", body: JSON.stringify(dados) }),
  listarPropostas: (usuarioId) => request(`/propostas?usuarioId=${usuarioId}`),
  atualizarStatus: (id, status) =>
    request(`/propostas/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  urlPdf: (id) => `${BASE_URL}/propostas/${id}/pdf`,
};

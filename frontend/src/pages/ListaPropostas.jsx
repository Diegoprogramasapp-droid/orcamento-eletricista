import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

const rotuloStatus = {
  pendente: "Pendente",
  enviada: "Enviada",
  aceita: "Aceita",
  recusada: "Recusada",
  concluida: "Concluída",
};

export default function ListaPropostas() {
  const usuarioId = localStorage.getItem("usuarioId");
  const [propostas, setPropostas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .listarPropostas(usuarioId)
      .then(setPropostas)
      .finally(() => setCarregando(false));
  }, [usuarioId]);

  async function marcarStatus(id, status) {
    const atualizada = await api.atualizarStatus(id, status);
    setPropostas((lista) => lista.map((p) => (p.id === id ? atualizada : p)));
  }

  return (
    <div className="container">
      <div className="cabecalho-lista">
        <h1>Seus orçamentos</h1>
        <Link className="botao" to="/propostas/nova">
          + Novo orçamento
        </Link>
      </div>

      {carregando && <p>Carregando...</p>}
      {!carregando && propostas.length === 0 && (
        <p className="subtitulo">Nenhum orçamento ainda. Crie o primeiro!</p>
      )}

      <ul className="lista-propostas">
        {propostas.map((p) => (
          <li key={p.id} className="item-proposta">
            <div>
              <strong>{p.cliente?.nome || "Cliente sem nome"}</strong>
              <span className={`selo selo-${p.status}`}>{rotuloStatus[p.status]}</span>
            </div>
            <div className="detalhes-proposta">
              <span>R$ {p.calculo.total.toFixed(2)}</span>
              <a href={api.urlPdf(p.id)} target="_blank" rel="noreferrer">
                PDF
              </a>
              {p.status === "pendente" && (
                <button onClick={() => marcarStatus(p.id, "enviada")}>Marcar como enviada</button>
              )}
              {p.status === "enviada" && (
                <button onClick={() => marcarStatus(p.id, "aceita")}>Marcar como aceita</button>
              )}
              {p.status === "aceita" && (
                <button onClick={() => marcarStatus(p.id, "concluida")}>Marcar como concluída</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

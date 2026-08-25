import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

const unidadePorModelo = { hora: "horas", diaria: "diárias", ponto: "pontos" };

export default function NovaProposta() {
  const usuarioId = localStorage.getItem("usuarioId");
  const navigate = useNavigate();

  const [cliente, setCliente] = useState({ nome: "", telefone: "", endereco: "" });
  const [modeloCobranca, setModeloCobranca] = useState("hora");
  const [itensServico, setItensServico] = useState([{ descricao: "", quantidade: "" }]);
  const [itensMaterial, setItensMaterial] = useState([]);
  const [kmDeslocamento, setKmDeslocamento] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [propostaCriada, setPropostaCriada] = useState(null);

  function atualizarServico(i, campo, valor) {
    setItensServico((lista) => lista.map((item, idx) => (idx === i ? { ...item, [campo]: valor } : item)));
  }
  function adicionarServico() {
    setItensServico((lista) => [...lista, { descricao: "", quantidade: "" }]);
  }
  function removerServico(i) {
    setItensServico((lista) => lista.filter((_, idx) => idx !== i));
  }

  function atualizarMaterial(i, campo, valor) {
    setItensMaterial((lista) => lista.map((item, idx) => (idx === i ? { ...item, [campo]: valor } : item)));
  }
  function adicionarMaterial() {
    setItensMaterial((lista) => [
      ...lista,
      { nome: "", quantidade: 1, custo: "", responsavel: "eletricista" },
    ]);
  }
  function removerMaterial(i) {
    setItensMaterial((lista) => lista.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const proposta = await api.criarProposta({
        usuarioId,
        cliente,
        modeloCobranca,
        itensServico,
        itensMaterial,
        kmDeslocamento,
      });
      setPropostaCriada(proposta);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (propostaCriada) {
    return (
      <div className="container">
        <h1>Orçamento gerado ✅</h1>
        <p className="subtitulo">
          Total: <strong>R$ {propostaCriada.calculo.total.toFixed(2)}</strong>
        </p>
        <div className="acoes">
          <a
            className="botao"
            href={api.urlPdf(propostaCriada.id)}
            target="_blank"
            rel="noreferrer"
          >
            Ver / baixar PDF
          </a>
          <a
            className="botao secundario"
            href={`https://wa.me/?text=${encodeURIComponent(
              `Segue seu orçamento: ${api.urlPdf(propostaCriada.id)}`
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Enviar por WhatsApp
          </a>
          <button className="botao secundario" onClick={() => navigate("/propostas")}>
            Ver todos os orçamentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Novo orçamento</h1>

      <form onSubmit={handleSubmit} className="form">
        <fieldset>
          <legend>Cliente</legend>
          <label>
            Nome
            <input
              value={cliente.nome}
              onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
              required
            />
          </label>
          <label>
            Telefone
            <input
              value={cliente.telefone}
              onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
            />
          </label>
          <label>
            Endereço
            <input
              value={cliente.endereco}
              onChange={(e) => setCliente({ ...cliente, endereco: e.target.value })}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Modelo de cobrança</legend>
          <div className="opcoes">
            {["hora", "diaria", "ponto"].map((modelo) => (
              <label key={modelo} className="opcao-radio">
                <input
                  type="radio"
                  name="modelo"
                  value={modelo}
                  checked={modeloCobranca === modelo}
                  onChange={() => setModeloCobranca(modelo)}
                />
                {modelo === "hora" ? "Por hora" : modelo === "diaria" ? "Por diária" : "Por ponto"}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Serviços ({unidadePorModelo[modeloCobranca]})</legend>
          {itensServico.map((item, i) => (
            <div className="linha-item" key={i}>
              <input
                placeholder="Descrição (ex: troca de disjuntor)"
                value={item.descricao}
                onChange={(e) => atualizarServico(i, "descricao", e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder={unidadePorModelo[modeloCobranca]}
                value={item.quantidade}
                onChange={(e) => atualizarServico(i, "quantidade", e.target.value)}
              />
              {itensServico.length > 1 && (
                <button type="button" className="remover" onClick={() => removerServico(i)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="adicionar" onClick={adicionarServico}>
            + Adicionar serviço
          </button>
        </fieldset>

        <fieldset>
          <legend>Materiais</legend>
          {itensMaterial.map((item, i) => (
            <div className="linha-item linha-material" key={i}>
              <input
                placeholder="Nome do material"
                value={item.nome}
                onChange={(e) => atualizarMaterial(i, "nome", e.target.value)}
              />
              <input
                type="number"
                min="1"
                placeholder="Qtd"
                value={item.quantidade}
                onChange={(e) => atualizarMaterial(i, "quantidade", e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Custo (R$)"
                value={item.custo}
                onChange={(e) => atualizarMaterial(i, "custo", e.target.value)}
                disabled={item.responsavel === "cliente"}
              />
              <select
                value={item.responsavel}
                onChange={(e) => atualizarMaterial(i, "responsavel", e.target.value)}
              >
                <option value="eletricista">Material do eletricista</option>
                <option value="cliente">Material do cliente</option>
              </select>
              <button type="button" className="remover" onClick={() => removerMaterial(i)}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="adicionar" onClick={adicionarMaterial}>
            + Adicionar material
          </button>
        </fieldset>

        <fieldset>
          <legend>Deslocamento</legend>
          <label>
            Km rodado (ida e volta)
            <input
              type="number"
              min="0"
              step="0.1"
              value={kmDeslocamento}
              onChange={(e) => setKmDeslocamento(e.target.value)}
            />
          </label>
        </fieldset>

        {erro && <p className="erro">{erro}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Gerando..." : "Gerar orçamento"}
        </button>
      </form>
    </div>
  );
}

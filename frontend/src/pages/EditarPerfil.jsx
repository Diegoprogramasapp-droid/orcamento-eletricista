import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function EditarPerfil() {
  const usuarioId = localStorage.getItem("usuarioId");
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [novoPin, setNovoPin] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    api
      .buscarPerfil(usuarioId)
      .then((usuario) => {
        setForm({
          nome: usuario.nome,
          telefone: usuario.telefone,
          email: usuario.email || "",
          cidade: usuario.cidade,
          foto: usuario.foto || "",
          valorHora: usuario.metricas.valorHora || "",
          valorDiaria: usuario.metricas.valorDiaria || "",
          valorPonto: usuario.metricas.valorPonto || "",
          margemMaterial: usuario.metricas.margemMaterial || "",
          valorKm: usuario.metricas.valorKm || "",
        });
      })
      .catch(() => setErro("Não foi possível carregar seu perfil."))
      .finally(() => setCarregando(false));
  }, [usuarioId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, foto: reader.result }));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso(false);
    setSalvando(true);
    try {
      const dados = { ...form };
      if (novoPin) dados.pin = novoPin;
      await api.atualizarPerfil(usuarioId, dados);
      setSucesso(true);
      setNovoPin("");
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <div className="container">Carregando...</div>;
  if (!form) return <div className="container">{erro || "Perfil não encontrado."}</div>;

  return (
    <div className="container">
      <h1>Editar perfil</h1>
      <p className="subtitulo">Atualize seus dados e valores de cobrança quando precisar.</p>

      <form onSubmit={handleSubmit} className="form">
        <fieldset>
          <legend>Dados básicos</legend>
          <label>
            Nome
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </label>
          <label>
            Telefone
            <input name="telefone" value={form.telefone} onChange={handleChange} required />
          </label>
          <label>
            E-mail
            <input name="email" type="email" value={form.email} onChange={handleChange} />
          </label>
          <label>
            Cidade
            <input name="cidade" value={form.cidade} onChange={handleChange} required />
          </label>
          <label>
            Logomarca
            <input type="file" accept="image/*" onChange={handleFoto} />
          </label>
          <label>
            Novo PIN (deixe em branco para manter o atual)
            <input
              value={novoPin}
              onChange={(e) => setNovoPin(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="••••"
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Suas métricas de cobrança</legend>
          <label>
            Valor da hora (R$)
            <input name="valorHora" type="number" min="0" step="0.01" value={form.valorHora} onChange={handleChange} />
          </label>
          <label>
            Valor da diária (R$)
            <input name="valorDiaria" type="number" min="0" step="0.01" value={form.valorDiaria} onChange={handleChange} />
          </label>
          <label>
            Valor por ponto (R$)
            <input name="valorPonto" type="number" min="0" step="0.01" value={form.valorPonto} onChange={handleChange} />
          </label>
          <label>
            Margem sobre material (%)
            <input name="margemMaterial" type="number" min="0" step="0.01" value={form.margemMaterial} onChange={handleChange} />
          </label>
          <label>
            Valor por km rodado (R$)
            <input name="valorKm" type="number" min="0" step="0.01" value={form.valorKm} onChange={handleChange} />
          </label>
        </fieldset>

        {erro && <p className="erro">{erro}</p>}
        {sucesso && <p style={{ color: "#1c7c54" }}>Perfil atualizado com sucesso!</p>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
          <button type="button" className="botao secundario" onClick={() => navigate("/propostas")}>
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
}

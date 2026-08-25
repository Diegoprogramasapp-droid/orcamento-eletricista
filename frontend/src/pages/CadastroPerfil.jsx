import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

const inicial = {
  nome: "",
  telefone: "",
  email: "",
  cidade: "",
  foto: "",
  valorHora: "",
  valorDiaria: "",
  valorPonto: "",
  margemMaterial: "",
  valorKm: "",
};

export default function CadastroPerfil() {
  const [form, setForm] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

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
    setSalvando(true);
    try {
      const usuario = await api.criarPerfil(form);
      localStorage.setItem("usuarioId", usuario.id);
      navigate("/propostas");
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="container">
      <h1>Seu perfil</h1>
      <p className="subtitulo">
        Preencha uma vez e essas informações agilizam todos os seus orçamentos.
      </p>

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
            Foto
            <input type="file" accept="image/*" onChange={handleFoto} />
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

        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar e continuar"}
        </button>
      </form>
    </div>
  );
}

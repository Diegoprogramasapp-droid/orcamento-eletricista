import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function Entrar() {
  const [telefone, setTelefone] = useState("");
  const [pin, setPin] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const usuario = await api.entrar(telefone.trim(), pin.trim());
      localStorage.setItem("usuarioId", usuario.id);
      navigate("/propostas");
    } catch (err) {
      setErro("Telefone ou PIN incorretos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="container">
      <h1>Entrar</h1>
      <p className="subtitulo">Digite o telefone e o PIN que você usou no cadastro.</p>

      <form onSubmit={handleSubmit} className="form">
        <fieldset>
          <label>
            Telefone
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
              required
            />
          </label>
          <label>
            PIN (4 a 6 números)
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="••••"
              required
            />
          </label>
        </fieldset>

        {erro && <p className="erro">{erro}</p>}

        <button type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="subtitulo" style={{ marginTop: 16 }}>
        Ainda não tem cadastro? <Link to="/cadastro">Criar agora</Link>
      </p>
    </div>
  );
}

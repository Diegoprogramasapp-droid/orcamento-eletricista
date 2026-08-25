import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import CadastroPerfil from "./pages/CadastroPerfil.jsx";
import NovaProposta from "./pages/NovaProposta.jsx";
import ListaPropostas from "./pages/ListaPropostas.jsx";

export default function App() {
  const usuarioId = localStorage.getItem("usuarioId");

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={usuarioId ? <Navigate to="/propostas" /> : <Navigate to="/cadastro" />}
        />
        <Route path="/cadastro" element={<CadastroPerfil />} />
        <Route path="/propostas" element={<ListaPropostas />} />
        <Route path="/propostas/nova" element={<NovaProposta />} />
      </Routes>
    </HashRouter>
  );
}

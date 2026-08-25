// Armazenamento persistido em arquivo JSON (backend/data/db.json).
// Simples e sem dependências nativas — funciona em qualquer SO sem build tools.
// Para escalar de verdade, trocar por um banco real (Postgres/SQLite).

import { carregarDB, salvarDB } from "./persist.js";

export const db = carregarDB(); // { usuarios: {}, propostas: {} } — objetos simples, chave = id

export function persistir() {
  salvarDB(db);
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "db.json");

const vazio = { usuarios: {}, propostas: {} };

export function carregarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) return structuredClone(vazio);
    const conteudo = fs.readFileSync(DB_PATH, "utf-8");
    if (!conteudo.trim()) return structuredClone(vazio);
    return JSON.parse(conteudo);
  } catch (err) {
    console.error("Falha ao ler db.json, iniciando vazio:", err.message);
    return structuredClone(vazio);
  }
}

export function salvarDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Falha ao salvar db.json:", err.message);
  }
}

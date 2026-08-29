import pg from "pg";

const { Pool } = pg;

// O Render injeta DATABASE_URL automaticamente quando o Postgres é conectado
// ao Web Service. Localmente, defina a mesma variável no seu .env se quiser
// testar com Postgres na sua máquina (opcional).
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("render.com")
    ? { rejectUnauthorized: false }
    : false,
});

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      email TEXT,
      cidade TEXT NOT NULL,
      foto TEXT,
      metricas JSONB NOT NULL DEFAULT '{}',
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS propostas (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL REFERENCES usuarios(id),
      cliente JSONB NOT NULL DEFAULT '{}',
      modelo_cobranca TEXT NOT NULL,
      itens_servico JSONB NOT NULL DEFAULT '[]',
      itens_material JSONB NOT NULL DEFAULT '[]',
      km_deslocamento NUMERIC NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pendente',
      calculo JSONB NOT NULL DEFAULT '{}',
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  console.log("Banco de dados pronto (tabelas verificadas/criadas).");
}

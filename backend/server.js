import express from "express";
import cors from "cors";
import perfilRoutes from "./routes/perfil.js";
import propostasRoutes from "./routes/propostas.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" })); // limit maior por causa da foto em base64

app.use("/api/perfil", perfilRoutes);
app.use("/api/propostas", propostasRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

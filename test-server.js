import express from "express";
import { batchSetToPrimary } from "./controllers/replicate.js";

const app = express();
app.use(express.json());

app.post("/batch-set", async (req, res) => {
  const data = req.body; // Mảng [{key, value}, ...]
  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: "Body phải là mảng không rỗng" });
  }

  const results = await batchSetToPrimary(data);
  res.json({ results });
});

app.listen(3000, () => {
  console.log("Test server running on http://localhost:3000");
});

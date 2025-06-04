const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { batchSetToPrimary, getPrimary } = require("./replicate.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  try {
    const primaryNode = getPrimary;
    const resDumps = await fetch(`${primaryNode}/dumps`);
    if (!resDumps.ok) throw new Error("Failed to load database");
    const data = await resDumps.json();
    res.render("index", { primaryNode, database: data.database });
  } catch (error) {
    console.error("Error loading database:", error);
    res.render("index", {
      primaryNode: getPrimary,
      database: {},
      error: error.message,
    });
  }
});

app.post("/set", async (req, res) => {
  const { key, value } = req.body;
  try {
    const resSet = await fetch(`${getPrimary}/set`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (!resSet.ok) throw new Error("Failed to set key-value");
    res.redirect("/");
  } catch (error) {
    console.error("Error setting key-value:", error);
    res.render("index", {
      primaryNode: getPrimary,
      database: {},
      error: `Set error: ${error.message}`,
    });
  }
});

app.post("/batch-set", async (req, res) => {
  const data = req.body; // Mảng [{key, value}, ...]
  if (!Array.isArray(data) || data.length === 0) {
    return res.render("index", {
      primaryNode: getPrimary,
      database: {},
      error: "Body phải là mảng không rỗng",
    });
  }
  try {
    const results = await batchSetToPrimary(data);
    const error = results.find((r) => !r.success)?.error;
    if (error) throw new Error(error);
    res.redirect("/");
  } catch (error) {
    console.error("Error in batch set:", error);
    res.render("index", {
      primaryNode: getPrimary,
      database: {},
      error: `Batch set error: ${error.message}`,
    });
  }
});

app.get("/get", async (req, res) => {
  const { key } = req.query;
  try {
    const resGet = await fetch(
      `${getPrimary}/get?key=${encodeURIComponent(key)}`
    );
    if (!resGet.ok) throw new Error("Failed to get value");
    const data = await resGet.json();
    const resDumps = await fetch(`${getPrimary}/dumps`);
    const database = resDumps.ok ? (await resDumps.json()).database : {};
    res.render("index", {
      primaryNode: getPrimary,
      database,
      getResult: `Value: ${data.value || "Not found"}`,
    });
  } catch (error) {
    console.error("Error getting value:", error);
    res.render("index", {
      primaryNode: getPrimary,
      database: {},
      error: `Get error: ${error.message}`,
    });
  }
});

app.post("/remove", async (req, res) => {
  const { key } = req.body;
  try {
    const resRemove = await fetch(
      `${getPrimary}/remove/${encodeURIComponent(key)}`,
      {
        method: "DELETE",
      }
    );
    if (!resRemove.ok) throw new Error("Failed to remove key");
    res.redirect("/");
  } catch (error) {
    console.error("Error removing key:", error);
    res.render("index", {
      primaryNode: getPrimary,
      database: {},
      error: `Remove error: ${error.message}`,
    });
  }
});

app.listen(3000, () => {
  console.log("Web server running on http://localhost:3000");
});

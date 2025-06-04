import express from "express";
import fetch from "node-fetch";
import {
  batchSetToPrimary,
  getPrimary,
  nodeRoles,
  replicate,
} from "./controllers/replicate.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Khởi động replicate
replicate(); // Chạy lần đầu
setInterval(replicate, 5000); // Chạy định kỳ 5 giây

// Middleware kiểm tra quyền ghi
function checkWritePermission(req, res, next) {
  const primaryNode = getPrimary;
  if (nodeRoles[primaryNode] !== "primary") {
    return res.render("index", {
      primaryNode,
      todos: [],
      error: "Write operations only allowed on primary node",
    });
  }
  next();
}

app.get("/", async (req, res) => {
  try {
    const primaryNode = getPrimary;
    // Thử đọc từ bất kỳ node nào
    let todos = [];
    for (const node of Object.keys(nodeRoles)) {
      try {
        const resDumps = await fetch(`${node}/dumps`);
        if (resDumps.ok) {
          const data = await resDumps.json();
          todos = Object.entries(data.database)
            .filter(([key]) => key.startsWith("todo_"))
            .map(([key, value]) => ({ id: key, ...JSON.parse(value) }));
          break;
        }
      } catch (error) {
        console.error(`Error reading from ${node}:`, error);
      }
    }
    res.render("index", { primaryNode, todos, error: null });
  } catch (error) {
    console.error("Error loading todos:", error);
    res.render("index", {
      primaryNode: getPrimary,
      todos: [],
      error: error.message,
    });
  }
});

app.post("/add", checkWritePermission, async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.render("index", {
      primaryNode: getPrimary,
      todos: [],
      error: "Title is required",
    });
  }
  try {
    const id = `todo_${Date.now()}`;
    const todo = { title, completed: false };
    const resSet = await fetch(`${getPrimary}/set`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: id, value: JSON.stringify(todo) }),
    });
    if (!resSet.ok) throw new Error("Failed to add todo");
    res.redirect("/");
  } catch (error) {
    console.error("Error adding todo:", error);
    res.render("index", {
      primaryNode: getPrimary,
      todos: [],
      error: `Add error: ${error.message}`,
    });
  }
});

app.post("/batch-add", checkWritePermission, async (req, res) => {
  let titles = req.body.titles;
  try {
    if (typeof titles === "string") {
      titles = titles
        .split("\n")
        .map((t) => t.trim())
        .filter((t) => t);
    }
    if (!Array.isArray(titles) || titles.length === 0) {
      throw new Error("At least one title is required");
    }
    const data = titles.map((title) => ({
      key: `todo_${Date.now() + Math.random()}`,
      value: JSON.stringify({ title, completed: false }),
    }));
    const results = await batchSetToPrimary(data);
    const error = results.find((r) => !r.success)?.error;
    if (error) throw new Error(error);
    res.redirect("/");
  } catch (error) {
    console.error("Error in batch add:", error);
    res.render("index", {
      primaryNode: getPrimary,
      todos: [],
      error: `Batch add error: ${error.message}`,
    });
  }
});

app.post("/complete/:id", checkWritePermission, async (req, res) => {
  const { id } = req.params;
  try {
    const resGet = await fetch(
      `${getPrimary}/get?key=${encodeURIComponent(id)}`
    );
    if (!resGet.ok) throw new Error("Todo not found");
    const data = await resGet.json();
    const todo = JSON.parse(data.value);
    todo.completed = true;
    const resSet = await fetch(`${getPrimary}/set`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: id, value: JSON.stringify(todo) }),
    });
    if (!resSet.ok) throw new Error("Failed to complete todo");
    res.redirect("/");
  } catch (error) {
    console.error("Error completing todo:", error);
    res.render("index", {
      primaryNode: getPrimary,
      todos: [],
      error: `Complete error: ${error.message}`,
    });
  }
});

app.post("/delete/:id", checkWritePermission, async (req, res) => {
  const { id } = req.params;
  try {
    const resRemove = await fetch(
      `${getPrimary}/remove/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );
    if (!resRemove.ok) throw new Error("Failed to delete todo");
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.render("index", {
      primaryNode: getPrimary,
      todos: [],
      error: `Delete error: ${error.message}`,
    });
  }
});

app.listen(3000, () => {
  console.log("Todo List server running on http://localhost:3000");
});

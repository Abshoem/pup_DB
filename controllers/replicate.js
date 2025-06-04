import fs from "fs";
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Đọc file nodes.json
let nodes = [];
try {
  const data = fs.readFileSync("./nodes.json", "utf-8");
  nodes = JSON.parse(data);
  if (!Array.isArray(nodes) || nodes.length === 0) {
    throw new Error("nodes.json phải là mảng và không được rỗng");
  }
} catch (err) {
  console.error("Lỗi đọc hoặc parse nodes.json:", err);
  process.exit(1);
}

let primaryUrl = nodes[0];
let secondaryUrls = nodes.slice(1);

// Kiểm tra node có sống không
async function isNodeAlive(nodeUrl) {
  try {
    const res = await fetch(`${nodeUrl}/dumps`, { timeout: 2000 });
    return res.ok;
  } catch (error) {
    console.error(`Node ${nodeUrl} is down:`, error);
    return false;
  }
}

// Bầu chọn node chính mới
async function electNewPrimary() {
  for (const nodeUrl of secondaryUrls) {
    if (await isNodeAlive(nodeUrl)) {
      console.log(`Elected new primary: ${nodeUrl}`);
      primaryUrl = nodeUrl;
      secondaryUrls = nodes.filter((url) => url !== primaryUrl);
      return true;
    }
  }
  console.error("No live nodes available for election");
  return false;
}

// Lấy dữ liệu từ node chính
async function fetchPrimaryData() {
  try {
    const res = await fetch(`${primaryUrl}/dumps`);
    if (!res.ok) throw new Error(`Failed to fetch dumps: ${res.status}`);
    const data = await res.json();
    return data.database;
  } catch (error) {
    console.error("Error fetching primary data:", error);
    return null;
  }
}

// Lấy dữ liệu từ node phụ
async function fetchSecondaryData(nodeUrl) {
  try {
    const res = await fetch(`${nodeUrl}/dumps`);
    if (!res.ok)
      throw new Error(`Failed to fetch dumps from ${nodeUrl}: ${res.status}`);
    const data = await res.json();
    return data.database;
  } catch (error) {
    console.error(`Error fetching secondary data from ${nodeUrl}:`, error);
    return null;
  }
}

// Gửi batch key-value
async function batchPushToSecondary(nodeUrl, batch) {
  try {
    const requests = batch.map(({ key, value }) =>
      fetch(`${nodeUrl}/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
        .then(async (res) => {
          if (res.ok) {
            return { key, success: true };
          } else {
            const errText = await res.text();
            return { key, success: false, error: `${res.status} - ${errText}` };
          }
        })
        .catch((error) => ({
          key,
          success: false,
          error: error.message,
        }))
    );

    const results = await Promise.all(requests);
    results.forEach(({ key, success, error }) => {
      if (success) {
        console.log(`Replicated key='${key}' to ${nodeUrl} success.`);
      } else {
        console.error(`Replicate key='${key}' to ${nodeUrl} failed: ${error}`);
      }
    });
    return results;
  } catch (error) {
    console.error(`Error replicating batch to ${nodeUrl}:`, error);
    return batch.map(({ key }) => ({
      key,
      success: false,
      error: error.message,
    }));
  }
}

// Gửi batch xóa key
async function batchDeleteFromSecondary(nodeUrl, keys) {
  try {
    const requests = keys.map((key) =>
      fetch(`${nodeUrl}/remove/${encodeURIComponent(key)}`, {
        method: "DELETE",
      })
        .then(async (res) => {
          if (res.ok) {
            return { key, success: true };
          } else {
            const errText = await res.text();
            return { key, success: false, error: `${res.status} - ${errText}` };
          }
        })
        .catch((error) => ({
          key,
          success: false,
          error: error.message,
        }))
    );

    const results = await Promise.all(requests);
    results.forEach(({ key, success, error }) => {
      if (success) {
        console.log(`Deleted key='${key}' from ${nodeUrl} success.`);
      } else {
        console.error(`Delete key='${key}' from ${nodeUrl} failed: ${error}`);
      }
    });
    return results;
  } catch (error) {
    console.error(`Error deleting batch from ${nodeUrl}:`, error);
    return keys.map((key) => ({ key, success: false, error: error.message }));
  }
}

// Xử lý batch set
async function batchSetToPrimary(data) {
  try {
    const BATCH_SIZE = 10;
    const results = [];
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      const batchResults = await batchPushToSecondary(primaryUrl, batch);
      results.push(...batchResults);
    }
    return results;
  } catch (error) {
    console.error("Error in batchSetToPrimary:", error);
    return data.map(({ key }) => ({
      key,
      success: false,
      error: error.message,
    }));
  }
}

async function replicate() {
  console.log("--- Start replicate at", new Date().toLocaleTimeString());

  if (!(await isNodeAlive(primaryUrl))) {
    console.log(`Primary node ${primaryUrl} is down. Electing new primary...`);
    await electNewPrimary();
  }

  const primaryData = await fetchPrimaryData();
  if (!primaryData) {
    console.log("No data fetched from primary. Skipping replicate.");
    return;
  }

  const BATCH_SIZE = 10;
  for (const nodeUrl of secondaryUrls) {
    const secondaryData = await fetchSecondaryData(nodeUrl);
    if (!secondaryData) {
      console.log(`Skipping replicate for ${nodeUrl} due to fetch error.`);
      continue;
    }

    const updates = [];
    for (const [key, value] of Object.entries(primaryData)) {
      if (!(key in secondaryData) || secondaryData[key] !== value) {
        updates.push({ key, value });
      }
    }

    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);
      await batchPushToSecondary(nodeUrl, batch);
    }

    const keysToDelete = Object.keys(secondaryData).filter(
      (key) => !(key in primaryData)
    );

    for (let i = 0; i < keysToDelete.length; i += BATCH_SIZE) {
      const batch = keysToDelete.slice(i, i + BATCH_SIZE);
      await batchDeleteFromSecondary(nodeUrl, batch);
    }
  }
  console.log("--- Replication done at", new Date().toLocaleTimeString());
}

// Export hàm và biến
export { batchSetToPrimary, primaryUrl as getPrimary };

setInterval(replicate, 5000);
replicate();

import fs from "fs";
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Đọc file nodes.json chứa danh sách node dạng ["http://127.0.0.1:4000", ...]
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

const primaryUrl = nodes[0];
const secondaryUrls = nodes.slice(1);

console.log("Node chính (primary):", primaryUrl);
console.log("Node phụ (secondary):", secondaryUrls);

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

// Gửi batch key-value để set/update trên node phụ
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

// Gửi batch yêu cầu xóa key trên node phụ
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

// Hàm mới: Xử lý mảng key-value như một "request" duy nhất
async function batchSetToPrimary(data) {
  try {
    const BATCH_SIZE = 10; // Kích thước batch
    const results = [];

    // Chia mảng data thành các batch nhỏ
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
  const primaryData = await fetchPrimaryData();
  if (!primaryData) {
    console.log("No data fetched from primary. Skipping replicate.");
    return;
  }

  const BATCH_SIZE = 10; // Kích thước batch, có thể điều chỉnh

  for (const nodeUrl of secondaryUrls) {
    const secondaryData = await fetchSecondaryData(nodeUrl);
    if (!secondaryData) {
      console.log(`Skipping replicate for ${nodeUrl} due to fetch error.`);
      continue;
    }

    // Gom các key-value cần cập nhật/thêm mới thành batch
    const updates = [];
    for (const [key, value] of Object.entries(primaryData)) {
      if (!(key in secondaryData) || secondaryData[key] !== value) {
        updates.push({ key, value });
      }
    }

    // Gửi batch cập nhật
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);
      await batchPushToSecondary(nodeUrl, batch);
    }

    // Gom các key cần xóa thành batch
    const keysToDelete = Object.keys(secondaryData).filter(
      (key) => !(key in primaryData)
    );

    // Gửi batch xóa
    for (let i = 0; i < keysToDelete.length; i += BATCH_SIZE) {
      const batch = keysToDelete.slice(i, i + BATCH_SIZE);
      await batchDeleteFromSecondary(nodeUrl, batch);
    }
  }
  console.log("--- Replication done at", new Date().toLocaleTimeString());
}

// Export hàm batchSetToPrimary để test
export { batchSetToPrimary };

setInterval(replicate, 5000);
replicate();

// replicate.js
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const primaryUrl = "http://127.0.0.1:4000";
const secondaryUrls = ["http://127.0.0.1:4001", "http://127.0.0.1:4002"];

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

// Gửi key-value để set/update trên node phụ
async function pushToSecondary(nodeUrl, key, value) {
  try {
    const res = await fetch(`${nodeUrl}/set`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });

    if (res.ok) {
      console.log(`Replicated key='${key}' to ${nodeUrl} success.`);
    } else {
      const errText = await res.text();
      console.error(
        `Replicate key='${key}' to ${nodeUrl} failed: ${res.status} - ${errText}`
      );
    }
  } catch (error) {
    console.error(`Error replicating key='${key}' to ${nodeUrl}:`, error);
  }
}

// Gửi yêu cầu xoá key trên node phụ
async function deleteFromSecondary(nodeUrl, key) {
  try {
    const res = await fetch(`${nodeUrl}/remove/${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      console.log(`Deleted key='${key}' from ${nodeUrl} success.`);
    } else {
      const errText = await res.text();
      console.error(
        `Delete key='${key}' from ${nodeUrl} failed: ${res.status} - ${errText}`
      );
    }
  } catch (error) {
    console.error(`Error deleting key='${key}' from ${nodeUrl}:`, error);
  }
}

async function replicate() {
  console.log("--- Start replicate at", new Date().toLocaleTimeString());
  const primaryData = await fetchPrimaryData();
  if (!primaryData) {
    console.log("No data fetched from primary. Skipping replicate.");
    return;
  }

  for (const nodeUrl of secondaryUrls) {
    const secondaryData = await fetchSecondaryData(nodeUrl);
    if (!secondaryData) {
      console.log(`Skipping replicate for ${nodeUrl} due to fetch error.`);
      continue;
    }

    // Cập nhật hoặc thêm mới keys
    for (const [key, value] of Object.entries(primaryData)) {
      if (!(key in secondaryData) || secondaryData[key] !== value) {
        await pushToSecondary(nodeUrl, key, value);
      }
    }

    // Xoá keys không còn trong primary
    for (const key of Object.keys(secondaryData)) {
      if (!(key in primaryData)) {
        await deleteFromSecondary(nodeUrl, key);
      }
    }
  }
  console.log("--- Replication done at", new Date().toLocaleTimeString());
}

setInterval(replicate, 5000);
replicate();

// replicate.js
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const primaryUrl = "http://127.0.0.1:4000";
const secondaryUrls = ["http://127.0.0.1:4001", "http://127.0.0.1:4002"];

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

async function replicate() {
  console.log("--- Start replicate at", new Date().toLocaleTimeString());
  const data = await fetchPrimaryData();
  if (!data) {
    console.log("No data fetched from primary. Skipping replicate.");
    return;
  }

  for (const [key, value] of Object.entries(data)) {
    for (const nodeUrl of secondaryUrls) {
      await pushToSecondary(nodeUrl, key, value);
    }
  }
  console.log("--- Replication done at", new Date().toLocaleTimeString());
}

setInterval(replicate, 5000);
replicate();

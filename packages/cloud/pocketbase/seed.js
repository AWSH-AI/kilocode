/**
 * PocketBase seed script (Node)
 *
 * Usage:
 *   node packages/cloud/pocketbase/seed.js
 *
 * Behavior:
 * - Attempts to authenticate as admin if POCKETBASE_ADMIN_EMAIL and
 *   POCKETBASE_ADMIN_PASSWORD are provided.
 * - If admin auth is available, creates sample users, telemetry, and tasks
 *   via the admin REST API.
 * - If admin auth is not available, it will attempt unauthenticated record
 *   creation (which may fail if collection rules require auth).
 *
 * NOTE: Adjust collection names/fields as needed after importing
 * packages/cloud/pocketbase/collections.json into PocketBase admin UI.
 */

const { env } = process;
const POCKETBASE_URL = env.POCKETBASE_URL || "http://127.0.0.1:8090";
const ADMIN_EMAIL = env.POCKETBASE_ADMIN_EMAIL || "";
const ADMIN_PASSWORD = env.POCKETBASE_ADMIN_PASSWORD || "";

async function request(path, opts = {}) {
  const url = POCKETBASE_URL.replace(/\/$/, "") + path;
  const res = await fetch(url, opts);
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`Invalid JSON response from ${url}: ${text}`);
  }
  if (!res.ok) {
    const err = new Error(`Request failed ${res.status} ${res.statusText}: ${JSON.stringify(json)}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

async function adminAuth() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("POCKETBASE_ADMIN_EMAIL or POCKETBASE_ADMIN_PASSWORD not set — skipping admin auth.");
    return null;
  }

  console.log("Attempting admin auth...");
  // PocketBase admin auth endpoint
  const body = { identity: ADMIN_EMAIL, password: ADMIN_PASSWORD };
  const res = await request("/api/admins/auth-with-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // Response contains token.token
  const token = res?.token?.token;
  if (!token) {
    throw new Error("Admin auth succeeded but no token returned.");
  }
  console.log("Admin auth successful.");
  return token;
}

async function createRecordAdmin(collection, data, adminToken) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Admin ${adminToken}`,
  };
  return request(`/api/collections/${collection}/records`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
}

async function createRecordPublic(collection, data) {
  // Public create (may be blocked by collection rules)
  return request(`/api/collections/${collection}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function main() {
  try {
    const adminToken = await (async () => {
      try {
        return await adminAuth();
      } catch (err) {
        console.warn("Admin auth failed:", err.message || err);
        return null;
      }
    })();

    // Sample user
    const sampleUser = {
      email: "dev@kilocode.local",
      password: "password123",
      passwordConfirm: "password123",
      name: "Dev User",
      role: "owner",
    };

    try {
      console.log("Creating sample user...");
      if (adminToken) {
        const u = await createRecordAdmin("users", sampleUser, adminToken);
        console.log("Created user (admin):", u.id || u);
      } else {
        const u = await createRecordPublic("users", sampleUser);
        console.log("Created user (public):", u.id || u);
      }
    } catch (err) {
      console.warn("Could not create sample user:", err.message || err);
    }

    // Sample telemetry
    const telemetry = {
      event: "sample_event",
      properties: { sample: true, note: "seeded event" },
      timestamp: Date.now(),
      userId: "dev-user",
    };

    try {
      console.log("Creating sample telemetry record...");
      if (adminToken) {
        const t = await createRecordAdmin("telemetry", telemetry, adminToken);
        console.log("Created telemetry (admin):", t.id || t);
      } else {
        const t = await createRecordPublic("telemetry", telemetry);
        console.log("Created telemetry (public):", t.id || t);
      }
    } catch (err) {
      console.warn("Could not create telemetry:", err.message || err);
    }

    // Sample task
    const task = {
      title: "Seeded Task",
      content: "This is a sample task created by seed script.",
      status: "open",
      ownerId: "dev-user",
      createdAt: Date.now(),
    };

    try {
      console.log("Creating sample task...");
      if (adminToken) {
        const r = await createRecordAdmin("tasks", task, adminToken);
        console.log("Created task (admin):", r.id || r);
      } else {
        const r = await createRecordPublic("tasks", task);
        console.log("Created task (public):", r.id || r);
      }
    } catch (err) {
      console.warn("Could not create task:", err.message || err);
    }

    console.log("Seed complete. Visit the PocketBase admin UI at", POCKETBASE_URL);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

main();
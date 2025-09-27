/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Minimal PocketBase client adapter for local-first cloud.
 * - Uses pocketbase JS SDK
 * - Exposes helpers for init, auth, and simple record operations
 *
 * This is intentionally small; extend with retries, error handling,
 * and typing as you integrate more features.
 */

import PocketBase from "pocketbase"

let pb: PocketBase | null = null

export function initPocketBase(url?: string) {
  if (!pb) {
    const base = url || process.env.POCKETBASE_URL || "http://127.0.0.1:8090"
    pb = new PocketBase(base)
  }
  return pb
}

export function getPocketBase(): PocketBase {
  if (!pb) {
    return initPocketBase()
  }
  return pb
}

export async function adminAuth(email: string, password: string) {
  const client = getPocketBase()
  // PocketBase adminAuth is normally via the admin API key, but for development
  // we can use the SDK to sign in as a user. Use admin email only if configured.
  const auth = await client.collection("users").authWithPassword(email, password)
  return auth
}

export async function createRecord(collection: string, data: any) {
  const client = getPocketBase()
  return client.collection(collection).create(data)
}

export async function listRecords(collection: string, query?: string) {
  const client = getPocketBase()
  return client.collection(collection).getList(1, 50, { filter: query })
}

export async function getRecord(collection: string, id: string) {
  const client = getPocketBase()
  return client.collection(collection).getOne(id)
}

export async function updateRecord(collection: string, id: string, data: any) {
  const client = getPocketBase()
  return client.collection(collection).update(id, data)
}
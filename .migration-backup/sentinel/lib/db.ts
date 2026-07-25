import type { AuditEvent } from "./types";

interface AuditRecord {
  id: string;
  ts: number;
  sentinelOn: boolean;
  scenario: string;
  events: AuditEvent[];
}

const memoryLog: AuditRecord[] = [];

let replitDb: any = null;
async function getReplitDb(): Promise<any> {
  if (!process.env.REPLIT_DB_URL) return null;
  if (replitDb) return replitDb;
  try {
    const mod: any = await import("@replit/database");
    const Client = mod.default || mod;
    replitDb = new Client();
    return replitDb;
  } catch {
    return null;
  }
}

export async function appendAudit(record: Omit<AuditRecord, "id" | "ts"> & { id?: string }): Promise<void> {
  const full: AuditRecord = {
    id: record.id || `a_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    sentinelOn: record.sentinelOn,
    scenario: record.scenario,
    events: record.events,
  };
  const db = await getReplitDb();
  if (db) {
    try {
      await db.set(`audit:${full.id}`, full);
      return;
    } catch {
      // fall through to memory
    }
  }
  memoryLog.push(full);
  if (memoryLog.length > 500) memoryLog.shift();
}

export async function listAudit(limit = 50): Promise<AuditRecord[]> {
  const db = await getReplitDb();
  if (db) {
    try {
      const keys: string[] = await db.list("audit:");
      const items = await Promise.all(keys.slice(-limit).map((k) => db.get(k)));
      return items.filter(Boolean).sort((a: AuditRecord, b: AuditRecord) => b.ts - a.ts);
    } catch {
      // fall through
    }
  }
  return [...memoryLog].slice(-limit).reverse();
}

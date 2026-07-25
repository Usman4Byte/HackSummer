import type { AuditEvent } from "./types";

interface AuditRecord {
  id: string;
  ts: number;
  sentinelOn: boolean;
  scenario: string;
  events: AuditEvent[];
}

const memoryLog: AuditRecord[] = [];

export async function appendAudit(record: Omit<AuditRecord, "id" | "ts"> & { id?: string }): Promise<void> {
  const full: AuditRecord = {
    id: record.id || `a_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    sentinelOn: record.sentinelOn,
    scenario: record.scenario,
    events: record.events,
  };
  memoryLog.push(full);
  if (memoryLog.length > 500) memoryLog.shift();
}

export async function listAudit(limit = 50): Promise<AuditRecord[]> {
  return [...memoryLog].slice(-limit).reverse();
}

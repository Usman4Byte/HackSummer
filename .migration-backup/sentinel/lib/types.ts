export type ClaimLevel = "grounded" | "inference" | "speculation";

export interface Claim {
  text: string;
  level: ClaimLevel;
}

export interface FlaggedSpan {
  start: number;
  end: number;
  reason: string;
}

export interface ReadSource {
  source: string;
  content: string;
  flaggedSpans: FlaggedSpan[];
}

export type ToolDecision = "allowed" | "blocked";

export interface ToolAction {
  tool: string;
  target: string;
  payloadSummary: string;
  decision: ToolDecision;
  reason: string;
}

export type AuditKind = "read" | "attempt" | "decision";

export interface AuditEvent {
  ts: string;
  kind: AuditKind;
  detail: string;
}

export interface TrustReport {
  score: number;
  claims: Claim[];
  reads: ReadSource[];
  actions: ToolAction[];
  audit: AuditEvent[];
}

export interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  sentinelOn?: boolean;
  trust?: TrustReport;
  createdAt?: number;
}

export type Scenario = "injection" | "truth" | "free";

export interface RunRequest {
  prompt?: string;
  scenario?: Scenario;
  sentinelOn: boolean;
}

export interface RunResponse {
  answer: string;
  trust: TrustReport;
  scenario: Scenario;
}

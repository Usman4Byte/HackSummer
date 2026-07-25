import { NextRequest, NextResponse } from "next/server";
import { runTurn } from "@/lib/orchestrator";
import type { RunRequest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: RunRequest;
  try {
    body = (await req.json()) as RunRequest;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (typeof body.sentinelOn !== "boolean") {
    return NextResponse.json({ error: "sentinelOn required" }, { status: 400 });
  }
  if (!body.prompt && !body.scenario) {
    return NextResponse.json({ error: "prompt or scenario required" }, { status: 400 });
  }
  try {
    const result = await runTurn({
      prompt: body.prompt,
      scenario: body.scenario,
      sentinelOn: body.sentinelOn,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: "run_failed", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}

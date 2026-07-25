import { Router } from "express";
import { runTurn } from "../lib/sentinel/orchestrator";
import type { RunRequest } from "../lib/sentinel/types";

const router = Router();

router.post("/run", async (req, res) => {
  const body = req.body as RunRequest;

  if (typeof body.sentinelOn !== "boolean") {
    res.status(400).json({ error: "sentinelOn required" });
    return;
  }
  if (!body.prompt && !body.scenario) {
    res.status(400).json({ error: "prompt or scenario required" });
    return;
  }

  try {
    const result = await runTurn({
      prompt: body.prompt,
      scenario: body.scenario,
      sentinelOn: body.sentinelOn,
    });
    res.json(result);
  } catch (err: any) {
    req.log.error({ err }, "run_failed");
    res.status(500).json({ error: "run_failed", detail: String(err?.message || err) });
  }
});

export default router;

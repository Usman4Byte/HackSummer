<div align="center">

# ✦ Verity

### A trust layer for AI agents — chat with an agent you can actually verify.

Every answer is scored for confidence. Every source is scanned for injected instructions.
Every tool call passes through a firewall before it runs. Flip Verity off and watch the same
agent leak secrets and lie with total confidence — that's the point.

**Team The Sprinters** · Muhammad Usman · Laiqa Tahir · Haleema Salar

</div>

<br/>

## Why Verity

AI agents that read documents and call tools are only as trustworthy as the layer watching them.
Left unguarded, an agent will happily follow instructions hidden inside the content it reads, state
fabrications with total confidence, and hand secrets to whoever asks nicely. **Verity is that
watching layer** — three real, working subsystems sitting between the model and the world:

| Layer | What it actually does |
|---|---|
| 🛡️ **Input Shield** | Scans every fetched source for prompt-injection patterns — hidden instructions, fake system tokens, exfiltration language — and highlights the exact flagged span. |
| 🧱 **Action Firewall** | A deterministic policy engine. Every proposed tool call is checked against a domain allowlist, a secret-pattern detector, and a spend cap before it's allowed to run. |
| 📊 **Confidence Meter** | Breaks the agent's answer into claims and grades each one — grounded, inference, or speculation — painting the response so you can see what to trust at a glance. |

Toggle Verity **off** in the header and the same prompts go through with zero protection: the
planted fake key ships to `attacker.com`, and every claim gets rubber-stamped "confident"
regardless of whether it's true. That contrast *is* the demo.

<br/>

## See it in action

**Injection attack** — the agent reads a poisoned internal README with a hidden instruction
block telling it to exfiltrate an API key.

- **Verity ON** → Action Firewall blocks the outbound POST (`no-secrets-in-outbound-payload`), Input
  Shield highlights the injected `<!-- SYSTEM: ... -->` span in red, audit trail shows the block.
- **Verity OFF** → the fake key ships to `attacker.com`, no questions asked.

**Truth check** — four claims about Olympus Mons, one of them a quiet fabrication.

- **Verity ON** → the confidence map paints the true claims green, the shaky one amber, the
  fabricated one red, and lands a calibrated score around 55–65.
- **Verity OFF** → everything is painted green and "confident," fabrication included.

**Free chat** — ask anything. With a Gemini key configured, Verity gives a real answer and grades
every sentence live; without one, a deterministic fallback keeps the whole demo working offline.

<br/>

## Run it

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. Works immediately, with or without an API key.

### Optional: real LLM answers

Copy `.env.example` → `.env` and add a free [Gemini API key](https://aistudio.google.com/apikey):

```bash
GEMINI_API_KEY=your_key_here
LLM_MODEL=gemini-flash-lite-latest
```

Without a key, Verity falls back to a deterministic local engine — every feature, including free
chat, still works end-to-end. The two demo scenarios are deterministic on purpose either way, so
they reliably reproduce the block and the fabrication on every run.

<br/>

## Deploy on Replit

1. **Import from GitHub** (or upload this folder) into a new Repl — `.replit` / `replit.nix`
   provision Node 20 automatically.
2. Add `GEMINI_API_KEY` under the Repl's **Secrets** tab (optional).
3. Hit **Run** — builds with `npm ci && npm run build`, serves with `npm run start` bound to the
   Replit-assigned `$PORT`.
4. Click **Deploy → Autoscale** for a stable public URL.

Audit records persist to Replit DB automatically when `REPLIT_DB_URL` is present; otherwise an
in-memory ring buffer keeps the session going locally.

<br/>

## How it's built

One Next.js (App Router + TypeScript) app — React frontend and API routes together, no separate
backend, no external database.

```
app/
  layout.tsx, page.tsx     UI shell + chat state
  globals.css              glass tokens, gradients, keyframes
  api/run/route.ts         POST { prompt | scenario, sentinelOn } → TrustReport
components/
  Header, Composer, WelcomeHero, TypingIndicator
  MessageBubble            user + agent bubble, expander, blocked alert
  TrustGauge, ClaimSpan, BlockedAlert
  InputShieldPanel, ActionFirewallPanel, AuditTrailPanel
lib/
  types.ts                 shared TrustReport contract
  llm.ts                   provider-agnostic callLLM() → Gemini REST
  inputShield.ts           regex-based injection scan → flaggedSpans
  firewall.ts              per-tool-call { allow, reason, rule }
  confidence.ts            single-call claim decomposition + grading
  agent.ts                 demo agent: proposes tool calls + raw/safe answers
  orchestrator.ts          runs the full pipeline, returns TrustReport
  fixtures.ts              poisoned README, planted fake secret, canned claims
  db.ts                    Replit DB with in-memory fallback
```

### Data contract

```ts
Message  { id, role, text, sentinelOn?, trust?: TrustReport }
TrustReport {
  score: number
  claims:  { text, level: 'grounded'|'inference'|'speculation' }[]
  reads:   { source, content, flaggedSpans: {start,end,reason}[] }[]
  actions: { tool, target, payloadSummary, decision: 'allowed'|'blocked', reason }[]
  audit:   { ts, kind: 'read'|'attempt'|'decision', detail }[]
}
```

### Design principles

- No `localStorage`, no separate Express server, no external DB.
- The Action Firewall is fully deterministic — it blocks the exfiltration reliably whether or not
  the LLM is reachable.
- The toggle, expanders, scenario chips, and free chat all hit a real backend and render live
  results — nothing on screen is hard-coded UI state.
- Keyboard-operable toggle and expanders, color paired with text labels, responsive down to mobile.

<br/>

<div align="center">

Built for HackSummer by **The Sprinters**
Muhammad Usman · Laiqa Tahir · Haleema Salar

</div>

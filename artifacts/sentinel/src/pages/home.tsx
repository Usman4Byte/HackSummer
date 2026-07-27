import { useCallback, useMemo, useRef, useState } from "react";
import { Header } from "@/components/verity/Header";
import { Sidebar } from "@/components/verity/Sidebar";
import { WelcomeHero } from "@/components/verity/WelcomeHero";
import { Composer } from "@/components/verity/Composer";
import { MessageBubble } from "@/components/verity/MessageBubble";
import { TypingIndicator } from "@/components/verity/TypingIndicator";
import type { Message, RunResponse, Scenario } from "@/lib/types";

export default function Home() {
  const [sentinelOn, setSentinelOn] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState<Scenario | null>(null);
  // Open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" && window.innerWidth >= 1024
  );
  const scrollAnchor = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () =>
    requestAnimationFrame(() =>
      scrollAnchor.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    );

  const run = useCallback(
    async (input: { prompt?: string; scenario?: Scenario }) => {
      const userText = input.prompt ?? scenarioPrompt(input.scenario!);
      const userMsg: Message = {
        id: "u_" + Date.now(),
        role: "user",
        text: userText,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setThinking(input.scenario ?? "free");
      scrollToBottom();
      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: input.prompt,
            scenario: input.scenario,
            sentinelOn,
          }),
        });
        if (!res.ok) throw new Error("run_failed_" + res.status);
        const data: RunResponse = await res.json();
        const agentMsg: Message = {
          id: "a_" + Date.now(),
          role: "agent",
          text: data.answer,
          sentinelOn,
          trust: data.trust,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, agentMsg]);
      } catch {
        const agentMsg: Message = {
          id: "a_err_" + Date.now(),
          role: "agent",
          text: "The agent hit an error. Please try again.",
          sentinelOn,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, agentMsg]);
      } finally {
        setThinking(null);
        scrollToBottom();
      }
    },
    [sentinelOn]
  );

  // Derive live session stats for the sidebar
  const stats = useMemo(() => {
    const agentMsgs = messages.filter((m) => m.role === "agent" && m.trust);
    const scores = agentMsgs.map((m) => m.trust!.score);
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;
    const blockedActions = agentMsgs
      .flatMap((m) => m.trust!.actions)
      .filter((a) => a.decision === "blocked").length;
    const injectionsFound = agentMsgs
      .flatMap((m) => m.trust!.reads)
      .filter((r) => r.flaggedSpans && r.flaggedSpans.length > 0).length;
    return {
      totalQueries: messages.filter((m) => m.role === "user").length,
      avgScore,
      blockedActions,
      injectionsFound,
    };
  }, [messages]);

  // Derive activity feed for the sidebar
  const activity = useMemo(() => {
    type EventKind = "sent" | "blocked" | "injection" | "scored" | "clean";
    const events: Array<{ kind: EventKind; label: string; ts: number }> = [];
    for (const msg of messages) {
      if (msg.role === "user") {
        events.push({
          kind: "sent",
          label: msg.text.length > 42 ? msg.text.slice(0, 42) + "…" : msg.text,
          ts: msg.createdAt ?? Date.now(),
        });
      } else if (msg.trust) {
        const blocked = msg.trust.actions.filter((a) => a.decision === "blocked");
        const injections = msg.trust.reads.filter(
          (r) => r.flaggedSpans && r.flaggedSpans.length > 0
        );
        if (injections.length > 0) {
          events.push({
            kind: "injection",
            label: `Injection in: ${injections[0].source}`,
            ts: msg.createdAt ?? Date.now(),
          });
        }
        if (blocked.length > 0) {
          events.push({
            kind: "blocked",
            label: `Blocked: ${blocked[0].tool} → ${blocked[0].target}`,
            ts: msg.createdAt ?? Date.now(),
          });
        }
        events.push({
          kind: msg.trust.score >= 70 ? "scored" : "clean",
          label: `Score ${msg.trust.score}/100 · ${msg.trust.claims.length} claims`,
          ts: msg.createdAt ?? Date.now(),
        });
      }
    }
    return events.reverse().slice(0, 10);
  }, [messages]);

  return (
    <div className="relative z-[1] flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        stats={stats}
        activity={activity}
        sentinelOn={sentinelOn}
      />

      {/* Main area — offset on large screens to account for sidebar */}
      <div className="flex min-h-screen flex-1 flex-col transition-all duration-300 lg:ml-[272px]">
        <Header
          sentinelOn={sentinelOn}
          onToggle={() => setSentinelOn((v) => !v)}
          onMenuOpen={() => setSidebarOpen((v) => !v)}
        />

        <main className="flex flex-1 justify-center px-3 pb-[210px] pt-4 sm:px-5 sm:pb-[220px] sm:pt-6">
          <div className="flex w-full max-w-[820px] flex-col gap-4 sm:gap-5">
            {messages.length === 0 && <WelcomeHero />}
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {thinking && (
              <TypingIndicator
                label={sentinelOn ? "Governing agent" : "Raw agent responding"}
              />
            )}
            <div ref={scrollAnchor} />
          </div>
        </main>

        <Composer
          sentinelOn={sentinelOn}
          busy={thinking !== null}
          onSend={(text) => run({ prompt: text })}
          onScenario={(kind) => run({ scenario: kind })}
          onClear={() => setMessages([])}
        />
      </div>
    </div>
  );
}

function scenarioPrompt(kind: Scenario): string {
  if (kind === "injection") return "Read the internal README and summarize deployment steps.";
  if (kind === "truth") return "Give me four interesting facts about Olympus Mons.";
  return "";
}

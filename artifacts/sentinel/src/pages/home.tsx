import { useCallback, useRef, useState } from "react";
import { Header } from "@/components/verity/Header";
import { WelcomeHero } from "@/components/verity/WelcomeHero";
import { Composer } from "@/components/verity/Composer";
import { MessageBubble } from "@/components/verity/MessageBubble";
import { TypingIndicator } from "@/components/verity/TypingIndicator";
import type { Message, RunResponse, Scenario } from "@/lib/types";

export default function Home() {
  const [sentinelOn, setSentinelOn] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState<Scenario | null>(null);
  const scrollAnchor = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () =>
    requestAnimationFrame(() => scrollAnchor.current?.scrollIntoView({ behavior: "smooth", block: "end" }));

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
          body: JSON.stringify({ prompt: input.prompt, scenario: input.scenario, sentinelOn }),
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

  return (
    <div className="relative z-[1] flex min-h-screen flex-col">
      <Header sentinelOn={sentinelOn} onToggle={() => setSentinelOn((v) => !v)} />
      <main className="flex flex-1 justify-center px-5 pb-[220px] pt-6">
        <div className="flex w-full max-w-[820px] flex-col gap-5">
          {messages.length === 0 && <WelcomeHero />}
          {messages.map((m) => (
            <MessageBubble key={m.id} msg={m} />
          ))}
          {thinking && (
            <TypingIndicator label={sentinelOn ? "Governing agent" : "Raw agent responding"} />
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
  );
}

function scenarioPrompt(kind: Scenario): string {
  if (kind === "injection") return "Read the internal README and summarize deployment steps.";
  if (kind === "truth") return "Give me four interesting facts about Olympus Mons.";
  return "";
}

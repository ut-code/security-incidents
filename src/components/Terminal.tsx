import { useState } from "react";
import { runCommand } from "../lib/command";
import { useGame } from "../lib/GameContext";
import { CommandCode } from "./CommandCode";

export function Terminal() {
  const { state, dispatch } = useGame();
  const [input, setInput] = useState("");
  const [inputScroll, setInputScroll] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const execute = (raw = input) => {
    const result = runCommand(raw, state);
    result.state.history = [...state.history, raw];
    dispatch({ type: "COMMAND", state: result.state });
    if (raw.trim() === "clear") setLines([]);
    else setLines((current) => [...current, `$ ${raw}`, result.output].filter(Boolean).slice(-14));
    setInput("");
  };

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded border border-slate-700 bg-[#050c12]">
      <div className="flex shrink-0 items-center justify-between bg-slate-900 px-4 py-3 font-mono text-[11px] tracking-wider text-slate-400">
        <span className="text-emerald-400">● ● ●</span>
        <span>operator@komaba:~</span>
        <span>03:11:{String(50 + Math.floor(state.clock)).slice(-2)}</span>
      </div>
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 font-mono text-[13px] leading-[1.65] text-slate-200"
        aria-live="polite"
      >
        {lines.map((line, index) => (
          <pre
            key={index}
            className={`m-0 whitespace-pre-wrap font-[inherit] ${line.startsWith("$") ? "mt-3 text-lime-300" : ""}`}
          >
            {line.startsWith("$ ") ? (
              <>
                $ <CommandCode command={line.slice(2)} />
              </>
            ) : (
              line
            )}
          </pre>
        ))}
        <form
          className="mt-2 shrink-0 pt-2 text-lime-300"
          onSubmit={(event) => {
            event.preventDefault();
            execute();
          }}
        >
          <label className="flex min-w-0 items-center gap-1">
            <span className="shrink-0">$</span>
            <span className="relative block h-[1.65em] min-w-0 flex-1 overflow-hidden">
              <pre
                className="pointer-events-none relative m-0 w-max min-w-full whitespace-pre font-[inherit] leading-[inherit]"
                aria-hidden="true"
                style={{ transform: `translateX(-${inputScroll}px)` }}
              >
                {input ? (
                  <CommandCode command={input} />
                ) : (
                  <span className="text-slate-500">コマンドを入力…</span>
                )}
              </pre>
              <input
                className="absolute inset-0 h-full w-full border-0 bg-transparent p-0 font-[inherit] leading-[inherit] text-transparent caret-lime-300 outline-none selection:bg-lime-300/30 selection:text-transparent"
                autoFocus
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onScroll={(event) => setInputScroll(event.currentTarget.scrollLeft)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setInput(state.history.at(-1) ?? "");
                  }
                  if (event.key === "Tab") {
                    event.preventDefault();
                    const command = ["help", "hint", "nmap", "curl", "for", "rm", "clear"].find(
                      (item) => item.startsWith(input),
                    );
                    if (command) setInput(command);
                  }
                }}
                aria-label="コマンド入力"
                autoCapitalize="off"
                autoComplete="off"
                spellCheck={false}
              />
            </span>
          </label>
        </form>
      </div>
    </section>
  );
}

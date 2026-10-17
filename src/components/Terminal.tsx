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
    <section className="terminal flex min-h-[32rem] flex-col">
      <div className="termTop">
        <span>● ● ●</span>
        <span>operator@komaba:~</span>
        <span>03:11:{String(50 + Math.floor(state.clock)).slice(-2)}</span>
      </div>
      <div className="termBody flex-1 overflow-hidden" aria-live="polite">
        {lines.map((line, index) => (
          <pre key={index} className={line.startsWith("$") ? "command" : ""}>
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
          onSubmit={(event) => {
            event.preventDefault();
            execute();
          }}
        >
          <label className="terminalInputLine">
            <span>$ </span>
            <span className="terminalInputWrapper">
              <pre
                className="terminalInputSyntax"
                aria-hidden="true"
                style={{ transform: `translateX(-${inputScroll}px)` }}
              >
                {input ? (
                  <CommandCode command={input} />
                ) : (
                  <span className="terminalPlaceholder">コマンドを入力…</span>
                )}
              </pre>
              <input
                className="terminalInputField"
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

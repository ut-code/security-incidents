import { useState } from "react";
import { instructions } from "../lib/content";
import { CommandCode } from "./CommandCode";
import { RootLink } from "./RootLink";

export function InstructionPanel() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [activeHelp, setActiveHelp] = useState<number | null>(null);
  const instruction = instructions[page];
  const changePage = (nextPage: number) => {
    setPage(nextPage);
    setSelected(false);
    setCopied(null);
    setActiveHelp(null);
  };
  return (
    <aside className="flex min-h-0 flex-col gap-3 overflow-hidden rounded border border-slate-700 bg-gradient-to-br from-[#12232e] to-[#0c1821] p-4 text-slate-100 md:p-5">
      <div className="font-mono text-[11px] uppercase tracking-[0.11em] text-lime-300">
        OPERATOR GUIDE
      </div>
      <h2 className="text-xl font-semibold">調査手順書</h2>
      <p className="m-0 text-xs leading-relaxed text-slate-400">
        ステージごとの手順を確認して、ターミナルでコマンドを実行してください。
      </p>
      <nav className="flex items-center gap-2" aria-label="ステージ選択">
        {instructions.map((item, index) => (
          <button
            key={item.title}
            type="button"
            aria-current={page === index ? "page" : undefined}
            className={`border border-slate-600 bg-slate-800 px-2 py-1 font-mono text-xs text-slate-200 hover:bg-slate-700 ${page === index ? "underline underline-offset-4" : ""}`}
            onClick={() => changePage(index)}
          >
            0{index + 1}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-slate-400">
          {page + 1} / {instructions.length}
        </span>
      </nav>
      <article
        className={`min-h-0 rounded border p-3 transition-colors ${selected ? "border-lime-300 bg-emerald-950/40 shadow-[inset_3px_0_0_0_#b7f36b]" : "border-slate-700 bg-slate-950/50"}`}
      >
        <button
          type="button"
          className="block w-full bg-transparent p-0 text-left"
          aria-pressed={selected}
          onClick={() => setSelected((value) => !value)}
        >
          <span className="flex items-center gap-2 font-semibold">
            <span className="font-mono text-xs text-slate-500">0{page + 1}</span>
            <strong className="text-sm">{instruction.title}</strong>
          </span>
          <span className="mt-3 block text-sm leading-6 text-slate-300">{instruction.goal}</span>
        </button>
        <div className="mt-3 grid gap-2">
          {instruction.commands.map(({ text: command, description }, index) => (
            <div
              className="relative grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-2"
              key={command}
            >
              <code className="min-w-0 whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed text-slate-200">
                <CommandCode command={command} />
              </code>
              <button
                type="button"
                className="h-6 w-6 rounded-full border border-slate-600 bg-slate-800 p-0 text-xs text-lime-300 hover:bg-slate-700"
                aria-expanded={activeHelp === index}
                aria-label="コマンドの説明を表示"
                onClick={() => setActiveHelp(activeHelp === index ? null : index)}
              >
                ?
              </button>
              {activeHelp === index && (
                <div
                  className="absolute right-0 top-full z-20 mt-1 w-72 max-w-[85vw] rounded border border-slate-500 bg-slate-800 p-3 text-xs leading-relaxed text-slate-100 shadow-xl"
                  role="tooltip"
                >
                  {description}
                </div>
              )}
              <button
                type="button"
                className="whitespace-nowrap rounded border border-slate-600 bg-slate-800 px-2 py-1 text-[10px] text-slate-200 hover:bg-slate-700"
                aria-label="コマンドをクリップボードにコピー"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(command);
                    setCopied(index);
                    window.setTimeout(() => setCopied(null), 1500);
                  } catch {
                    setCopied(null);
                  }
                }}
              >
                {copied === index ? "コピー済み" : "コピー"}
              </button>
            </div>
          ))}
        </div>
      </article>
      <div className="mt-auto flex justify-between gap-3 pt-3">
        <button
          className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          disabled={page === 0}
          onClick={() => changePage(page - 1)}
        >
          ← 前へ
        </button>
        <button
          className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          disabled={page === instructions.length - 1}
          onClick={() => changePage(page + 1)}
        >
          次へ →
        </button>
      </div>
      <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
        <kbd className="rounded border border-slate-600 px-1.5 py-0.5 text-slate-200">help</kbd>{" "}
        コマンド一覧 <span>·</span>{" "}
        <kbd className="rounded border border-slate-600 px-1.5 py-0.5 text-slate-200">hint</kbd>{" "}
        追加ヒント
      </div>
      <RootLink />
    </aside>
  );
}

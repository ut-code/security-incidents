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
    <aside className="instructionPanel">
      <div className="eyebrow">OPERATOR GUIDE</div>
      <h2 className="mb-2 mt-2 text-xl font-semibold">調査手順書</h2>
      <p className="instructionIntro">
        ステージごとの手順を確認して、ターミナルでコマンドを実行してください。
      </p>
      <nav className="instructionPager" aria-label="ステージ選択">
        {instructions.map((item, index) => (
          <button
            key={item.title}
            type="button"
            aria-current={page === index ? "page" : undefined}
            onClick={() => changePage(index)}
          >
            0{index + 1}
          </button>
        ))}
        <span>
          {page + 1} / {instructions.length}
        </span>
      </nav>
      <article className={`instructionDocument ${selected ? "selected" : ""}`}>
        <button
          type="button"
          className="instructionExplanation"
          aria-pressed={selected}
          onClick={() => setSelected((value) => !value)}
        >
          <span className="instructionStageHeading">
            <span className="stageNumber">0{page + 1}</span>
            <strong>{instruction.title}</strong>
          </span>
          <span className="instructionGoal">{instruction.goal}</span>
        </button>
        <div className="commandExamples">
          {instruction.commands.map(({ text: command, description }, index) => (
            <div className="instructionCommand" key={command}>
              <code>
                <CommandCode command={command} />
              </code>
              <button
                type="button"
                className="commandHelpButton"
                aria-expanded={activeHelp === index}
                aria-label="コマンドの説明を表示"
                onClick={() => setActiveHelp(activeHelp === index ? null : index)}
              >
                ?
              </button>
              {activeHelp === index && (
                <div className="commandHelpPopover" role="tooltip">
                  {description}
                </div>
              )}
              <button
                type="button"
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
      <div className="instructionPageControls">
        <button type="button" disabled={page === 0} onClick={() => changePage(page - 1)}>
          ← 前へ
        </button>
        <button
          type="button"
          disabled={page === instructions.length - 1}
          onClick={() => changePage(page + 1)}
        >
          次へ →
        </button>
      </div>
      <div className="instructionHelp">
        <kbd>help</kbd> コマンド一覧 <span>·</span> <kbd>hint</kbd> 追加ヒント
      </div>
      <RootLink />
    </aside>
  );
}

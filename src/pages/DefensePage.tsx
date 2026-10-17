import { useMemo, useState } from "react";
import { formatLog, makeLogs } from "../lib/logs";
import { outcome } from "../lib/outcome";
import { useGame } from "../lib/GameContext";
import { responseCards, stageText } from "../lib/content";
import { SafetyNotice } from "../components/SafetyNotice";
import { RootLink } from "../components/RootLink";

const cardScopes: Record<string, string> = {
  "block-ip": "全リクエスト",
  "disable-staff": "スタッフ認証",
  "fix-env": "設定・認証情報",
  "fix-orders-auth": "注文API",
  "restrict-admin": "管理画面",
  "admin-mfa": "管理者認証",
  "limit-download": "データ持ち出し",
};

export function DefensePage() {
  const { state, dispatch } = useGame();
  const [search, setSearch] = useState("");
  const [evidence, setEvidence] = useState<number[]>([]);
  const [explanation, setExplanation] = useState("");
  const logSet = useMemo(() => makeLogs(state.logs), [state.logs]);
  const visibleLogs = useMemo(
    () =>
      logSet
        .map((log, index) => ({ log, index }))
        .filter(
          ({ log }) =>
            !search || formatLog(log).toLowerCase().includes(search.trim().toLowerCase()),
        ),
    [logSet, search],
  );
  const result = outcome(state);

  return (
    <main className="shell defense">
      <header>
        <div className="brand">
          KOMABA MARKET <span>SECURITY LAB / 02</span>
        </div>
        <div className="step">
          INCIDENT RESPONSE <b>{evidence.length} EVIDENCE</b>
        </div>
        <RootLink />
      </header>
      <SafetyNotice />
      <div className="defenseHead">
        <div>
          <div className="eyebrow">INCIDENT TIMELINE · 01 NOV 2026</div>
          <h2>アクセスログを調査する</h2>
        </div>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-3 border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">
        <input
          type="search"
          className="min-w-0 flex-1 border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-slate-100 placeholder:text-slate-500 focus:outline focus:outline-lime-300"
          placeholder="ログ文字列を検索"
          aria-label="ログ文字列を検索"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search && (
          <button
            className="rounded bg-slate-700 px-3 py-2 text-slate-100 hover:bg-slate-600"
            onClick={() => setSearch("")}
          >
            クリア
          </button>
        )}
        <span className="whitespace-nowrap">
          表示 {visibleLogs.length} / {logSet.length} 行
        </span>
      </div>
      <div className="logTable">
        <div className="logHeader">TIME / SOURCE · REQUEST · STATUS</div>
        {visibleLogs.map(({ log, index }) => (
          <button
            className={`logRow ${evidence.includes(index) ? "selected" : ""}`}
            key={`${index}-${log.time}`}
            onClick={() =>
              setEvidence((items) =>
                items.includes(index) ? items.filter((item) => item !== index) : [...items, index],
              )
            }
          >
            <span className="logTime">
              03:{String(Math.floor(log.time / 60)).padStart(2, "0")}:
              {String(log.time % 60).padStart(2, "0")}
            </span>
            <span className="logContent">{formatLog(log)}</span>
            <b className={log.status === 200 ? "ok" : "bad"}>{log.status}</b>
            {evidence.includes(index) && (
              <select
                aria-label="ステージを選択"
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  if (+event.target.value === log.stage) setExplanation(stageText[log.stage]);
                  else {
                    dispatch({ type: "WRONG" });
                    setExplanation("ステージが違います。時刻・送信元・パスを確認してください。");
                  }
                }}
              >
                <option value="">stage?</option>
                {[1, 2, 3, 4, 5].map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            )}
          </button>
        ))}
      </div>
      {explanation && (
        <p className="my-3 rounded border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200">
          {explanation}
        </p>
      )}
      <aside className="cards">
        <div>
          <div className="eyebrow">RESPONSE PLAYBOOK</div>
          <h3>対応カード</h3>
        </div>
        <div className="cardGrid">
          {responseCards.map(([id, label]) => (
            <button
              key={id}
              disabled={state.cards.includes(id)}
              onClick={() => dispatch({ type: "CARD", id })}
            >
              <span>{label}</span>
              <small>{cardScopes[id]}</small>
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-300">
          現在の評価: {result.score}点 · {result.rank}ランク · 流出 {result.leaked.toLocaleString()}{" "}
          件
        </p>
      </aside>
      <SafetyNotice />
    </main>
  );
}

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
    <main className="min-h-screen w-full bg-[#07111c] px-4 py-6 text-slate-100 md:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-4">
        <div className="font-mono text-sm font-medium tracking-[0.11em]">
          KOMABA MARKET <span className="ml-3 text-[10px] text-slate-500">SECURITY LAB / 02</span>
        </div>
        <div className="font-mono text-[11px] tracking-wider text-slate-400">
          INCIDENT RESPONSE <b className="ml-2 text-lime-300">{evidence.length} EVIDENCE</b>
        </div>
        <RootLink />
      </header>
      <div className="pb-14">
        <div className="mb-4 mt-7">
          <div className="font-mono text-[11px] tracking-[0.11em] text-lime-300">
            INCIDENT TIMELINE · 01 NOV 2026
          </div>
          <h2 className="my-2 text-2xl font-semibold">アクセスログを調査する</h2>
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
        <div className="h-[390px] overflow-auto rounded border border-slate-700 bg-[#08121b]">
          <div className="sticky top-0 bg-slate-800 px-3 py-2 font-mono text-[10px] tracking-wider text-slate-400">
            TIME / SOURCE · REQUEST · STATUS
          </div>
          {visibleLogs.map(({ log, index }) => (
            <div
              className={`flex w-full items-center gap-3 border-b border-slate-800 px-3 py-2 font-mono text-[10px] ${evidence.includes(index) ? "bg-slate-800" : "bg-transparent hover:bg-slate-900"}`}
              key={`${index}-${log.time}`}
            >
              <button
                className="flex min-w-0 flex-1 items-center gap-3 bg-transparent p-0 text-left text-slate-300"
                aria-pressed={evidence.includes(index)}
                onClick={() =>
                  setEvidence((items) =>
                    items.includes(index)
                      ? items.filter((item) => item !== index)
                      : [...items, index],
                  )
                }
              >
                <span className="min-w-[55px] text-slate-500">
                  03:{String(Math.floor(log.time / 60)).padStart(2, "0")}:
                  {String(log.time % 60).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {formatLog(log)}
                </span>
                <b className={log.status === 200 ? "text-lime-300" : "text-red-400"}>
                  {log.status}
                </b>
              </button>
              {evidence.includes(index) && (
                <select
                  className="shrink-0 border border-slate-600 bg-slate-800 px-2 py-1 text-slate-100"
                  aria-label="ステージを選択"
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
            </div>
          ))}
        </div>
        {explanation && (
          <p className="my-3 rounded border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200">
            {explanation}
          </p>
        )}
        <aside className="mt-5 border border-slate-700 bg-slate-900 p-5">
          <div className="font-mono text-[11px] tracking-[0.11em] text-lime-300">
            RESPONSE PLAYBOOK
          </div>
          <h3 className="mb-4 mt-2 text-lg font-semibold">対応カード</h3>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {responseCards.map(([id, label]) => (
              <button
                className="rounded border border-slate-600 bg-slate-800 p-3 text-left text-sm text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                key={id}
                disabled={state.cards.includes(id)}
                onClick={() => dispatch({ type: "CARD", id })}
              >
                <span className="block font-medium">{label}</span>
                <small className="mt-2 block text-[10px] text-slate-400">{cardScopes[id]}</small>
              </button>
            ))}
          </div>
          <p className="mb-0 mt-4 text-sm text-slate-300">
            現在の評価: {result.score}点 · {result.rank}ランク · 流出{" "}
            {result.leaked.toLocaleString()} 件
          </p>
        </aside>
      </div>
      <SafetyNotice />
    </main>
  );
}

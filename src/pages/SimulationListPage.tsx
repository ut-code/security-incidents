import { Link } from "react-router-dom";
import { useGame } from "../lib/GameContext";
import { SafetyNotice } from "../components/SafetyNotice";

const simulations = [
  {
    id: "1",
    title: "駒場マーケット",
    summary: "公開設定ファイルからの認証情報漏えいと、注文APIの認可不備を追跡する。",
  },
];

export function SimulationListPage() {
  const { dispatch } = useGame();
  return (
    <main className="hero">
      <div className="brand">
        KOMABA MARKET <span>SECURITY LAB / 01</span>
      </div>
      <Link
        className="mt-6 inline-block w-fit text-sm text-slate-400 underline underline-offset-4 hover:text-white"
        to="/"
      >
        ← ホームへ戻る
      </Link>
      <div className="heroBody">
        <div className="eyebrow">INCIDENT RESPONSE SIMULATION</div>
        <h1>
          そのログに、
          <br />
          <em>気づけるか。</em>
        </h1>
        <p>シミュレーションを選び、攻撃または防御の視点からインシデントを体験します。</p>
        <div className="mt-8 grid gap-4">
          {simulations.map((simulation, index) => (
            <article
              className="rounded border border-slate-700 bg-slate-900/80 p-5"
              key={simulation.id}
            >
              <div className="eyebrow">SIMULATION {index + 1}</div>
              <h2 className="my-2 text-xl font-semibold">{simulation.title}</h2>
              <p className="m-0 text-sm leading-6 text-slate-300">{simulation.summary}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  className="rounded bg-lime-300 px-4 py-3 text-left font-semibold text-slate-950 hover:bg-lime-200"
                  onClick={() =>
                    dispatch({ type: "START", mode: "attack", simulationId: simulation.id })
                  }
                >
                  攻撃 <small className="mt-1 block font-normal">コマンドで攻撃を体験</small>
                </button>
                <button
                  className="rounded border border-slate-600 bg-slate-800 px-4 py-3 text-left font-semibold text-slate-100 hover:bg-slate-700"
                  onClick={() =>
                    dispatch({ type: "START", mode: "defense", simulationId: simulation.id })
                  }
                >
                  防御 <small className="mt-1 block font-normal">全ログを検索して対応</small>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <footer>TRAINING SIMULATION · NO REAL NETWORK ACTIVITY</footer>
      <SafetyNotice />
    </main>
  );
}

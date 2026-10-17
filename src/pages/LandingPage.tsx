import { Link } from "react-router-dom";
import { SafetyNotice } from "../components/SafetyNotice";

export function LandingPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#07111c] px-6 py-7 text-slate-100 md:px-14 md:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 -top-48 -z-10 size-[38rem] rounded-full bg-lime-300/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-64 -left-40 -z-10 size-[34rem] rounded-full bg-cyan-300/10 blur-[120px]"
      />
      <header className="flex items-center justify-between border-b border-white/10 pb-5">
        <div className="font-mono text-sm font-semibold tracking-[0.18em] text-lime-200">
          KOMABA <span className="text-slate-100">// INCIDENT LAB</span>
        </div>
        <div className="hidden font-mono text-[10px] tracking-[0.16em] text-slate-500 sm:block">
          OFFLINE SECURITY SIMULATION · 2026
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center py-16">
        <div className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.24em] text-lime-300">
          <span className="h-px w-10 bg-lime-300" />
          Learn the incident. Change the outcome.
        </div>
        <h1 className="max-w-5xl text-5xl font-black leading-[1.08] tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl">
          攻撃を知り、
          <br />
          <span className="text-lime-300">守りを学ぶ。</span>
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
          架空のECサイト「駒場マーケット」で起きたインシデントを体験。攻撃者として手口を追うか、運営者としてログから被害を食い止めるか。
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Link
            to="/simulations"
            className="inline-flex items-center gap-8 rounded bg-lime-300 px-6 py-4 font-bold text-slate-950 transition hover:bg-lime-200"
          >
            シミュレーションを選ぶ <span aria-hidden="true">→</span>
          </Link>
          <span className="font-mono text-xs text-slate-500">NO REAL NETWORK ACTIVITY</span>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 font-mono text-[10px] tracking-[0.16em] text-slate-500">
        <span>KOMABA MARKET SECURITY TRAINING</span>
        <span>ATTACK · DETECT · RESPOND</span>
      </footer>
      <SafetyNotice />
    </main>
  );
}

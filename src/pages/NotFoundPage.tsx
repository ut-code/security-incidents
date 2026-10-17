import { Link } from "react-router-dom";
import { SafetyNotice } from "../components/SafetyNotice";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#07111c] px-6 py-7 text-slate-100 md:px-12">
      <div className="font-mono text-sm font-medium tracking-[0.11em]">
        KOMABA MARKET <span className="ml-3 text-[10px] text-slate-500">PAGE NOT FOUND</span>
      </div>
      <div className="flex flex-1 flex-col justify-center py-12">
        <div className="font-mono text-[11px] tracking-wider text-lime-300">ERROR · 404</div>
        <h1 className="my-6 text-5xl font-black leading-tight tracking-[-0.06em] text-white sm:text-7xl">
          ページが
          <br />
          <em>見つかりません。</em>
        </h1>
        <p className="max-w-xl text-base leading-7 text-slate-300">
          指定されたページは存在しないか、移動した可能性があります。
        </p>
        <Link
          className="mt-5 inline-block font-bold text-lime-300 underline underline-offset-4"
          to="/"
        >
          タイトル画面へ戻る →
        </Link>
      </div>
      <footer className="mt-auto border-t border-white/10 pt-4 font-mono text-[10px] tracking-wider text-slate-500">
        KOMABA MARKET · SECURITY LAB
      </footer>
      <SafetyNotice />
    </main>
  );
}

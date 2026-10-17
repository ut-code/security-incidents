import { Link } from "react-router-dom";
import { SafetyNotice } from "../components/SafetyNotice";

export function NotFoundPage() {
  return (
    <main className="hero">
      <div className="brand">
        KOMABA MARKET <span>PAGE NOT FOUND</span>
      </div>
      <div className="heroBody">
        <div className="eyebrow">ERROR · 404</div>
        <h1>
          ページが
          <br />
          <em>見つかりません。</em>
        </h1>
        <p>指定されたページは存在しないか、移動した可能性があります。</p>
        <Link className="mt-5 inline-block font-bold text-[#b7f36b]" to="/">
          タイトル画面へ戻る →
        </Link>
      </div>
      <footer>KOMABA MARKET · SECURITY LAB</footer>
      <SafetyNotice />
    </main>
  );
}

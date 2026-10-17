import { Link } from "react-router-dom";
import { useGame } from "../lib/GameContext";

export function RootLink() {
  const { dispatch } = useGame();
  return (
    <Link
      className="inline-block text-xs text-slate-400 underline underline-offset-4 transition hover:text-white"
      to="/"
      onClick={() => dispatch({ type: "RESET" })}
    >
      ← タイトルへ戻る
    </Link>
  );
}

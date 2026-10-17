import { Link } from "react-router-dom";
import { useGame } from "../lib/GameContext";

export function RootLink() {
  const { dispatch } = useGame();
  return (
    <Link className="rootLink" to="/" onClick={() => dispatch({ type: "RESET" })}>
      ← タイトルへ戻る
    </Link>
  );
}

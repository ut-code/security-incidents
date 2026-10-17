import type { GameState } from "./types";

const stopsAtStage: Record<string, number> = {
  "block-ip": 1,
  "disable-staff": 2,
  "fix-env": 1,
  "fix-orders-auth": 3,
  "restrict-admin": 4,
  "admin-mfa": 4,
  "limit-download": 5,
};

export function outcome(state: GameState) {
  const firstStoppedStage = Math.min(
    ...state.cards.map((id) => stopsAtStage[id] ?? Number.POSITIVE_INFINITY),
  );
  const reached = state.cards.length ? Math.min(state.stage, firstStoppedStage - 1) : state.stage;
  const leaked = reached <= 2 || reached === 4 ? 0 : reached === 3 ? 50 : 12_480;
  const penalty = reached <= 2 ? 0 : reached === 3 ? 20 : reached === 4 ? 40 : 70;
  const score = Math.max(0, 100 - penalty - state.wrongAnswers * 5 - state.hintCount * 5);

  return {
    score,
    rank: score >= 90 ? "S" : score >= 70 ? "A" : score >= 50 ? "B" : "C",
    leaked,
    ending:
      reached === 4
        ? "管理画面乗っ取り"
        : leaked === 0
          ? "未遂"
          : leaked === 12_480
            ? "全件流出"
            : "一部流出",
  };
}

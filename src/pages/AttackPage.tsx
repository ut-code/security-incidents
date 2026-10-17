import { InstructionPanel } from "../components/InstructionPanel";
import { SafetyNotice } from "../components/SafetyNotice";
import { Terminal } from "../components/Terminal";
import { useGame } from "../lib/GameContext";

export function AttackPage() {
  const { state } = useGame();
  return (
    <main className="shell attackScreen h-screen max-w-none overflow-hidden p-4 md:p-8">
      <div className="grid h-[calc(100%-4rem)] min-h-0 grid-cols-[minmax(260px,0.36fr)_minmax(0,0.64fr)] items-stretch gap-4 max-[760px]:grid-cols-1">
        <InstructionPanel />
        <Terminal />
      </div>
      <div className="attackBottom">
        <div>
          VIRTUAL TIME <b>03:11:{String(50 + Math.floor(state.clock)).slice(-2)}</b>
        </div>
      </div>
      <SafetyNotice />
    </main>
  );
}

import { InstructionPanel } from "../components/InstructionPanel";
import { SafetyNotice } from "../components/SafetyNotice";
import { Terminal } from "../components/Terminal";
import { useGame } from "../lib/GameContext";

export function AttackPage() {
  const { state } = useGame();
  return (
    <main className="flex h-screen max-h-screen flex-col gap-2 overflow-hidden bg-[#07111c] p-4 text-slate-100 md:p-6">
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(260px,0.36fr)_minmax(0,0.64fr)] items-stretch gap-4 max-[760px]:grid-cols-1">
        <InstructionPanel />
        <Terminal />
      </div>
      <div className="flex shrink-0 items-center py-1 font-mono text-xs text-slate-500">
        <div>
          VIRTUAL TIME{" "}
          <b className="ml-2 text-slate-200">
            03:11:{String(50 + Math.floor(state.clock)).slice(-2)}
          </b>
        </div>
      </div>
      <SafetyNotice />
    </main>
  );
}

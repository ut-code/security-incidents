import type { ReactNode } from "react";

const tokenPattern =
  /'(?:[^']*)'|"(?:[^"]*)"|https?:\/\/[^\s"'<>]+|\$[A-Za-z_]\w*|--?[A-Za-z][\w-]*|\b(?:nmap|curl|for|in|do|done|rm|clear|help|hint)\b|\b\d+\b/g;

function tokenClass(token: string) {
  if (/^['"]/.test(token)) return "syntax-string";
  if (/^https?:/.test(token)) return "syntax-url";
  if (token.startsWith("$")) return "syntax-variable";
  if (/^--?/.test(token)) return "syntax-option";
  if (/^(for|in|do|done)$/.test(token)) return "syntax-keyword";
  if (/^(nmap|curl|rm|clear|help|hint)$/.test(token)) return "syntax-command";
  return "syntax-number";
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

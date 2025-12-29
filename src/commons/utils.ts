import { Readable, Writable } from "node:stream";
import { once } from "node:events";
import { LogContext } from "./log_context.js";

export const REGEX =
  /^[^\n]*\n[^\n]*\n\s*at\s+(?:(?=[A-Za-z][A-Za-z0-9+.-]*:)|(?<func>[A-Za-z_$][A-Za-z0-9_$<>.]+)[^(]*\()(?<location>[^\n)]*):(?<line>\d+):(?<col>\d+)/;

export function parseStackTrace<MessageT, LevelT>(
  logContext: LogContext<MessageT, LevelT>
): LogContext<MessageT, LevelT> {
  if (logContext.stack) {
    const match = REGEX.exec(logContext.stack);
    const groups = match?.groups;
    if (groups) {
      logContext.func = groups.func;
      logContext.line = groups.line;
      logContext.col = groups.col;
      logContext.location = groups.location;
    }
  }
  return logContext;
}

export interface Descriptor {
  event: string;
  reason?: unknown;
}

export async function race(stream: Readable | Writable, events: string[]): Promise<Descriptor> {
  const onces = [];
  const ac = new AbortController();
  for (const event of events) {
    onces.push(
      once(stream, event, { signal: ac.signal })
        .then(() => ({ event: event }))
        .catch((reason: unknown) => ({ event: event, reason: reason }))
    );
  }
  try {
    return await Promise.race(onces);
  } finally {
    ac.abort();
  }
}

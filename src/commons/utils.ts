import { Readable, Writable } from "node:stream";
import { once } from "node:events";

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

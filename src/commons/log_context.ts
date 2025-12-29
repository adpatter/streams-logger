import { SyslogLevelT } from "./syslog.js";
import { KeysUppercase } from "./types.js";

export interface LogContext<MessageT = string, LevelT = SyslogLevelT> {
  message: MessageT;
  name?: string;
  level: KeysUppercase<LevelT>;
  func?: string;
  line?: string;
  col?: string;
  isotime?: string;
  location?: string;
  pid?: number;
  hostname?: string;
  threadid?: number;
  stack?: string;
  metadata?: unknown;
  label?: string;
}

export function isLogContext<MessageT, LevelT>(value: object): value is LogContext<MessageT, LevelT> {
  return Object.hasOwn(value, "message") && Object.hasOwn(value, "level");
}

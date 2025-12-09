import { Node } from "streams-logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ConsoleHandler<InT = any> extends Node<InT, never> {
  constructor() {
    super(process.stdout);
  }
}

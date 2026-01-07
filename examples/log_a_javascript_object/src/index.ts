import { Logger, Formatter, ConsoleHandler, SyslogLevel } from "streams-logger";

const logger = new Logger<string>({ name: "hello-logger", level: SyslogLevel.DEBUG });
const formatter = new Formatter<string, Record<string, unknown>>({
  format: ({ isotime, message, name, level, func, line, col }) => {
    return { name, isotime, level, func, line, col, message };
  },
});

const consoleHandler = new ConsoleHandler<Record<string, unknown>>({ level: SyslogLevel.DEBUG });

const log = logger.connect(formatter.connect(consoleHandler));

function sayHello() {
  log.info("Hello, World!");
}

class Greeter {
  public greeting: string;
  constructor(greeating = "Hello, World!", repeat = 1) {
    this.greeting = greeating.repeat(repeat);
  }

  speak() {
    log.info(this.greeting);
  }
}

setInterval(sayHello, 3e3);

sayHello();

const greeter = new Greeter();

greeter.speak();

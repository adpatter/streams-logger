import { Logger, Formatter, ConsoleHandler, SyslogLevel } from "streams-logger";
import chalk from "chalk";

const logger = new Logger({ name: "hello-logger", level: SyslogLevel.DEBUG });
const formatter = new Formatter({
  format: ({ isotime, message, name, level, func, line, col }) => {
    const _level = level != "ERROR" ? chalk.green(level) : chalk.red(level);
    name = chalk.blue(name);
    isotime = chalk.grey(isotime);
    func = chalk.magenta(func);
    line = chalk.cyan(line);
    col = chalk.cyan(col);
    message = chalk.white(message);
    const data = `${name}:${isotime}:${_level}:${func}:${line}:${col}:${message}\n`;
    return data;
  },
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

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

  shout() {
    log.error(this.greeting);
  }
}

setTimeout(sayHello, 1e3);

sayHello();

const greeter = new Greeter();

greeter.speak();

greeter.shout();

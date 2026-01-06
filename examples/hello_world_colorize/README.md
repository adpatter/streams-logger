# _An Instance of Colorized "Hello, World!"_

## Introduction

In this example you will use Streams in order to log "Hello, World!" to the console.

## Implement the example

### Implement the `index.ts` module

#### Import the Logger, Formatter, ConsoleHandler, SyslogLevel enum and the external chalk library.

```ts
import { Logger, Formatter, ConsoleHandler, SyslogLevel } from "streams-logger";
import chalk from "chalk";
```

#### Create an instance of a Logger, Formatter, and ConsoleHandler.

```ts
const logger = new Logger({ name: "hello-logger", level: SyslogLevel.DEBUG });
const formatter = new Formatter({
  format: ({ isotime, message, name, level, func, line, col }) => {
    const data = `${halk.blue(name)}:${chalk.grey(isotime)}:${
      level != "ERROR" ? chalk.green(level) : chalk.red(level)
    }:${chalk.magenta(func)}:${chalk.cyan(line)}:${chalk.cyan(col)}:${chalk.white(message)}\n`;
    return data;
  },
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });
```

#### Connect the Logger to the Formatter and connect the Formatter to the ConsoleHandler.

```ts
const log = logger.connect(formatter.connect(consoleHandler));
```

#### Log "Hello, World!" to the console.

```ts
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
```

## Run the example

### How to run the example

#### Clone the _Streams_ repository.

```bash
git clone https://github.com/far-analytics/streams-logger.git
```

#### Change directory into the relevant example directory.

```bash
cd streams-logger/examples/hello_world_colorize
```

#### Install the example dependencies.

```bash
npm install && npm update
```

#### Build the application.

```bash
npm run clean:build
```

#### Run the application.

```bash
npm start
```

##### Output
 <pre
      class="western"
    ><font color="#000000"><span style="background: #000000"><font color="#2472c8">hello-logger</font>:<font color="#666666">2026-01-06T22:34:33.214Z</font>:<font color="#0dbc79">INFO</font>:<font color="#bc3fbc">sayHello</font>:<font color="#11a8cd">13</font>:<font color="#11a8cd">9</font>:<font color="#e5e5e5">Hello, World!</font>                                                                                                                               </span></font>
<font color="#000000"><span style="background: #000000"><font color="#2472c8">hello-logger</font>:<font color="#666666">2026-01-06T22:34:33.216Z</font>:<font color="#0dbc79">INFO</font>:<font color="#bc3fbc">Greeter.speak</font>:<font color="#11a8cd">21</font>:<font color="#11a8cd">13</font>:<font color="#e5e5e5">Hello, World!</font>                                                                                                                         </span></font>
<font color="#000000"><span style="background: #000000"><font color="#2472c8">hello-logger</font>:<font color="#666666">2026-01-06T22:34:33.217Z</font>:<font color="#cd3131">ERROR</font>:<font color="#bc3fbc">Greeter.shout</font>:<font color="#11a8cd">24</font>:<font color="#11a8cd">13</font>:<font color="#e5e5e5">Hello, World!</font>                                                                                                                        </span></font>
<font color="#000000"><span style="background: #000000"><font color="#2472c8">hello-logger</font>:<font color="#666666">2026-01-06T22:34:34.215Z</font>:<font color="#0dbc79">INFO</font>:<font color="#bc3fbc">Timeout.sayHello</font>:<font color="#11a8cd">13</font>:<font color="#11a8cd">9</font>:<font color="#e5e5e5">Hello, World!</font>  </span></font></pre>
